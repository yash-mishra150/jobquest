# Deployment Guide

This document provides guidance for deploying the JobQuest ML service.

## Deployment Checklist

1. Ensure all model files are properly included in your deployment
2. Make sure the deployment environment has Python 3.12 or earlier
3. Configure the environment variables needed for the application
4. Check that model paths are correctly resolved

## Model Files Setup

The application expects model files to be in specific locations:

```
jobquestML/
├── saved_models/
│   ├── job_verification-model/
│   │   └── job_fraud_detector.pkl
│   └── spacy_skills_model/
│       └── ... (spaCy model files)
```

### Troubleshooting Model Path Issues

If you encounter the error `No such file or directory: 'saved_models\job_verification-model\job_fraud_detector.pkl'`, it could be due to:

1. **Missing model files**: Ensure the model files are included in your deployment package.
2. **Path format issues**: The application now uses `os.path.join()` for cross-platform compatibility.
3. **Working directory issues**: The application might be running from a different directory than expected.

Visit the `/check-paths` endpoint of your deployed application to get diagnostic information about model paths.

## Environment Variables

Set the following environment variables:

- `PORT`: The port on which the application will run (default: 5000)
- `DEBUG`: Set to "True" for development, "False" for production
- `CORS_ORIGINS`: Comma-separated list of allowed origins for CORS

## Render.com Deployment

For Render.com deployments:

1. Use the "Web Service" option
2. Set Build Command: `pip install -r requirements.txt`
3. Set Start Command: `python server.py` or `gunicorn app:app`
4. Set Python Version: 3.12
5. Make sure to include your model files in the deployment
6. Ensure the "saved_models" directory is in the root of your deployment

### Manual Model Upload

If your model files are too large for git, you may need to upload them manually:

1. Deploy your application without the model files first
2. Use Render.com's shell access to upload the model files to the correct location
3. Create the necessary directories:
   ```
   mkdir -p saved_models/job_verification-model
   ```
4. Upload your model files to the correct directories
5. Restart your application

## Testing Deployment

After deployment, visit these endpoints to verify your application is working correctly:

- `/` - Health check endpoint
- `/check-paths` - Diagnostic endpoint to verify model paths