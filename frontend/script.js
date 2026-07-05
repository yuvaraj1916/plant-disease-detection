/* script.js - LeafScan AI Premium Controller */

// Plant Disease Database (JS Lookup Object)
const DISEASE_DATABASE = {
  "apple scab": {
    name: "Apple Scab",
    description: "A fungal disease caused by Venturia inaequalis. It infects apple leaves, blossoms, and fruit, creating dark olive-green to black velvety spots.",
    treatment: "Rake and destroy fallen leaves in autumn to prevent spore overwintering. Prune trees to maximize air flow and sunlight penetration. Apply copper-based or sulfur-based fungicides at bud break and early leaf development."
  },
  "apple black rot": {
    name: "Apple Black Rot",
    description: "A fungal disease caused by Botryosphaeria obtusa. It symptoms include purple-rimmed brown spots on leaves ('frog-eye spot'), cankers on bark, and rotten black rings on fruits.",
    treatment: "Prune dead or diseased branches and remove mummified fruit during winter. Ensure tools are sanitized between cuts. Apply appropriate fungicides from the green tip stage through petal fall."
  },
  "cedar apple rust": {
    name: "Cedar Apple Rust",
    description: "A complex fungal disease requiring both apple trees and red cedars (Juniperus virginiana) to complete its lifecycle. Causes striking, bright orange-yellow spots on upper leaf surfaces.",
    treatment: "Remove nearby cedar trees if feasible. Plant rust-resistant apple cultivars. Apply protective systemic fungicides when cedar galls begin swelling and dripping orange gelatinous horns in spring."
  },
  "grape black rot": {
    name: "Grape Black Rot",
    description: "A highly destructive disease caused by Guignardia bidwellii. Leaves develop small, circular tan spots with dark brown borders. Grapes turn black, shrivel, and mummify.",
    treatment: "Practice strict sanitation by removing and burning infected vines and mummified berries. Prune canopy to promote rapid drying. Spray copper-based organic fungicides or chemical equivalents early in the season."
  },
  "grape esca (black measles)": {
    name: "Grape Esca (Black Measles)",
    description: "A wood-decaying fungal complex. Leads to dramatic tiger-striping (yellowing and necrosis) on foliage, and dark purple speckling on developing grapes.",
    treatment: "Protect large pruning wounds with pruning sealants to prevent spore ingress. Avoid pruning during wet conditions. Cut away infected trunk sections until clean wood is reached."
  },
  "grape leaf blight": {
    name: "Grape Leaf Blight",
    description: "Caused by the fungus Isariopsis clavispora. It causes large, irregular brown necrotic lesions on foliage, leading to premature leaf drop and weakened vines.",
    treatment: "Ensure adequate vine spacing and pruning for airflow. Clean up crop debris. Apply defensive copper sprays or late-season fungicides to preserve foliage health."
  },
  "peach bacterial spot": {
    name: "Peach Bacterial Spot",
    description: "A bacterial infection caused by Xanthomonas campestris pv. pruni. It triggers pale green/yellow spots that turn brown and fall out, leaving a shot-hole pattern.",
    treatment: "Avoid overhead sprinklers to minimize moisture spread. Ensure optimal fertilization to keep trees vigorous. Apply preventative bactericides containing copper or oxytetracycline in early spring."
  },
  "potato early blight": {
    name: "Potato Early Blight",
    description: "A fungal disease caused by Alternaria solani. It manifests as dark spots with distinctive concentric rings (target-like patterns) on mature foliage.",
    treatment: "Rotate crops with non-solanaceous plants annually. Maintain healthy soil nutrition. Apply organic copper sprays or preventative fungicides at the first sign of lower-leaf lesions."
  },
  "potato late blight": {
    name: "Potato Late Blight",
    description: "A highly aggressive oomycete pathogen (Phytophthora infestans) that causes dark, water-soaked leaf spots with white fuzzy mold on the leaf undersides in humid weather.",
    treatment: "Plant certified disease-free seed tubers. Remove volunteer potatoes. Apply defensive copper fungicides prior to rainy periods. Immediately destroy infected plants to stop rapid airborne spreading."
  },
  "tomato early blight": {
    name: "Tomato Early Blight",
    description: "Caused by Alternaria solani. It starts as dark brown spots with target-board concentric rings on old leaves, progressing upwards and causing severe leaf yellowing.",
    treatment: "Mulch the soil base heavily to prevent spores splashing up from dirt. Prune the bottom 12 inches of leaves to improve ventilation. Apply preventative copper fungicides weekly in humid weather."
  },
  "tomato late blight": {
    name: "Tomato Late Blight",
    description: "Caused by Phytophthora infestans. Leaves and stems quickly develop greasy, dark brown patches that can rot entire plants in a matter of days under cool, wet conditions.",
    treatment: "Avoid overhead watering; use drip systems. Grow resistant tomato varieties. Remove and safely dispose of infested plants (do not compost). Spray protective copper fungicide."
  },
  "tomato leaf mold": {
    name: "Tomato Leaf Mold",
    description: "A fungal disease caused by Passalora fulva, primarily attacking greenhouse tomatoes. Produces pale yellow spots on upper leaf surfaces and pale olive-green mold on the undersides.",
    treatment: "Keep relative humidity levels below 85% with fans and venting. Avoid wet leaves. Spray sulfur-based preventative remedies or organic leaf-mold treatments."
  },
  "tomato spider mites": {
    name: "Tomato Spider Mites",
    description: "Infestation of Two-spotted spider mites (Tetranychus urticae). Results in fine, yellow stippling across leaves. In advanced stages, delicate silk webbing coats stems and leaf margins.",
    treatment: "Introduce predatory mites (Phytoseiulus persimilis) as a biological control. Spray infected areas thoroughly with insecticidal soaps, horticultural oils, or neem oil, especially under the leaves."
  },
  "tomato yellow leaf curl virus": {
    name: "Tomato Yellow Leaf Curl Virus",
    description: "A virus transmitted by Silverleaf whiteflies. Newly formed leaves become highly stunted, curl upward/inward cup-like, and turn pale yellow. Plants stop producing fruit.",
    treatment: "Control whiteflies immediately using insecticidal soaps, yellow sticky cards, or row covers. Remove and destroy virus-infected plants immediately to protect nearby crops."
  },
  "healthy leaf": {
    name: "Healthy Leaf",
    description: "No pathogenic infections, viral symptoms, or pest damage detected. The leaf exhibits strong structural integrity, rich natural green pigmentation, and clean, healthy veins.",
    treatment: "Maintain existing growth guidelines: consistent bottom-watering, correct sunlight schedule, balanced fertilizer input, and routine inspections to sustain optimal plant health."
  }
};

