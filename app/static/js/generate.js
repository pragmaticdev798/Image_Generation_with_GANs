/* ========================================
   GENERATE PAGE FUNCTIONALITY
   ======================================== */

// State management
const state = {
    modelLoaded: false,
    currentCheckpoint: null,
    generatedImages: [],
    isGenerating: false,
    totalGenerated: 0
};

// DOM Elements
let checkpointSelect, loadModelBtn, numImagesSlider, seedInput, generateBtn, clearBtn;
let modelStatus, loadingIndicator, galleryGrid, latestContainer, latestFace;
let generationStats, totalGeneratedSpan, generationTimeSpan;
let imageModal, modalImage, modalImagePath;

/**
 * Initialize page
 */
document.addEventListener('DOMContentLoaded', async function() {
    initializeElements();
    loadCheckpoints();
    setupEventListeners();
    loadModelInfo();
});

/**
 * Initialize DOM elements
 */
function initializeElements() {
    checkpointSelect = document.getElementById('checkpoint-select');
    loadModelBtn = document.getElementById('load-model-btn');
    numImagesSlider = document.getElementById('num-images');
    seedInput = document.getElementById('seed-input');
    generateBtn = document.getElementById('generate-btn');
    clearBtn = document.getElementById('clear-btn');
    modelStatus = document.getElementById('model-status');
    loadingIndicator = document.getElementById('loading-indicator');
    galleryGrid = document.getElementById('gallery-grid');
    latestContainer = document.getElementById('latest-container');
    latestFace = document.getElementById('latest-face');
    generationStats = document.getElementById('generation-stats');
    totalGeneratedSpan = document.getElementById('total-generated');
    generationTimeSpan = document.getElementById('generation-time');
    imageModal = document.getElementById('image-modal');
    modalImage = document.getElementById('modal-image');

    setupSliderDisplay();
    setupModalControls();
}

/**
 * Setup slider value display
 */
function setupSliderDisplay() {
    const valueDisplay = document.getElementById('num-images-value');
    numImagesSlider.addEventListener('input', function() {
        valueDisplay.textContent = this.value;
    });
}

/**
 * Setup modal controls
 */
