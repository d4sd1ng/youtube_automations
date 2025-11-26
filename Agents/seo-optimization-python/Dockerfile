FROM python:3.9-slim

WORKDIR /app

COPY package.json .
RUN pip install flask requests numpy scikit-learn

COPY app.py .

EXPOSE 5007

CMD [\ python\, \app.py\]
