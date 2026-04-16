FROM python:3.9-slim

# Install system dependencies for psycopg2 and qrcode
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    libmagic-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /code

# Copy the server directory
COPY ./server /code/server

# Install dependencies
RUN pip install --no-cache-dir -r /code/server/requirements.txt

# Create a non-root user (good practice for HF Spaces)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Copy everything to the user app directory
COPY --chown=user . $HOME/app

# Expose the HF Spaces port
EXPOSE 7860

# Run the Master Node on the HF port
CMD ["uvicorn", "server.proxy:app", "--host", "0.0.0.0", "--port", "7860"]