// Application State
let selectedFile = null;
let originalImageDataUrl = null;
let isDemoMode = true; // Enabled by default for immediate trial inside previews
let historyList = [];

// DOM Element Selectors
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const btnBrowse = document.getElementById('btnBrowse');
const btnAnalyze = document.getElementById('btnAnalyze');
const loadingWrapper = document.getElementById('loadingWrapper');
const resultsSection = document.getElementById('resultsSection');
const errorBanner = document.getElementById('errorBanner');
const themeToggle = document.getElementById('themeToggle');
const demoToggle = document.getElementById('demoToggle');
const historyListContainer = document.getElementById('historyList');

// Image result containers
const resultOriginalImg = document.getElementById('resultOriginalImg');
const resultHeatmapImg = document.getElementById('resultHeatmapImg');
const resultDiseaseName = document.getElementById('resultDiseaseName');
const confidenceFillCircle = document.getElementById('confidenceFillCircle');
const confidenceValueText = document.getElementById('confidenceValueText');
const resultStatusBadge = document.getElementById('resultStatusBadge');
const resultDescription = document.getElementById('resultDescription');
const resultTreatment = document.getElementById('resultTreatment');

// Initialize Theme from localStorage
function initTheme() {
  const storedTheme = localStorage.getItem('leafscan-theme');
  if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

// Toggle Theme Handler
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const activeTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  localStorage.setItem('leafscan-theme', activeTheme);
});

// Setup Demo Mode Switch Listener
demoToggle.addEventListener('change', (e) => {
  isDemoMode = e.target.checked;
});

// Setup File Browse Button click
btnBrowse.addEventListener('click', (e) => {
  e.stopPropagation(); // prevent double triggers on parent containers
  fileInput.click();
});

