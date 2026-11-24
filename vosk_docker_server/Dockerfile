FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server.py .

RUN apt-get update && apt-get install -y curl unzip && \
    curl -L -o model.zip https://alphacephei.com/vosk/models/vosk-model-small-it-0.22.zip && \
    unzip model.zip && rm model.zip && \
    mv vosk-model-small-it-0.22 model

EXPOSE 5000

CMD ["python", "server.py"]