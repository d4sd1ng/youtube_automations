FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for audio processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY package.json .
RUN pip install flask requests pydub librosa numpy

COPY app.py .

EXPOSE 5003

CMD [\ python\, \app.py\]
