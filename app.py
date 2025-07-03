from flask import Flask
from flask_restful import Api
from flask_cors import CORS
import os
from dotenv import load_dotenv

from routes.job_verification import JobVerificationResource
from routes.health import HealthCheckResource
from routes.resume_extraction import ResumeExtractionResource

from utils.logger import logger
from config import current_config as config
from utils.text_processing import preprocess_text
from model_utils import preprocess_text as global_preprocess_text

# Handle spaCy model fallback
try:
    import spacy
    try:
        model_path = os.path.join(os.path.dirname(__file__), 'saved_models', 'spacy_skills_model')
        nlp = spacy.load(model_path)
    except OSError:
        print("Warning: en_core_web_sm not found. Using blank model as fallback.")
        nlp = spacy.blank("en")
except ImportError:
    print("Warning: spaCy not installed. NLP features may be limited.")

# Make preprocess_text available in the global namespace for pickle loading
globals()['preprocess_text'] = preprocess_text

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    app.config.from_object(config)

    def home():
        return "Server has Started"
    
    CORS(app, resources={r"/*": {"origins": config.CORS_ORIGINS}})
    logger.info(f"CORS configured with allowed origins: {config.CORS_ORIGINS}")
    
    api = Api(app)    
    api.add_resource(HealthCheckResource, '/')
    api.add_resource(JobVerificationResource, '/verify-job')
    api.add_resource(ResumeExtractionResource, '/extract-resume')
    logger.info("API endpoints registered")
    
    # Add a diagnostic endpoint for deployment troubleshooting
    @app.route('/check-paths')
    def check_paths():
        from utils.path_checker import check_model_paths
        import io
        import sys
        
        # Capture the output from check_model_paths
        old_stdout = sys.stdout
        new_stdout = io.StringIO()
        sys.stdout = new_stdout
        
        try:
            check_model_paths()
            output = new_stdout.getvalue()
        finally:
            sys.stdout = old_stdout
        
        # Return the diagnostic information as a response
        return f"<pre>{output}</pre>"
    
    return app

app = create_app()

if __name__ == '__main__':  
    logger.info(f"Starting application on port {config.PORT} with debug={config.DEBUG}")
    app.run(host='0.0.0.0', port=config.PORT, debug=config.DEBUG)