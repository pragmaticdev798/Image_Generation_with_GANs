"""
DCGAN Generator Model Architecture
Matches the architecture from training notebook for checkpoint compatibility
"""

import torch
import torch.nn as nn


class Generator(nn.Module):
    """
    DCGAN Generator Network
    Takes random noise and generates realistic face images
    
    Architecture matches training notebook exactly:
    - Input: Random noise vector (z_dim, 1, 1)
    - 5 transposed convolution blocks
    - Batch normalization and ReLU activation
    - Output: Fake face images (3, 64, 64)
    """
    
    def __init__(self, z_dim=100, channels_img=3, features_g=64):
        """
        Initialize Generator
        
        Args:
            z_dim (int): Size of input noise vector (default: 100)
            channels_img (int): Number of output channels (3 for RGB)
            features_g (int): Base number of generator features
        """
        super(Generator, self).__init__()
        
        self.net = nn.Sequential(
            # Block 1: (z_dim, 1, 1) -> (features_g * 16, 4, 4)
            self._block(z_dim, features_g * 16, 4, 1, 0),
            
            # Block 2: (features_g * 16, 4, 4) -> (features_g * 8, 8, 8)
            self._block(features_g * 16, features_g * 8, 4, 2, 1),
            
            # Block 3: (features_g * 8, 8, 8) -> (features_g * 4, 16, 16)
            self._block(features_g * 8, features_g * 4, 4, 2, 1),
            
            # Block 4: (features_g * 4, 16, 16) -> (features_g * 2, 32, 32)
            self._block(features_g * 4, features_g * 2, 4, 2, 1),
            
            # Final layer: (features_g * 2, 32, 32) -> (channels_img, 64, 64)
            nn.ConvTranspose2d(
                features_g * 2,
                channels_img,
                kernel_size=4,
                stride=2,
                padding=1
            ),
            nn.Tanh()
        )
    
    def _block(self, in_channels, out_channels, kernel_size, stride, padding):
        """
        Create a transposed convolution block with BatchNorm and ReLU
        """
        return nn.Sequential(
            nn.ConvTranspose2d(
                in_channels,
                out_channels,
                kernel_size,
                stride,
                padding,
                bias=False
            ),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(True)
        )
    
    
    def forward(self, z):
        """
        Forward pass
        
        Args:
            z (torch.Tensor): Noise vector of shape (batch_size, z_dim, 1, 1)
            
        Returns:
            torch.Tensor: Generated images of shape (batch_size, 3, 64, 64)
        """
        return self.net(z)


class Discriminator(nn.Module):
    """
    DCGAN Discriminator Network (for reference, not used in generation)
    Distinguishes real faces from generated ones
    
    Architecture matches training notebook exactly for checkpoint compatibility
    """
    
    def __init__(self, channels_img=3, features_d=64):
        """
        Initialize Discriminator
        
        Args:
            channels_img (int): Number of input channels (3 for RGB)
            features_d (int): Base number of discriminator features
        """
        super(Discriminator, self).__init__()
        
        self.net = nn.Sequential(
            # First layer: (channels_img, 64, 64) -> (features_d, 32, 32)
            nn.Conv2d(channels_img, features_d, 4, 2, 1),
            nn.LeakyReLU(0.2),
            
            # Block 1: (features_d, 32, 32) -> (features_d * 2, 16, 16)
            self._block(features_d, features_d * 2, 4, 2, 1),
            
            # Block 2: (features_d * 2, 16, 16) -> (features_d * 4, 8, 8)
            self._block(features_d * 2, features_d * 4, 4, 2, 1),
            
            # Block 3: (features_d * 4, 8, 8) -> (features_d * 8, 4, 4)
            self._block(features_d * 4, features_d * 8, 4, 2, 1),
            
            # Final layer: (features_d * 8, 4, 4) -> (1, 1, 1)
            nn.Conv2d(features_d * 8, 1, 4, 2, 0),
        )
    
    def _block(self, in_channels, out_channels, kernel_size, stride, padding):
        """
        Create a convolution block with BatchNorm and LeakyReLU
        """
        return nn.Sequential(
            nn.Conv2d(
                in_channels,
                out_channels,
                kernel_size,
                stride,
                padding,
                bias=False
            ),
            nn.BatchNorm2d(out_channels),
            nn.LeakyReLU(0.2)
        )
    
    def forward(self, x):
        """
        Forward pass
        
        Args:
            x (torch.Tensor): Input images of shape (batch_size, 3, 64, 64)
            
        Returns:
            torch.Tensor: Discrimination scores
        """
        return self.net(x)
