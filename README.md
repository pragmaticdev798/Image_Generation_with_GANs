# AI Face Generation using DCGAN - Web Application

A modern, interactive web application for generating realistic human faces using Deep Convolutional Generative Adversarial Networks (DCGAN). Built with Flask backend and responsive HTML/CSS/JavaScript frontend.

##  Project Overview

This application demonstrates the power of GANs in generating synthetic face images from scratch. It provides an intuitive interface to:
- Load pre-trained DCGAN models
- Generate multiple fake face images
- View training samples and generated faces
- My learning about GAN architecture and implementation


##  Requirements

### System Requirements
- **OS:** Windows 11, macOS, or Linux
- **Python:** 3.8 or higher
- **RAM:** 4GB minimum (8GB recommended)
- **Storage:** ~2GB for dependencies and models

### Software Requirements
- Python 3.8+
- pip (Python package manager)
- Web browser (Chrome, Firefox, Safari, Edge)

##  Installation & Setup

### Step 1: Clone or Download the Project

```bash
# Navigate to  project directory
cd /path/to//project
```

### Step 2: Create Python Virtual Environment

On Windows:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate
```

On macOS/Linux:
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```


### Step 4: Prepare  Model Checkpoints

1. Copy trained model checkpoint files to the `checkpoints/` folder:
   ```
   checkpoints/
   ├── dcgan_checkpoint_epoch_10.pth
   ├── dcgan_checkpoint_epoch_20.pth
   ├── dcgan_checkpoint_epoch_30.pth
   ├── dcgan_checkpoint_epoch_50.pth
   └── ... (other checkpoints)
   ```

2. The application will automatically detect all `.pth` files in this folder

### Step 5: Prepare Training Samples (Optional)

Add training sample images to the `generated_samples/` folder:
```
generated_samples/
├── sample_1.png
├── sample_2.png
├── sample_3.jpg
└── ... (other samples)
```

Supported formats: PNG, JPG, JPEG, GIF

## Running the Application

### Start the Development Server

```bash
python app.py
```

You should see output like:
```
============================================================
DCGAN Face Generation Web Application
============================================================
Device: cpu
Checkpoint Dir: checkpoints
Samples Dir: generated_samples
Output Dir: outputs
============================================================

 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://0.0.0.0:5000
```

### Access the Application (locally)

Open  web browser and navigate to:
```
http://localhost:5000
```

or

```
http://127.0.0.1:5000
```

##  Project Structure

```
ai-face-generation/
│
├── app.py                          # Main Flask application
├── requirements.txt                # Python dependencies
├── README.md                       # This file
│
├── app/
│   ├── models/
│   │   ├── __init__.py
│   │   └── generator.py            # DCGAN Generator architecture
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   └── image_utils.py          # Image processing utilities
│   │
│   ├── templates/
│   │   ├── base.html               # Base template (navbar, footer)
│   │   ├── index.html              # Home page
│   │   ├── generate.html           # Face generation page
│   │   ├── gallery.html            # Gallery page
│   │   └── about.html              # About/Info page
│   │
│   └── static/
│       ├── css/
│       │   ├── style.css           # Main styles
│       │   ├── animations.css      # Animations & keyframes
│       │   ├── home.css            # Home page styles
│       │   ├── generate.css        # Generate page styles
│       │   └── pages.css           # Gallery & About styles
│       │
│       └── js/
│           ├── utils.js            # Utility functions
│           ├── generate.js         # Generate page logic
│           └── gallery.js          # Gallery page logic
│
├── checkpoints/                    # Model checkpoint files
│   ├── dcgan_checkpoint_epoch_50.pth
│   └── ...
│
├── generated_samples/              # Training sample images
│   ├── sample_1.png
│   └── ...
│
└── outputs/                        # Generated images (auto-created)
    └── generated_*.png
```

##  How to Use

### 1. Load a Model
1. Go to the **Generate** page
2. Select a checkpoint from the dropdown
3. Click **"Load Model"**
4. Wait for confirmation message

### 2. Generate Faces
1. Set the number of images (1-20)
2. (Optional) Enter a seed number for reproducibility
3. Click **"Generate Faces"**
4. Watch the loading animation
5. Browse generated images in the gallery

### 3. Download Images
- Click on any generated image to preview it in fullscreen
- Use **"Download"** button to save individual images
- Images are automatically saved to the `outputs/` folder

### 4. Explore Gallery
- **Training Samples Tab:** Browse images from  training dataset
- **Generated Faces Tab:** View all faces generated during this session
- Use carousel controls or keyboard arrows to navigate
- Click **"Zoom"** to view images in fullscreen

### 5. Learn About the Model
- Visit the **About** page for:
  - Detailed architecture explanation
  - Training specifications
  - How GANs work
  - Technical stack information

##  Configuration

### Model Configuration (in `app.py`)

