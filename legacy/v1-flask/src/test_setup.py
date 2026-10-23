# test_setup.py

import torch
import pandas as pd
import sklearn
import matplotlib
import seaborn
import albumentations
from fastapi import FastAPI
from pytorch_grad_cam import GradCAM

print("PyTorch version:", torch.__version__)
print("CUDA available:", torch.cuda.is_available())

print("pandas version:", pd.__version__)
print("scikit-learn version:", sklearn.__version__)
print("matplotlib version:", matplotlib.__version__)
print("seaborn version:", seaborn.__version__)
print("albumentations version:", albumentations.__version__)

# Test FastAPI
app = FastAPI()
print("FastAPI is installed")

# Test Grad-CAM (just checking import works)
print("Grad-CAM imported successfully")

print("\nAll required libraries are installed and working")