function setupModalControls() {
    const modalClose = document.querySelector('.modal-close');
    const modalCloseBtn = document.querySelector('.modal-close-btn');

    modalClose.addEventListener('click', closeImageModal);
    modalCloseBtn.addEventListener('click', closeImageModal);

    imageModal.addEventListener('click', function(e) {
        if (e.target === imageModal) {
            closeImageModal();
        }
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    loadModelBtn.addEventListener('click', loadModel);
    generateBtn.addEventListener('click', generateFaces);
    clearBtn.addEventListener('click', clearGallery);

    // Disable generate button until model is loaded
    generateBtn.disabled = true;
}

/**
 * Load available checkpoints
 */
async function loadCheckpoints() {
    try {
        const response = await fetchAPI('/api/get-checkpoints');
        const checkpoints = response.checkpoints || [];

        // Clear existing options
        checkpointSelect.innerHTML = '';

        if (checkpoints.length === 0) {
            checkpointSelect.innerHTML = '<option value="">No checkpoints found</option>';
            return;
        }

        // Add options
        checkpoints.forEach(checkpoint => {
            const option = document.createElement('option');
            option.value = checkpoint;
            option.textContent = checkpoint;
            checkpointSelect.appendChild(option);
        });

        // Select latest checkpoint by default
        if (checkpoints.length > 0) {
            checkpointSelect.value = checkpoints[0];
        }

        showNotification(`Found ${checkpoints.length} checkpoints`, 'success', 2000);
    } catch (error) {
        console.error('Error loading checkpoints:', error);
        showNotification('Failed to load checkpoints', 'error');
        checkpointSelect.innerHTML = '<option value="">Error loading checkpoints</option>';
    }
}

/**
 * Load model from checkpoint
 */
async function loadModel() {
    const selectedCheckpoint = checkpointSelect.value;

    if (!selectedCheckpoint) {
        showNotification('Please select a checkpoint', 'error');
        return;
    }

    try {
        loadModelBtn.disabled = true;
        loadModelBtn.textContent = 'Loading...';
        showNotification('Loading model...', 'info', 5000);

        const response = await fetchAPI('/api/load-model', 'POST', {
            checkpoint_name: selectedCheckpoint
        });

        if (response.success) {
            state.modelLoaded = true;
            state.currentCheckpoint = selectedCheckpoint;

            // Update UI
            updateModelStatus(true);
            generateBtn.disabled = false;
            loadModelBtn.textContent = 'Model Loaded ✓';
            showNotification(`Model loaded: ${selectedCheckpoint}`, 'success');
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        console.error('Error loading model:', error);
        showNotification(`Error: ${error.message}`, 'error');
        loadModelBtn.textContent = 'Load Model';
    } finally {
        loadModelBtn.disabled = false;
    }
}

/**
 * Update model status indicator
 */
function updateModelStatus(loaded) {
    const statusDot = modelStatus.querySelector('.status-dot');
    const statusText = modelStatus.querySelector('.status-text');

    if (loaded) {
        statusDot.classList.add('loaded');
        statusText.textContent = `Model loaded: ${state.currentCheckpoint}`;
    } else {
        statusDot.classList.remove('loaded');
        statusText.textContent = 'Model not loaded';
    }
}

/**
 * Generate faces
 */
async function generateFaces() {
    if (!state.modelLoaded) {
        showNotification('Please load a model first', 'error');
        return;
    }

    const numImages = parseInt(numImagesSlider.value);
    const seed = seedInput.value ? parseInt(seedInput.value) : null;

    try {
        state.isGenerating = true;
        generateBtn.disabled = true;
        showLoadingIndicator(true);
        clearGalleryUI();

        const startTime = Date.now();
        showNotification(`Generating ${numImages} faces...`, 'info', 10000);

        const response = await fetchAPI('/api/generate', 'POST', {
            num_images: numImages,
            seed: seed
        });

        if (!response.success) {
            throw new Error(response.message);
        }

        const images = response.images || [];
        displayGeneratedImages(images);

        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
        updateGenerationStats(images.length, elapsedTime);

        showNotification(`Generated ${images.length} faces in ${elapsedTime}s`, 'success');

    } catch (error) {
        console.error('Error generating faces:', error);
        showNotification(`Error: ${error.message}`, 'error');
    } finally {
        state.isGenerating = false;
        generateBtn.disabled = false;
        showLoadingIndicator(false);
    }
}

/**
 * Display generated images
 */
function displayGeneratedImages(images) {
    state.generatedImages = images;

    // Update latest face
    if (images.length > 0) {
        latestFace.src = images[0].data;
        latestContainer.classList.remove('hidden');
        modalImagePath = images[0].filename;
    }

    // Create gallery items
    const galleryHTML = images.map((img, index) => `
        <div class="gallery-item" onclick="openImageModal('${img.data}', '${img.filename}')">
            <img src="${img.data}" alt="Generated face ${index + 1}" loading="lazy">
            <div class="gallery-item-overlay">
                <button class="gallery-item-button" onclick="event.stopPropagation(); downloadGeneratedImage('${img.data}', '${img.filename}')">
                    ⬇️ Download
                </button>
                <button class="gallery-item-button" onclick="event.stopPropagation(); openImageModal('${img.data}', '${img.filename}')">
                    🔍 View
                </button>
            </div>
        </div>
    `).join('');

    galleryGrid.innerHTML = galleryHTML;
}

/**
 * Update generation statistics
 */
function updateGenerationStats(count, time) {
    state.totalGenerated += count;
    totalGeneratedSpan.textContent = state.totalGenerated;
    generationTimeSpan.textContent = time + 's';
    generationStats.classList.remove('hidden');
}

/**
 * Open image modal
 */
function openImageModal(imageSrc, filename) {
    modalImage.src = imageSrc;
    modalImagePath = filename;
    imageModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Close image modal
 */
function closeImageModal() {
    imageModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

/**
 * Download generated image
 */
function downloadGeneratedImage(imageSrc, filename) {
    downloadImage(imageSrc, filename);
    showNotification('Image downloaded', 'success', 2000);
}

/**
 * Download latest image
 */
function downloadLatestImage() {
    if (state.generatedImages.length > 0) {
        const latest = state.generatedImages[0];
        downloadImage(latest.data, latest.filename);
        showNotification('Image downloaded', 'success', 2000);
    }
}

/**
 * Download modal image
 */
function downloadModalImage() {
    const imageSrc = modalImage.src;
    const filename = modalImagePath || 'generated_face.png';
    downloadImage(imageSrc, filename);
    showNotification('Image downloaded', 'success', 2000);
}

/**
 * Show/hide loading indicator
 */
function showLoadingIndicator(show) {
    if (show) {
        loadingIndicator.classList.remove('hidden');
        updateProgressAnimation();
    } else {
        loadingIndicator.classList.add('hidden');
    }
}

/**
 * Update progress animation
 */
function updateProgressAnimation() {
    const progressText = document.getElementById('progress-text');
    let progress = 0;

    const interval = setInterval(() => {
        if (state.isGenerating && progress < 90) {
            progress += Math.random() * 40;
            if (progress > 90) progress = 90;
            progressText.textContent = Math.floor(progress) + '%';
        } else {
            clearInterval(interval);
        }
    }, 300);
}

/**
 * Clear gallery
 */
function clearGallery() {
    if (confirm('Clear all generated images?')) {
        clearGalleryUI();
        state.generatedImages = [];
        showNotification('Gallery cleared', 'success', 2000);
    }
}

/**
 * Clear gallery UI
 */
function clearGalleryUI() {
    galleryGrid.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">📸</div>
            <p>Generated faces will appear here</p>
            <small>Load a model and click generate to start</small>
        </div>
    `;
    latestContainer.classList.add('hidden');
    generationStats.classList.add('hidden');
}

/**
 * Load model info on page load
 */
async function loadModelInfo() {
    try {
        const response = await fetchAPI('/api/get-model-info');
        console.log('Model info:', response);

        if (response.is_loaded) {
            state.modelLoaded = true;
            state.currentCheckpoint = response.model_config.checkpoint_path;
            updateModelStatus(true);
            generateBtn.disabled = false;
        }
    } catch (error) {
        console.warn('Model not loaded on startup:', error);
    }
}

/**
 * Export gallery as grid
 */
function exportGalleryAsGrid() {
    if (state.generatedImages.length === 0) {
        showNotification('No images to export', 'error');
        return;
    }

    showNotification('Exporting gallery... This will open in a new tab', 'info', 3000);

    // Create a canvas with all images
    const canvasSize = 500;
    const itemSize = canvasSize / 3;
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');

    let itemIndex = 0;
    state.generatedImages.slice(0, 9).forEach((img, idx) => {
        const row = Math.floor(idx / 3);
        const col = idx % 3;
        const x = col * itemSize;
        const y = row * itemSize;

        const image = new Image();
        image.onload = () => {
            ctx.drawImage(image, x, y, itemSize, itemSize);
        };
        image.src = img.data;
    });

    // Download canvas
    setTimeout(() => {
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            downloadImage(url, 'gallery_export.png');
            showNotification('Gallery exported', 'success', 2000);
        });
    }, 1000);
}
