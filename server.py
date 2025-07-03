#!/usr/bin/env python
import re
import sys
import os

# Define preprocess_text in the global namespace before importing anything else
def preprocess_text(text, stop_words=None):
    if not isinstance(text, str):
        text = str(text)
    text = text.lower()
    text = re.sub(r'\d+', '', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s]', '', text)
    if stop_words:
        text = ' '.join([word for word in text.split() if word not in stop_words])
    return text

# Make it available in globals and __main__
globals()['preprocess_text'] = preprocess_text
sys.modules['__main__'].__dict__['preprocess_text'] = preprocess_text

# Import waitress after defining preprocess_text
from waitress import serve
from app import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting waitress server on port {port}")
    serve(app, host="0.0.0.0", port=port)