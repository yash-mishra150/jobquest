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
                  # For compatibility, we can handle both formats:
            # 1. Job data directly in the request body
            # 2. Job data in a 'job_details' field
            
            job_details = data
            if 'job_details' in data:
                job_details = data.get('job_details', {})
            
            # Verify job using the model
            result = self.model.verify_job(job_details)
            
            response = {
                "status": "success",
                "jobTitle": job_details.get('title', 'Unknown'),
                "companyName": job_details.get('companyName', 'Unknown'),
                "prediction": result["prediction"],
                "confidence": result["confidence"],
                "legitimate": result["legitimate"],
                "riskLevel": result["risk_level"],
                "suspiciousFlags": result["suspicious_flags"]
            }
            
            return response, 200
            
        except Exception as e:
            return {"status": "error", "message": str(e)}, 500