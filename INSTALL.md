# Installation Guide for JobQuest ML API

## Prerequisites
- Python 3.12.7 or later
- pip 23.0 or later

## Installation Steps

1. **Create a virtual environment (recommended):**
   ```
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```

2. **Install dependencies:**
   ```
   pip install -r requirements.txt
   ```

3. **Install spaCy model:**
   ```
   python saved_models/install_spacy_model.py
   ```

4. **Run the application:**
   ```
   python app.py
   ```
   
   Or using Flask CLI:
   ```
   flask run
   ```

## Docker Installation

1. **Build the Docker image:**
   ```
   docker build -t jobquest-ml .
   ```

2. **Run the container:**
   ```
   docker run -p 5000:5000 jobquest-ml
   ```

   Or using docker-compose:
   ```
   docker-compose up
   ```

## API Endpoints

- `/health` - Health check endpoint
- `/verify-job` - Job verification API
- `/recommend` - User clustering and recommendations
- `/company-legitimacy` - Company legitimacy scoring
- `/extract-resume` - Resume information extraction

## Troubleshooting

If you encounter encoding issues or package installation problems:
1. Ensure you are using Python 3.12.7 or later
2. Try installing with `pip install --no-cache-dir -r requirements.txt`
3. If specific packages fail, try installing them individually

For resume extraction functionality:
- Make sure both PyPDF2 and pdfminer.six are installed
- Ensure the spaCy model is installed correctly