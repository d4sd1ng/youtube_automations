FROM python:3.9-slim

WORKDIR /app

COPY package.json .
RUN pip install flask requests beautifulsoup4 selenium numpy

COPY app.py .

EXPOSE 5006

CMD [\ python\, \app.py\]
