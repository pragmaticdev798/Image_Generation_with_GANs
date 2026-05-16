"""
Image Utility Functions
For converting tensors to PIL images and vice versa
"""

import torch
import numpy as np
from PIL import Image
from datetime import datetime
import os


def tensor_to_image(tensor, denormalize=True):
    """
    Convert PyTorch tensor to PIL Image
    
    Args:
        tensor (torch.Tensor): Tensor of shape (batch, channels, height, width) or (channels, height, width)
                             Values should be in range [-1, 1] or [0, 1]
        denormalize (bool): If True, converts from [-1, 1] to [0, 255]
        
    Returns:
        PIL.Image: PIL Image object
    """
    # Remove batch dimension if present
    if tensor.dim() == 4:
        tensor = tensor[0]
    
    # Detach and move to CPU
    tensor = tensor.detach().cpu()
    
    # Denormalize from [-1, 1] to [0, 1]
    if denormalize:
        tensor = (tensor + 1) / 2.0
    
    # Clip values to [0, 1]
    tensor = torch.clamp(tensor, 0, 1)
    
    # Convert to numpy
    numpy_array = tensor.numpy()
    
    # Handle channel order (PyTorch uses CHW, PIL uses HWC)
    if numpy_array.shape[0] == 3:
        numpy_array = np.transpose(numpy_array, (1, 2, 0))
    elif numpy_array.shape[0] == 1:
        # Grayscale
        numpy_array = numpy_array[0]
    
    # Convert to uint8 [0, 255]
    numpy_array = (numpy_array * 255).astype(np.uint8)
    
    # Create PIL Image
    if len(numpy_array.shape) == 3 and numpy_array.shape[2] == 3:
        image = Image.fromarray(numpy_array, mode='RGB')
    else:
        image = Image.fromarray(numpy_array, mode='L')
    
    return image


def image_to_tensor(image, normalize=True):
    """
    Convert PIL Image to PyTorch tensor
    
    Args:
        image (PIL.Image): PIL Image object
        normalize (bool): If True, normalizes to [-1, 1] range
        
    Returns:
        torch.Tensor: Tensor of shape (1, channels, height, width)
    """
    # Convert to numpy
    numpy_array = np.array(image, dtype=np.float32)
    
    # Normalize to [0, 1]
    if numpy_array.max() > 1:
        numpy_array = numpy_array / 255.0
    
    # Handle channel order (PIL uses HWC, PyTorch uses CHW)
    if len(numpy_array.shape) == 3:
        numpy_array = np.transpose(numpy_array, (2, 0, 1))
    else:
        numpy_array = np.expand_dims(numpy_array, axis=0)
    
    # Normalize to [-1, 1] if requested
    if normalize:
        numpy_array = 2 * numpy_array - 1
    
    # Convert to tensor
    tensor = torch.from_numpy(numpy_array).float()
    
    # Add batch dimension
    tensor = tensor.unsqueeze(0)
    
    return tensor


def save_generated_image(image, output_dir, prefix='generated'):
    """
    Save generated image to disk
    
    Args:
        image (PIL.Image): PIL Image to save
        output_dir (str): Directory to save image
        prefix (str): Prefix for filename
        
    Returns:
        str: Filename of saved image
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate unique filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')[:-3]
    filename = f'{prefix}_{timestamp}.png'
    filepath = os.path.join(output_dir, filename)
    
    # Save image
    image.save(filepath, quality=95)
    
    return filename


def load_image(filepath, size=64):
    """
    Load and resize image
    
    Args:
        filepath (str): Path to image file
        size (int): Size to resize image to
        
    Returns:
        PIL.Image: Resized PIL Image
    """
    image = Image.open(filepath)
    
    # Convert to RGB if necessary
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Resize
    image = image.resize((size, size), Image.Resampling.LANCZOS)
    
    return image


def create_image_grid(images, grid_size=5, padding=4, bg_color=(0, 0, 0)):
    """
    Create a grid of images
    
    Args:
        images (list): List of PIL Images
        grid_size (int): Number of images per row
        padding (int): Padding between images
        bg_color (tuple): Background color RGB
        
    Returns:
        PIL.Image: Grid image
    """
    if not images:
        return None
    
    # Image dimensions (assuming all same size)
    img_size = images[0].size[0]
    
    # Calculate grid dimensions
    num_images = len(images)
    grid_rows = (num_images + grid_size - 1) // grid_size
    
    grid_width = grid_size * img_size + (grid_size - 1) * padding
    grid_height = grid_rows * img_size + (grid_rows - 1) * padding
    
    # Create grid image
    grid_image = Image.new('RGB', (grid_width, grid_height), bg_color)
    
    # Paste images
    for idx, img in enumerate(images):
        row = idx // grid_size
        col = idx % grid_size
        
        x = col * (img_size + padding)
        y = row * (img_size + padding)
        
        grid_image.paste(img, (x, y))
    
    return grid_image
