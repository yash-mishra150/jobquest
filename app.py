from flask import Flask
from flask_restful import Api
from flask_cors import CORS
import os
from dotenv import load_dotenv

from routes.job_verification import JobVerificationResource
from routes.user_clustering import UserClusteringResource
from routes.company_legitimacy import CompanyLegitimacyResource
from routes.health import HealthCheckResource
from routes.resume_extraction import ResumeExtractionResource

from utils.logger import logger
from config import current_config as config

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    app.config.from_object(config)
    
    CORS(app, resources={r"/*": {"origins": config.CORS_ORIGINS}})
    logger.info(f"CORS configured with allowed origins: {config.CORS_ORIGINS}")
    
    api = Api(app)
    api.add_resource(HealthCheckResource, '/health')
    api.add_resource(JobVerificationResource, '/verify-job')
    api.add_resource(UserClusteringResource, '/recommend')
    api.add_resource(CompanyLegitimacyResource, '/company-legitimacy')
    api.add_resource(ResumeExtractionResource, '/extract-resume')
    logger.info("API endpoints registered")
    
    return app

if __name__ == '__main__':
    app = create_app()
    logger.info(f"Starting application on port {config.PORT} with debug={config.DEBUG}")
    app.run(host='0.0.0.0', port=config.PORT, debug=config.DEBUG)