// File Selection Handler
fileInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    handleFileSelection(e.target.files[0]);
  }
});

// Drag & Drop Listeners
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    handleFileSelection(e.dataTransfer.files[0]);
  }
});

// Handle File upload flow
function handleFileSelection(file) {
  // Check if file is actually an image
  if (!file.type.startsWith('image/')) {
    showError("Invalid File Type", "Please select a valid image file (PNG, JPG, or JPEG).");
    return;
  }
  
  selectedFile = file;
  hideError();

  const reader = new FileReader();
  reader.onload = (e) => {
    originalImageDataUrl = e.target.result;
    renderThumbnailPreview(originalImageDataUrl);
    btnAnalyze.disabled = false;
  };
  reader.onerror = () => {
    showError("File Reading Failed", "Unable to read the selected file. Please try again.");
  };
  reader.readAsDataURL(file);
}

// Render selected image as thumbnail preview inside the drop zone
function renderThumbnailPreview(dataUrl) {
  // Remove existing preview if any
  const existingPreview = dropZone.querySelector('.thumbnail-preview');
  if (existingPreview) {
    existingPreview.remove();
  }

  const previewDiv = document.createElement('div');
  previewDiv.className = 'thumbnail-preview';

  const img = document.createElement('img');
  img.src = dataUrl;
  img.alt = "Selected plant leaf preview";

  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-btn';
  removeBtn.innerHTML = '<i data-lucide="x"></i>';
  removeBtn.title = "Remove image";

  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent opening file selection dialog
    clearSelectedFile();
  });

  const scanLine = document.createElement('div');
  scanLine.className = 'scanning-overlay';

  previewDiv.appendChild(img);
  previewDiv.appendChild(removeBtn);
  previewDiv.appendChild(scanLine);
  dropZone.appendChild(previewDiv);

  lucide.createIcons();
}

// Reset dropzone back to initial state
function clearSelectedFile() {
  selectedFile = null;
  originalImageDataUrl = null;
  btnAnalyze.disabled = true;

  const preview = dropZone.querySelector('.thumbnail-preview');
  if (preview) {
    preview.remove();
  }
  
  fileInput.value = ''; // Reset input element
}

// Error Management
function showError(title, message) {
  errorBanner.querySelector('h4').textContent = title;
  errorBanner.querySelector('p').textContent = message;
  errorBanner.classList.remove('hidden');
  errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError() {
  errorBanner.classList.add('hidden');
}

// Manual retry click helper in error banner
document.getElementById('errorRetryBtn').addEventListener('click', () => {
  hideError();
  if (selectedFile) {
    analyzeLeaf();
  }
});

// Click Analyze Trigger
btnAnalyze.addEventListener('click', analyzeLeaf);

// Main Analysis Function
function analyzeLeaf() {
  if (!selectedFile) return;

  hideError();
  resultsSection.classList.add('hidden');
  loadingWrapper.classList.remove('hidden');
  btnAnalyze.disabled = true;

  // Scroll to loading area smoothly
  loadingWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });

  if (isDemoMode) {
    // Run Simulated Premium demo mode
    setTimeout(() => {
      runSimulation();
    }, 1800); // realistic delay
  } else {
    // Send to live Local API endpoint
    const formData = new FormData();
    formData.append('file', selectedFile);




   fetch('http://127.0.0.1:8000/predict', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server responded with HTTP status ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // NEW: handle guardrail errors from backend (not-a-leaf, low confidence)
      if (data.error) {
        loadingWrapper.classList.add('hidden');
        btnAnalyze.disabled = false;
        showError("Unable to Analyze Image", data.error);
        return;
      }
      processResult(data.predicted_class, data.confidence, data.heatmap_image);
    })
    .catch(err => {
      console.error("Local API Error:", err);
      loadingWrapper.classList.add('hidden');
      btnAnalyze.disabled = false;
      showError(
        "Connection Offline / API Unavailable", 
        `Could not reach the prediction server at http://127.0.0.1:8000/predict. Make sure your local python backend is running. If you are just exploring, toggle "Simulation Mode" on above to inspect full UI results.`
      );
    });
     


  }
}

