# main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import torch
from torchvision import transforms
from PIL import Image
import io
from src.model import load_model  # you'll define this soon

app = FastAPI()

# Load your trained model once when the app starts
model = load_model()
model.eval()

@app.get("/health")
def health_check():
    return {"status": "API is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        # Same preprocessing as training
        transform = transforms.Compose([
            transforms.Resize((28, 28)),
            transforms.ToTensor(),
        ])

        tensor = transform(image).unsqueeze(0)

        with torch.no_grad():
            outputs = model(tensor)
            _, predicted = torch.max(outputs, 1)

        return JSONResponse(content={
            "prediction": int(predicted.item())
        })

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
