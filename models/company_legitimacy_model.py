import os
import joblib
from utils.preprocessing import preprocess_company_data

class CompanyLegitimacyModel:
    def __init__(self):
        model_path = os.path.join(os.path.dirname(__file__), '../saved_models/company_legitimacy_model.pkl')
        try:
            self.model = joblib.load(model_path)
            print("Company legitimacy model loaded successfully")
        except FileNotFoundError:
            print("Company legitimacy model not found, using dummy implementation")
            self.model = None
            
    def calculate_legitimacy_score(self, company_data):
        if self.model is None:
            return self._dummy_legitimacy_score(company_data)
        processed_data = preprocess_company_data(company_data)
        
        score = self.model.predict_proba([processed_data])[0][1]
        
        risk_level = self._determine_risk_level(score)
        factors = self._determine_risk_factors(company_data, score)
        
        return {
            "score": float(score),
            "risk_level": risk_level,
            "factors": factors
        }
    
    def _dummy_legitimacy_score(self, company_data):
        company_name = company_data.get('companyName', company_data.get('name', '')).lower()
        company_description = company_data.get('aboutCompany', company_data.get('description', ''))
        
        if 'scam' in company_name or 'fake' in company_name:
            score = 0.2
        elif len(company_description) < 50:
            score = 0.4
        elif company_name.startswith('private limited') or company_name.endswith('private limited'):
            score = 0.6
        else:
            score = 0.85
        
        risk_level = self._determine_risk_level(score)
        factors = self._determine_risk_factors(company_data, score)
        
        return {
            "score": score,
            "risk_level": risk_level,
            "factors": factors
        }
    def _determine_risk_level(self, score):
        if score < 0.3:
            return "high"
        elif score < 0.7:
            return "medium"
        else:
            return "low"
    
    def _determine_risk_factors(self, company_data, score):
        factors = []
        
        if not company_data.get('website', ''):
            factors.append("No company website provided")
        
        if not company_data.get('location', company_data.get('address', '')):
            factors.append("No physical address provided")
        
        company_description = company_data.get('aboutCompany', company_data.get('description', ''))
        if len(company_description) < 100:
            factors.append("Insufficient company description")
        
        if not company_data.get('social_media', []):
            factors.append("No social media presence")
            
        company_name = company_data.get('companyName', company_data.get('name', ''))
        if 'private limited' in company_name.lower() and len(factors) > 2:
            factors.append("Generic company name with limited information")
            
        if score > 0.7:
            factors.append("Company appears legitimate")
            
        return factors