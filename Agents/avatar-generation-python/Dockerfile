FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgtk-3-0 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json .
RUN pip install flask requests opencv-python numpy Pillow

COPY app.py .

EXPOSE 5004

CMD [\ python\, \app.py\]
