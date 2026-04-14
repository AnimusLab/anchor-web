# Anchor Master Node (Hub) — Hugging Face Optimized
FROM python:3.11-slim

# Install system dependencies for cryptography and psycopg2
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Hugging Face Spaces expects the app to listen on port 7860
EXPOSE 7860

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=7860

# Run the FastAPI Hub via uvicorn
# We override the port to 7860 for Hugging Face compatibility
CMD ["uvicorn", "proxy:app", "--host", "0.0.0.0", "--port", "7860"]