// Generate high quality diagnostic heatmap from original image
function generateHeatmap(dataUrl, callback) {
  const img = new Image();
  img.src = dataUrl;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set matching dimensions
    canvas.width = img.naturalWidth || 600;
    canvas.height = img.naturalHeight || 450;
    
    // Draw original image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Create random hotspots reflecting diagnostic focus areas (HiResCAM)
    const pointsCount = Math.floor(Math.random() * 3) + 2; // 2-4 heat focus areas
    for (let i = 0; i < pointsCount; i++) {
      const x = canvas.width * (0.3 + Math.random() * 0.4);
      const y = canvas.height * (0.3 + Math.random() * 0.4);
      const radius = Math.min(canvas.width, canvas.height) * (0.15 + Math.random() * 0.15);
      
      // Create radial glow
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      // Red core (hottest focus area), fading to orange, yellow, and transparent
      grad.addColorStop(0, 'rgba(230, 57, 70, 0.65)');
      grad.addColorStop(0.3, 'rgba(214, 140, 69, 0.45)');
      grad.addColorStop(0.6, 'rgba(244, 162, 97, 0.25)');
      grad.addColorStop(1, 'rgba(64, 145, 108, 0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Convert to base64
    callback(canvas.toDataURL('image/png'));
  };
  img.onerror = () => {
    // fallback if image fails
    callback(dataUrl);
  };
}

// Run simulation logic
function runSimulation() {
  // Determine standard keys
  const diseaseKeys = Object.keys(DISEASE_DATABASE);
  // Pick random disease
  const randomKey = diseaseKeys[Math.floor(Math.random() * diseaseKeys.length)];
  const confidence = (0.65 + Math.random() * 0.33).toFixed(4); // 65% - 98%

  generateHeatmap(originalImageDataUrl, (heatmapBase64) => {
    // Process results exactly as API schema would output (decimal confidence 0-1)
    processResult(randomKey, parseFloat(confidence), heatmapBase64);
  });
}

// Process prediction results
function processResult(predictedClass, confidenceDecimal, heatmapDataUrl) {
  loadingWrapper.classList.add('hidden');
  btnAnalyze.disabled = false;

  // Normalise disease name key from response (e.g. "Apple_Scab" or "Tomato___Early_blight" -> "apple scab")
  let cleanKey = predictedClass.toLowerCase()
    .replace(/[_]+/g, ' ')
    .replace(/[\s]+/g, ' ')
    .trim();

  // Try direct match or substring match in our disease lookup database
  let match = DISEASE_DATABASE[cleanKey];
  if (!match) {
    // search for substring match
    for (const key of Object.keys(DISEASE_DATABASE)) {
      if (cleanKey.includes(key) || key.includes(cleanKey)) {
        match = DISEASE_DATABASE[key];
        break;
      }
    }
  }

  // Fallback if not found in database
  if (!match) {
    match = {
      name: predictedClass,
      description: "An unclassified leaf condition has been detected. AI patterns isolated significant visual anomalies on the leaf structure.",
      treatment: "Perform general crop isolation. Prune the affected foliage and consult local agricultural extension specialists. Apply a balanced organic protective wash."
    };
  }

  // Set visual elements
  resultOriginalImg.src = originalImageDataUrl;
  resultHeatmapImg.src = heatmapDataUrl.startsWith('data:') ? heatmapDataUrl : `data:image/png;base64,${heatmapDataUrl}`;
  resultDiseaseName.textContent = match.name;
  
  // Calculate confidence percentage
  const percent = Math.round(confidenceDecimal * 100);
  confidenceValueText.textContent = `${percent}%`;

  // Set Progress ring SVG fill
  // Circular Path Radius: r=52, Circumference = 2 * PI * 52 = 326.72
  const circ = 326.72;
  const offset = circ - (percent / 100) * circ;
  
  // Reset dashoffset transitions cleanly
  confidenceFillCircle.style.strokeDashoffset = circ;
  // Trigger flow reflow for restart animation
  void confidenceFillCircle.offsetWidth;
  confidenceFillCircle.style.strokeDashoffset = offset;

  // Determine color coding & status badge classes
  let colorClass = 'green';
  let badgeLabel = 'High Confidence';
  
  if (percent >= 90) {
    colorClass = 'green';
    badgeLabel = 'High Confidence';
  } else if (percent >= 70) {
    colorClass = 'amber';
    badgeLabel = 'Moderate Confidence';
  } else {
    colorClass = 'red';
    badgeLabel = 'Low Confidence';
  }

  // Set classes
  confidenceFillCircle.className.baseVal = `confidence-fill-circle ${colorClass}`;
  resultStatusBadge.className = `status-badge ${colorClass}`;
  resultStatusBadge.innerHTML = `
    <i data-lucide="${colorClass === 'green' ? 'check-circle' : colorClass === 'amber' ? 'alert-triangle' : 'alert-circle'}"></i>
    <span>${badgeLabel}</span>
  `;

  // Description & Treatment Card
  resultDescription.textContent = match.description;
  resultTreatment.textContent = match.treatment;

  // Reveal results
  resultsSection.classList.remove('hidden');
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Add to History session array
  addToHistory(match.name, percent, originalImageDataUrl, heatmapDataUrl, match.description, match.treatment, colorClass);

  lucide.createIcons();
}

// Add prediction to session history array
function addToHistory(name, percent, originalImg, heatmapImg, desc, treat, colorClass) {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const id = Date.now().toString();

  const historyItem = {
    id,
    name,
    percent,
    originalImg,
    heatmapImg,
    desc,
    treat,
    colorClass,
    timestamp
  };

  // Prepend to array
  historyList.unshift(historyItem);
  renderHistoryList();
}

// Render History Panel items
function renderHistoryList() {
  // Update header count
  document.getElementById('historyCount').textContent = historyList.length;

  if (historyList.length === 0) {
    historyListContainer.innerHTML = `
      <div class="history-list-empty" id="historyEmptyState">
        <i data-lucide="history" style="width: 32px; height: 32px;"></i>
        <p>No scans performed yet in this session</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Render scan records
  historyListContainer.innerHTML = '';
  historyList.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = `history-item ${index === 0 ? 'active' : ''}`;
    card.dataset.id = item.id;

    card.innerHTML = `
      <div class="history-item-thumb">
        <img src="${item.originalImg}" alt="Thumbnail">
      </div>
      <div class="history-item-info">
        <div class="history-item-name">${item.name}</div>
        <div class="history-item-meta">
          <span class="history-item-conf ${item.colorClass}">${item.percent}% Match</span>
          <span class="history-item-time">${item.timestamp}</span>
        </div>
      </div>
    `;

    // Click handler to re-load previous scans from list
    card.addEventListener('click', () => {
      loadHistoryItem(item.id);
    });

    historyListContainer.appendChild(card);
  });

  lucide.createIcons();
}

// Load previously run diagnostic record
function loadHistoryItem(id) {
  const item = historyList.find(x => x.id === id);
  if (!item) return;

  // Highlight active
  document.querySelectorAll('.history-item').forEach(el => {
    el.classList.remove('active');
    if (el.dataset.id === id) {
      el.classList.add('active');
    }
  });

  // Load results smoothly
  resultsSection.classList.add('hidden');
  
  setTimeout(() => {
    resultOriginalImg.src = item.originalImg;
    resultHeatmapImg.src = item.heatmapImg;
    resultDiseaseName.textContent = item.name;
    confidenceValueText.textContent = `${item.percent}%`;

    const circ = 326.72;
    const offset = circ - (item.percent / 100) * circ;
    confidenceFillCircle.style.strokeDashoffset = offset;

    confidenceFillCircle.className.baseVal = `confidence-fill-circle ${item.colorClass}`;
    resultStatusBadge.className = `status-badge ${item.colorClass}`;
    resultStatusBadge.innerHTML = `
      <i data-lucide="${item.colorClass === 'green' ? 'check-circle' : item.colorClass === 'amber' ? 'alert-triangle' : 'alert-circle'}"></i>
      <span>${item.colorClass === 'green' ? 'High Confidence' : item.colorClass === 'amber' ? 'Moderate Confidence' : 'Low Confidence'}</span>
    `;

    resultDescription.textContent = item.desc;
    resultTreatment.textContent = item.treat;

    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    lucide.createIcons();
  }, 150);
}

// Initial Setup execution
initTheme();
renderHistoryList();
lucide.createIcons();
