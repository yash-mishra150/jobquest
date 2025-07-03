#!/usr/bin/env bash
# Use Python 3.12
export PYTHON_VERSION=3.12.7

# Install dependencies
pip install -r requirements.txt

# Download spaCy English language model
python -m spacy download en_core_web_sm

# Download NLTK data
python -c "import nltk; nltk.download('punkt'); nltk.download('wordnet'); nltk.download('stopwords'); nltk.download('averaged_perceptron_tagger')"

# Start the application with our custom server script instead of waitress-serve
exec python server.py
# Use Python 3.12

# Install dependencies