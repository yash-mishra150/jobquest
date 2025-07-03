from flask import request
from flask_restful import Resource
from models.job_verification_model import JobVerificationModel

class JobVerificationResource(Resource):
    def __init__(self):
        self.model = JobVerificationModel()
    
    def post(self):
        try:
            data = request.get_json()
            
            if not data:
                return {"error": "No data provided"}, 400
            
            job_details = data
            if 'job_details' in data:
                job_details = data.get('job_details', {})

            result = self.model.prepare_job_for_model(job_details)
            
            response = {
                "status": "success",
                "jobTitle": job_details.get('title', 'Unknown'),
                "companyName": job_details.get('companyName', 'Unknown'),
                "prediction": "FRAUDULENT" if result['is_fraudulent'] else 'LEGITIMATE',
                "probability": result["fraud_probability"],
                "confidence": result["confidence"],
            }
            
            return response, 200
            
        except Exception as e:
            return {"status": "error", "message": str(e)}, 500