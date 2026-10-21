# src/train.py
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from torchvision import transforms, models
from torch.utils.data import DataLoader, Dataset
from PIL import Image
import torch
import torch.nn as nn
import torch.optim as optim

# === Step 1: Define paths ===
csv_path = 'data/HAM10000_metadata.csv'
img_dir = 'data/HAM10000'

# === Step 2: Read metadata ===
df = pd.read_csv(csv_path)
df['image_path'] = df['image_id'].apply(lambda x: os.path.join(img_dir, x + '.jpg'))

# === Step 3: Train/test split ===
train_df, test_df = train_test_split(df, test_size=0.2, stratify=df['dx'], random_state=42)

# === Step 4: Define dataset class ===
class SkinDataset(Dataset):
    def __init__(self, dataframe, transform=None):
        self.dataframe = dataframe
        self.transform = transform
        self.label_mapping = {label: idx for idx, label in enumerate(sorted(df['dx'].unique()))}

    def __len__(self):
        return len(self.dataframe)

    def __getitem__(self, idx):
        img_path = self.dataframe.iloc[idx]['image_path']
        label_name = self.dataframe.iloc[idx]['dx']
        label = self.label_mapping[label_name]
        image = Image.open(img_path).convert("RGB")
        if self.transform:
            image = self.transform(image)
        return image, label

# === Step 5: Transformations ===
transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
])

train_dataset = SkinDataset(train_df, transform=transform)
test_dataset = SkinDataset(test_df, transform=transform)

train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=32)

print(f"✅ Train size: {len(train_dataset)} | Test size: {len(test_dataset)}")

# === Step 6: Define model ===
model = models.resnet18(pretrained=True)
model.fc = nn.Linear(model.fc.in_features, 7)  # 7 skin classes

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

#=== Step 7: Training loop with accuracy tracking ===
num_epochs = 2  # you can increase later
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

for epoch in range(num_epochs):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()

        # --- Calculate accuracy ---
        _, predicted = torch.max(outputs, 1)  # get class with highest score
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

    epoch_loss = running_loss / len(train_loader)
    epoch_accuracy = 100 * correct / total

    print(f"Epoch [{epoch+1}/{num_epochs}] | Loss: {epoch_loss:.4f} | Accuracy: {epoch_accuracy:.2f}%")

# === Step 8: Save model ===
torch.save(model.state_dict(), "model_weights.pth")
print("✅ Model trained and saved as model_weights.pth")
