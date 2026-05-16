/* ========================================
   GALLERY PAGE FUNCTIONALITY
   ======================================== */

// State management
const galleryState = {
    samples: [],
    currentSampleIndex: 0,
    autoplayInterval: null,
    isAutoplay: false
};

// DOM Elements
let tabButtons, carouselImage, carouselCounter, carouselFilename;
let carouselPrevBtn, carouselNextBtn;
let samplesGrid, generatedGrid;

/**
 * Initialize page
 */
document.addEventListener('DOMContentLoaded', async function() {
    initializeElements();
    setupEventListeners();
    loadSamples();
});

/**
 * Initialize DOM elements
 */
function initializeElements() {
    tabButtons = document.querySelectorAll('.tab-button');
    carouselImage = document.getElementById('carousel-image');
    carouselCounter = document.getElementById('carousel-counter');
    carouselFilename = document.getElementById('carousel-filename');
    carouselPrevBtn = document.getElementById('carousel-prev');
    carouselNextBtn = document.getElementById('carousel-next');
    samplesGrid = document.getElementById('samples-grid');
    generatedGrid = document.getElementById('generated-grid');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Carousel controls
    carouselPrevBtn.addEventListener('click', previousSample);
    carouselNextBtn.addEventListener('click', nextSample);

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboard);
}

/**
 * Switch tabs
 */
function switchTab(tabName) {
    // Update buttons
    tabButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName + '-tab').classList.add('active');

    if (tabName === 'samples') {
        startCarouselAutoplay();
    } else {
        stopCarouselAutoplay();
        loadGeneratedFaces();
    }
}

/**
 * Load sample images
 */
async function loadSamples() {
    try {
        const response = await fetchAPI('/api/get-samples');
        galleryState.samples = response.samples || [];

        if (galleryState.samples.length === 0) {
            samplesGrid.innerHTML = `
                <div class="empty-state">
                    <p>No training samples found</p>
                </div>
            `;
            return;
        }

        // Load first image in carousel
        if (galleryState.samples.length > 0) {
            showSample(0);
        }

        // Populate grid
        displaySamplesGrid();

        showNotification(`Loaded ${galleryState.samples.length} training samples`, 'success', 2000);
    } catch (error) {
        console.error('Error loading samples:', error);
        showNotification('Failed to load samples', 'error');
    }
}

/**
 * Show specific sample in carousel
 */
function showSample(index) {
    if (galleryState.samples.length === 0) return;

    galleryState.currentSampleIndex = index;
    const filename = galleryState.samples[index];
    const imagePath = `/samples/${filename}`;

    carouselImage.src = imagePath;
    carouselCounter.textContent = `${index + 1} / ${galleryState.samples.length}`;
    carouselFilename.textContent = filename;
}

/**
 * Previous sample
 */
function previousSample() {
    let newIndex = galleryState.currentSampleIndex - 1;
    if (newIndex < 0) {
        newIndex = galleryState.samples.length - 1;
    }
    showSample(newIndex);
}

/**
 * Next sample
 */
function nextSample() {
    let newIndex = galleryState.currentSampleIndex + 1;
    if (newIndex >= galleryState.samples.length) {
        newIndex = 0;
    }
    showSample(newIndex);
}

/**
 * Display samples grid
 */
function displaySamplesGrid() {
    const gridHTML = galleryState.samples.map((filename, index) => `
        <div class="gallery-item" onclick="showSample(${index}); scrollToCarousel()">
            <img src="/samples/${filename}" alt="${filename}" loading="lazy">
            <div class="gallery-item-overlay">
                <button class="gallery-item-button" onclick="event.stopPropagation(); zoomImage('/samples/${filename}')">
                    🔍 Zoom
                </button>
            </div>
        </div>
    `).join('');

    samplesGrid.innerHTML = gridHTML;
}

/**
 * Toggle carousel autoplay
 */
