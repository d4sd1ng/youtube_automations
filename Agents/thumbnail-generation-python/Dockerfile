FROM python:3.9-slim

WORKDIR /app

COPY package.json .
RUN pip install flask requests pillow numpy

COPY app.py .

EXPOSE 5002

CMD [\ python\, \app.py\]
