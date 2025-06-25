import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-secret-key')
    DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
    TESTING = False
    PORT = int(os.environ.get('PORT', 5000))
    
    # CORS settings
    CORS_ORIGINS = os.environ.get('CORS_ALLOW_ORIGINS', '').split(',')
    
    # Model paths
    JOB_VERIFICATION_MODEL_PATH = os.environ.get(
        'JOB_VERIFICATION_MODEL_PATH', 
        'saved_models/job_verification_model.pkl'
    )
    USER_CLUSTERING_MODEL_PATH = os.environ.get(
        'USER_CLUSTERING_MODEL_PATH', 
        'saved_models/user_clustering_model.pkl'
    )
    SPACY_MODEL_PATH = os.environ.get(
        'SPACY_MODEL_PATH', 
        'saved_models/spacy_skills_model'
    )
    
    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = os.environ.get('LOG_FILE', 'logs/app.log')

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

# Configuration dictionary
config_by_name = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig
}

# Get current configuration
current_config = config_by_name.get(
    os.environ.get('FLASK_ENV', 'development'),
    DevelopmentConfig
)