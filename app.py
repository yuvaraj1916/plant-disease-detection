import io
import base64

import numpy as np
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from pytorch_grad_cam import HiResCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from pytorch_grad_cam.utils.image import show_cam_on_image

import matplotlib
matplotlib.use("Agg")

# ---- App setup ----
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Load model once at startup ----
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

checkpoint = torch.load("best_plant_disease_model.pth", map_location=device)
class_names = checkpoint["class_names"]
num_classes = len(class_names)

model = models.efficientnet_b0(weights=None)
in_features = model.classifier[1].in_features
model.classifier[1] = nn.Linear(in_features, num_classes)
model.load_state_dict(checkpoint["model_state_dict"])
model = model.to(device)
model.eval()

target_layers = [model.features[-1]]
cam = HiResCAM(model=model, target_layers=target_layers)

IMG_SIZE = 224
preprocess = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

print(f"Model loaded. Classes: {class_names}")


# ---- Guardrail helpers ----

def is_likely_leaf(pil_image, green_threshold=0.15):
    """Quick heuristic: checks if image has enough green/plant-like pixels
    to plausibly be a leaf photo, rejecting obvious non-leaf inputs
    like screenshots, UI captures, or random photos."""
    img_small = pil_image.resize((100, 100))
    img_array = np.array(img_small) / 255.0

    r, g, b = img_array[:, :, 0], img_array[:, :, 1], img_array[:, :, 2]

    # "Green-ish" pixel: green channel notably higher than red and blue
    green_mask = (g > r * 0.9) & (g > b * 0.9) & (g > 0.2)
    green_ratio = green_mask.sum() / green_mask.size

    return green_ratio >= green_threshold


MIN_CONFIDENCE_THRESHOLD = 0.5


# ---- Routes ----

@app.get("/")
def root():
    return {"status": "Plant Disease Detection API is running"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Read uploaded image
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")

    # Guardrail 1: reject images that don't look like leaves at all
    if not is_likely_leaf(img):
        return {
            "predicted_class": None,
            "confidence": 0,
            "heatmap_image": None,
            "error": "This doesn't appear to be a plant leaf image. Please upload a clear photo of a leaf."
        }

    img_resized = img.resize((IMG_SIZE, IMG_SIZE))
    rgb_img = np.array(img_resized) / 255.0

    input_tensor = preprocess(img).unsqueeze(0).to(device)

    # Predict
    with torch.no_grad():
        output = model(input_tensor)
        probs = torch.softmax(output, dim=1)[0]
        pred_idx = probs.argmax().item()
        confidence = probs[pred_idx].item()

    # Guardrail 2: reject low-confidence / ambiguous predictions
    if confidence < MIN_CONFIDENCE_THRESHOLD:
        return {
            "predicted_class": None,
            "confidence": round(confidence, 4),
            "heatmap_image": None,
            "error": "Low confidence prediction. Please upload a clearer leaf image."
        }

    predicted_class = class_names[pred_idx]

    # HiResCAM heatmap
    targets = [ClassifierOutputTarget(pred_idx)]
    grayscale_cam = cam(input_tensor=input_tensor, targets=targets)
    grayscale_cam = grayscale_cam[0, :]
    visualization = show_cam_on_image(rgb_img.astype(np.float32), grayscale_cam, use_rgb=True)

    # Convert heatmap image to base64 string
    heatmap_pil = Image.fromarray(visualization)
    buffer = io.BytesIO()
    heatmap_pil.save(buffer, format="PNG")
    heatmap_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return {
        "predicted_class": predicted_class,
        "confidence": round(confidence, 4),
        "heatmap_image": heatmap_base64
    }