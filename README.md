# JobQuest ML API

A Flask-based API for serving machine learning models for job search and skill analysis.

## Features

- Job verification using Random Forest Classifier
- User behavior clustering using KMeans
- Skill extraction from text using spaCy NLP

## Project Structure

```
jobquestML/
├── app.py                  # Main entry point
├── routes/                 # API endpoints
│   ├── job_verification.py # Job verification endpoint
│   ├── user_clustering.py  # User recommendations endpoint
│   └── skill_extraction.py # Skill extraction endpoint
├── models/                 # ML model loaders
│   ├── job_verification_model.py
│   ├── user_clustering_model.py
│   └── skill_extraction_model.py
├── utils/                  # Helper functions
│   ├── preprocessing.py    # Data preprocessing
│   └── text_processing.py  # Text cleaning and processing
├── saved_models/           # Trained ML models (not in repo)
│   ├── job_verification_model.pkl
│   ├── user_clustering_model.pkl
│   └── spacy_skills_model/
├── .env                    # Environment variables
└── requirements.txt        # Dependencies
```

## API Endpoints

- `POST /verify-job` - Verify if a job posting is legitimate
- `POST /recommend` - Get job recommendations based on user behavior
- `POST /extract-skills` - Extract skills from resume or job description text

## Setup

1. Clone the repository
2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Download spaCy model:
   ```
   cd saved_models
   python install_spacy_model.py
   ```
5. Place trained models in the `saved_models/` directory
6. Create `.env` file with configuration variables
7. Run the application:
   ```
   flask run
   ```

## Production Deployment

For production, use a WSGI server like Gunicorn:

```
gunicorn -w 4 -b 0.0.0.0:5000 app:create_app()
```

## Testing

Run tests with pytest:

```
pytest
```