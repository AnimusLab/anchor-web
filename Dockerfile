FROM python:3.9-slim

# Install system dependencies for psycopg2 and qrcode
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    libmagic-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /code

# In the HF Space, the contents of the 'server' folder are at the root.
COPY . /code/server

# Install dependencies from the requirements.txt now at /code/server/
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
# We use 'server.proxy:app' because if we are in $HOME/app, 
# and the files are from the 'server' folder, we might need to adjust the import path.
# Actually, if proxy.py is at the root of the space, we run 'proxy:app'.
CMD ["uvicorn", "proxy:app", "--host", "0.0.0.0", "--port", "7860"]
