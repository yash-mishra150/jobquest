#!/usr/bin/env bash
# Use Python 3.12
export PYTHON_VERSION=3.12.7

# Install dependencies
pip install -r requirements.txt

# Start the application
exec waitress-serve --port=8000 app:app
# Use Python 3.12

# Install dependencies