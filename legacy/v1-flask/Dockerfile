# Use Python 3.13 slim image for smaller size
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies (needed for Pillow and other packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY legacy/v1-flask/src/requirements.txt .

# Install runtime server + Python dependencies. PyTorch +cpu wheels are hosted on the PyTorch index.
RUN pip install --no-cache-dir gunicorn && \
    pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt

# Copy the backend source (expertSystem module must be importable at root level)
COPY legacy/v1-flask/src/ .

# Expose port (Cloud Run uses PORT environment variable)
EXPOSE 8080

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Run with gunicorn (production WSGI server)
CMD exec gunicorn --bind :${PORT:-8080} --workers 1 --timeout 600 --access-logfile - --error-logfile - expertSystem.app:app