```python
model_config = {
    'latent_size': 100,           # Size of random noise vector
    'num_channels': 3,            # RGB channels
    'image_size': 64,             # Output image size (64x64)
    'generator_channels': 64,     # Base generator channels
}
```

### Server Configuration (in `app.py`)

```python
app.run(
    debug=True,                   # Enable debug mode
    host='0.0.0.0',             # Accessible from any IP
    port=5000,                   # Server port
    use_reloader=True            # Auto-reload on code changes
)
```

##  API Endpoints

### GET Endpoints

| Endpoint | Description | Response |
|----------|-------------|----------|
| `/` | Home page | HTML |
| `/generate_page` | Face generation page | HTML |
| `/gallery` | Gallery page | HTML |
| `/about` | About page | HTML |
| `/api/get-checkpoints` | List available checkpoints | JSON |
| `/api/get-samples` | List training samples | JSON |
| `/api/get-model-info` | Current model info | JSON |
| `/samples/<filename>` | Serve sample image | Image file |

### POST Endpoints

| Endpoint | Description | Input | Response |
|----------|-------------|-------|----------|
| `/api/load-model` | Load checkpoint | `{checkpoint_name}` | JSON |
| `/api/generate` | Generate images | `{num_images, seed}` | JSON with images |

### Download Endpoint

| Endpoint | Description |
|----------|-------------|
| `/api/download-image/<filename>` | Download generated image |

##  Troubleshooting

### Issue: "Module not found" error
**Solution:** Ensure all dependencies are installed:
```bash
pip install -r requirements.txt --upgrade
```

### Issue: "No checkpoints found"
**Solution:** 
1. Verify checkpoint files are in the `checkpoints/` folder
2. Files must have `.pth` extension
3. Restart the application

### Issue: Images fail to generate
**Solution:**
1. Ensure model is loaded first
2. Check browser console for errors (F12 → Console)
3. Verify checkpoint file is not corrupted
4. Try with fewer images (start with 1-3)

### Issue: Port 5000 already in use
**Solution:** Change port in `app.py`:
```python
app.run(port=5001)  # Use port 5001 instead
```

### Issue: Slow generation on CPU
**Notes:**
- CPU-based inference is slower than GPU
- Expected: 50-200ms per image on modern CPU
- First generation might be slower due to model loading

##  Model Architecture Summary

### Generator Network
```
Input: (1, 100, 1, 1)  - Random noise
↓
ConvTranspose2d → BatchNorm → ReLU
1×1 → 4×4
↓
ConvTranspose2d → BatchNorm → ReLU
4×4 → 8×8
↓
ConvTranspose2d → BatchNorm → ReLU
8×8 → 16×16
↓
ConvTranspose2d → BatchNorm → ReLU
16×16 → 32×32
↓
ConvTranspose2d → Tanh
32×32 → 64×64
↓
Output: (1, 3, 64, 64)  - Fake face image
```

### Key Parameters
- **Latent Dimension:** 100
- **Output Size:** 64×64 pixels
- **Channels:** 3 (RGB)
- **Total Parameters:** ~3.5M
- **Training Epochs:** 50
- **Batch Size:** 128
- **Learning Rate:** 0.0002

##  Learning Resources

### GAN Concepts
- **Original GAN Paper:** https://arxiv.org/abs/1406.2661
- **DCGAN Paper:** https://arxiv.org/abs/1511.06434

### Implementation
- **PyTorch Documentation:** https://pytorch.org/docs/stable/index.html
- **Flask Documentation:** https://flask.palletsprojects.com/

### Further Reading
- StyleGAN2 (better quality)
- Progressive GAN (higher resolution)
- Conditional GAN (attribute control)

##  Tips for Better Results

1. **Use Latest Checkpoint:** Generate from the last trained epoch for best quality
2. **Set Seed:** Use same seed to generate identical faces
3. **Batch Generation:** Generate multiple images at once for comparison
4. **Monitor GPU:** On CPU, generation is slower but works fine

##  Future Enhancements

-  GPU support (CUDA/Metal)
-  Higher resolution output (256×256)
-  Conditional face generation (age, emotion, etc.)
-  Real-time face interpolation
-  Model comparison tools
-  Web deployment
-  REST API for external access
-  Docker containerization

### Testing
Run basic tests:
```bash
# Test model loading
python -c "from app.models.generator import Generator; print('✓ Generator imported successfully')"

# Test image utils
python -c "from app.utils.image_utils import tensor_to_image; print('✓ Image utils imported successfully')"
```

##  License

This project is provided as-is for educational and demonstration purposes.

##  Author

Created for AI Face Generation using DCGAN

##  Support & Contribution

For issues or improvements:
1. Check the troubleshooting section
2. Review the code comments
3. Test each component independently
4. Check browser console for JavaScript errors


