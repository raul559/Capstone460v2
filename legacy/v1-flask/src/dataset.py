#dataset loading code, separates into categories 

import os
import pandas as pd
import numpy as np
from PIL import Image
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms

# Define transforms (resize to ResNet size 224x224)
TRANSFORM_IMG = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5],
                         std=[0.5, 0.5, 0.5])
])

# Map HAM10000 dx labels to integers
LABEL_MAP = {
    'akiec': 0,
    'bcc': 1,
    'bkl': 2,
    'df': 3,
    'mel': 4,
    'nv': 5,
    'vasc': 6
}

class HAM10000Dataset(Dataset):
    def __init__(self, csv_file, img_dir1, img_dir2, transform=None):
        self.data = pd.read_csv(csv_file)
        self.img_dir1 = img_dir1
        self.img_dir2 = img_dir2
        self.transform = transform

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        img_name = self.data.iloc[idx]["image_id"] + ".jpg"
        label_str = self.data.iloc[idx]["dx"]
        label = LABEL_MAP[label_str]

        # Check which folder has the image
        img_path = os.path.join(self.img_dir1, img_name)
        if not os.path.exists(img_path):
            img_path = os.path.join(self.img_dir2, img_name)

        image = Image.open(img_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        return image, label
    

if __name__ == "__main__":
    # Paths
    CSV_PATH = "../data/HAM10000_metadata.csv"
    IMG_DIR1 = "../data/HAM10000_images_part_1"
    IMG_DIR2 = "../data/HAM10000_images_part_2"



    # Create dataset
    dataset = HAM10000Dataset(
        csv_file=CSV_PATH,
        img_dir1=IMG_DIR1,
        img_dir2=IMG_DIR2,
        transform=TRANSFORM_IMG
    )

    print("✅ Dataset length:", len(dataset))

    # Inspect one sample
    img, label = dataset[0]
    print("One image tensor shape:", img.shape)   # should be [3, 224, 224]
    print("Label:", label)

import matplotlib.pyplot as plt

# Show first 5 samples
for i in range(5):
    img, label = dataset[i]
    plt.imshow(img.permute(1, 2, 0))  # convert from [C,H,W] to [H,W,C]
    plt.title(f"Label: {label}")
    plt.axis("off")
    plt.show()


import numpy as np

labels = [dataset[i][1] for i in range(len(dataset))]
(unique, counts) = np.unique(labels, return_counts=True)

print("Class distribution (label → count):")
for u, c in zip(unique, counts):
    print(f"{u}: {c}")
