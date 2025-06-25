# Saved Models Directory

This directory is intended to store trained machine learning models for the JobQuest ML API.

## Expected models:

1. `job_verification_model.pkl` - RandomForestClassifier for job verification
2. `user_clustering_model.pkl` - KMeans model for user behavior clustering  
3. `spacy_skills_model/` - spaCy pipeline for skill extraction

## Model Training

Training scripts are not included in this repository. Models should be trained separately and placed in this directory.

## Loading Models

Models are loaded by the respective model classes in the `models/` directory. If a model file is not found, the API will fall back to dummy implementations for testing purposes.