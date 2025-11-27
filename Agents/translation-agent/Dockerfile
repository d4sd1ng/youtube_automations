FROM python:3.9-slim

WORKDIR /app

COPY package.json .
RUN pip install flask requests \ googletrans==4.0.0-rc1\ numpy

COPY app.py .

EXPOSE 5008

CMD [\python\, \app.py\]
