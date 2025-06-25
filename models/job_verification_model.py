import os
import joblib
from utils.preprocessing import preprocess_job_data

class JobVerificationModel:
    def __init__(self):
        # Load the trained model
        model_path = os.path.join(os.path.dirname(__file__), '../saved_models/job_verification_model.pkl')
        try:
            self.model = joblib.load(model_path)
            print("Job verification model loaded successfully")
        except FileNotFoundError:
            print("Job verification model not found, using dummy implementation")
            self.model = None
            
    def verify_job(self, job_details):
        if self.model is None:
            suspicious_flags = self._analyze_suspicious_flags(job_details)
            risk_level = "low" if len(suspicious_flags) <= 1 else "medium" if len(suspicious_flags) <= 3 else "high"
            confidence = 0.9 if risk_level == "low" else 0.7 if risk_level == "medium" else 0.4
            legitimate = risk_level != "high"
            
            return {
                "prediction": 1 if legitimate else 0,
                "confidence": confidence,
                "legitimate": legitimate,
                "risk_level": risk_level,
                "suspicious_flags": suspicious_flags
            }
        
        # Preprocess the job data
        processed_data = preprocess_job_data(job_details)
          # Make prediction
        prediction = self.model.predict([processed_data])[0]
        probabilities = self.model.predict_proba([processed_data])[0]
        
        # Get confidence of prediction
        confidence = probabilities[1] if prediction == 1 else probabilities[0]
        
        # Analyze suspicious flags
        suspicious_flags = self._analyze_suspicious_flags(job_details)
        risk_level = "low" if confidence > 0.8 else "medium" if confidence > 0.5 else "high"
        
        return {
            "prediction": int(prediction),
            "confidence": float(confidence),
            "legitimate": bool(prediction == 1),
            "risk_level": risk_level,
            "suspicious_flags": suspicious_flags
        }
        
    def _analyze_suspicious_flags(self, job_details):
        suspicious_flags = []
        
        description = job_details.get('jobDescription', '')
        if len(description) < 100:
            suspicious_flags.append("Very short job description")
        
        if not job_details.get('aboutCompany'):
            suspicious_flags.append("Missing company description")
        
        suspicious_keywords = ['payment required', 'pay to apply', 'fee required', 'investment required']
        for keyword in suspicious_keywords:
            if keyword in description.lower():
                suspicious_flags.append(f"Suspicious keyword found: '{keyword}'")
        
        if not job_details.get('location'):
            suspicious_flags.append("Missing location information")
            
        if not job_details.get('skills') or len(job_details.get('skills', [])) == 0:
            suspicious_flags.append("No skills specified")
            
        stipend = job_details.get('stipend', '')
        if '₹' in stipend:
            try:
                amount = ''.join(c for c in stipend.split('/')[0] if c.isdigit() or c == '.')
                if amount and float(amount) > 100000:
                    suspicious_flags.append(f"Unusually high stipend: {stipend}")
            except:
                pass
                
        return suspicious_flags