from flask import request
from flask_restful import Resource
from models.company_legitimacy_model import CompanyLegitimacyModel

class CompanyLegitimacyResource(Resource):
    def __init__(self):
        self.model = CompanyLegitimacyModel()
    
    def post(self):
        try:
            data = request.get_json()
            
            if not data:
                return {"error": "No data provided"}, 400
              # The company data can come directly in the job posting
            # or separately in a company_data field
            company_data = data
            if 'company_data' in data:
                company_data = data.get('company_data', {})
            
            # For job posting format, extract company information
            if 'companyName' in data and 'aboutCompany' in data:
                company_data = {
                    'name': data.get('companyName', ''),
                    'description': data.get('aboutCompany', ''),
                    'location': data.get('location', ''),
                }
            
            if not company_data:
                return {"error": "No company data provided"}, 400
            
            result = self.model.calculate_legitimacy_score(company_data)
            
            return {
                "status": "success",
                "companyName": company_data.get('companyName', company_data.get('name', 'Unknown')),
                "legitimacyScore": result["score"],
                "riskLevel": result["risk_level"],
                "factors": result["factors"]
            }, 200
            
        except Exception as e:
            return {"status": "error", "message": str(e)}, 500