"""HTTP interface for the Italian Vosk speech recognition model."""

import base64
import binascii
import io
import json
import wave

from flask import Flask, jsonify, request
from vosk import KaldiRecognizer, Model

app = Flask(__name__)
model = Model("model")


@app.route("/transcribe", methods=["POST"])
def transcribe():
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not isinstance(data.get("audio"), str):
        return jsonify({"message": "INVALID_AUDIO"}), 400

    try:
        audio_bytes = base64.b64decode(data["audio"], validate=True)
        audio_stream = wave.open(io.BytesIO(audio_bytes), "rb")
    except (ValueError, binascii.Error, EOFError, wave.Error):
        return jsonify({"message": "INVALID_AUDIO"}), 400

    with audio_stream as wav:
        if wav.getnchannels() != 1 or wav.getsampwidth() != 2 or wav.getframerate() != 16000:
            return jsonify({"message": "AUDIO_NO_16000_HZ"}), 400

        recognizer = KaldiRecognizer(model, wav.getframerate())
        phrases = []
        while True:
            buffer = wav.readframes(4000)
            if not buffer:
                break
            if recognizer.AcceptWaveform(buffer):
                phrases.append(json.loads(recognizer.Result()).get("text", ""))
        phrases.append(json.loads(recognizer.FinalResult()).get("text", ""))

    return jsonify({"text": " ".join(filter(None, phrases))})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