function toggleCarouselAutoplay() {
    if (galleryState.isAutoplay) {
        stopCarouselAutoplay();
    } else {
        startCarouselAutoplay();
    }
}

/**
 * Start autoplay
 */
function startCarouselAutoplay() {
    if (galleryState.isAutoplay) return;

    galleryState.isAutoplay = true;
    galleryState.autoplayInterval = setInterval(() => {
        nextSample();
    }, 3000);

    showNotification('Autoplay started', 'info', 1500);
}

/**
 * Stop autoplay
 */
function stopCarouselAutoplay() {
    if (galleryState.autoplayInterval) {
        clearInterval(galleryState.autoplayInterval);
    }
    galleryState.isAutoplay = false;
}

/**
 * Zoom image
 */
function zoomImage(imageSrc = null) {
    const zoomModal = document.getElementById('zoom-modal');
    const zoomImage = document.getElementById('zoom-image');

    if (imageSrc) {
        zoomImage.src = imageSrc;
    } else if (carouselImage.src) {
        zoomImage.src = carouselImage.src;
    }

    zoomModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Setup close
    const closeBtn = zoomModal.querySelector('.modal-close');
    closeBtn.onclick = () => {
        zoomModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    };

    zoomModal.onclick = (e) => {
        if (e.target === zoomModal) {
            zoomModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    };
}

/**
 * Scroll to carousel
 */
function scrollToCarousel() {
    const carousel = document.querySelector('.carousel');
    if (carousel) {
        scrollToElement(carousel, true);
    }
}

/**
 * Load generated faces from local storage or session
 */
function loadGeneratedFaces() {
    try {
        // Try to load from session storage
        const stored = sessionStorage.getItem('generatedFaces');
        if (stored) {
            const faces = JSON.parse(stored);
            displayGeneratedFaces(faces);
        } else {
            generatedGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">✨</div>
                    <p>No generated faces yet</p>
                    <p>
                        <a href="/generate_page" class="link">
                            Go to Generation Page →
                        </a>
                    </p>
                </div>
            `;
        }
    } catch (error) {
        console.warn('Error loading generated faces:', error);
    }
}

/**
 * Display generated faces
 */
function displayGeneratedFaces(faces) {
    if (!faces || faces.length === 0) {
        generatedGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✨</div>
                <p>No generated faces yet</p>
            </div>
        `;
        return;
    }

    const gridHTML = faces.map((face, index) => `
        <div class="gallery-item" onclick="zoomImage('${face.data}')">
            <img src="${face.data}" alt="Generated face ${index + 1}" loading="lazy">
            <div class="gallery-item-overlay">
                <button class="gallery-item-button" onclick="event.stopPropagation(); downloadImage('${face.data}', '${face.filename || 'generated_' + index + '.png'}')">
                    ⬇️ Download
                </button>
            </div>
        </div>
    `).join('');

    generatedGrid.innerHTML = gridHTML;
}

/**
 * Handle keyboard navigation
 */
function handleKeyboard(e) {
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab || !activeTab.id.includes('samples')) return;

    if (e.key === 'ArrowLeft') {
        previousSample();
    } else if (e.key === 'ArrowRight') {
        nextSample();
    } else if (e.key === ' ') {
        e.preventDefault();
        toggleCarouselAutoplay();
    }
}

/**
 * Share current sample
 */
function shareSample() {
    const filename = galleryState.samples[galleryState.currentSampleIndex];
    const imageUrl = window.location.origin + '/samples/' + filename;

    if (navigator.share) {
        navigator.share({
            title: 'AI Face Generation',
            text: 'Check out this generated face!',
            url: imageUrl
        });
    } else {
        copyToClipboard(imageUrl);
        showNotification('Image URL copied to clipboard', 'success', 2000);
    }
}

/**
 * Print carousel image
 */
function printImage() {
    const filename = galleryState.samples[galleryState.currentSampleIndex];
    const printWindow = window.open(carouselImage.src, 'Print', '');
    printWindow.print();
}
