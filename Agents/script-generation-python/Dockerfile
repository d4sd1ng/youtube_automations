FROM python:3.9-slim

WORKDIR /app

COPY package.json .
RUN pip install flask requests openai numpy

COPY app.py .

EXPOSE 5005

CMD [\ python\, \app.py\]
