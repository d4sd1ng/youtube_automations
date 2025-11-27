FROM python:3.9-slim

WORKDIR /app

COPY package.json .
RUN pip install flask requests opencv-python numpy

COPY app.py .

EXPOSE 5001

CMD [\ python\, \app.py\]
