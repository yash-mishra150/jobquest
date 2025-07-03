import pickle
import pandas as pd
import re

class JobVerificationModel:
    @staticmethod
    def preprocess_text(text, stop_words):
        text = text.lower()
        text = re.sub(r'\d+', '', text)
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\w\s]', '', text)
        text = [word for word in text.split() if word not in stop_words]
        return ' '.join(text)
        
    @staticmethod
    def predict_job_fraud(data):
        # Use os.path.join for platform-independent file paths
        import os
        model_path = os.path.join('saved_models', 'job_verification-model', 'job_fraud_detector.pkl')
        
        try:
            with open(model_path, 'rb') as f:
                model_package = pickle.load(f)

            model = model_package['model']
            tfidf = model_package['tfidf_vectorizer']
            stop_words = model_package['stop_words']
            text_columns = model_package['text_columns']
        except FileNotFoundError:
            # Try alternative path formats if the model can't be found
            alt_paths = [
                os.path.join(os.path.dirname(__file__), '..', 'saved_models', 'job_verification-model', 'job_fraud_detector.pkl'),
                'saved_models/job_verification-model/job_fraud_detector.pkl',
                './saved_models/job_verification-model/job_fraud_detector.pkl'
            ]
            
            for alt_path in alt_paths:
                try:
                    print(f"Trying alternative model path: {alt_path}")
                    with open(alt_path, 'rb') as f:
                        model_package = pickle.load(f)
                        
                    model = model_package['model']
                    tfidf = model_package['tfidf_vectorizer']
                    stop_words = model_package['stop_words']
                    text_columns = model_package['text_columns']
                    break
                except FileNotFoundError:
                    continue
            else:
                # If all paths fail, raise an informative error
                raise FileNotFoundError(f"Could not find model file. Searched paths: {model_path} and alternatives")
        
        title = data.get('title', '')
        company_profile = data.get('company_profile', '')
        description = data.get('description', '')
        requirements = data.get('requirements', '')
        required_experience = data.get('required_experience', '')
        required_education = data.get('required_education', '')

        new_job = pd.DataFrame({
            'title': [title],
            'company_profile': [company_profile],
            'description': [description],
            'requirements': [requirements],
            'required_experience': [required_experience],
            'required_education': [required_education]
        })
    
        for col in text_columns:
            new_job[col] = new_job[col].fillna(' ')
            new_job[col] = new_job[col].apply(lambda x: JobVerificationModel.preprocess_text(x, stop_words))
    

        new_job['text'] = new_job[text_columns].apply(lambda x: ' '.join(x), axis=1)
        X_new = tfidf.transform(new_job['text']).toarray()
    
        prediction = model.predict(X_new)[0]
        probability = model.predict_proba(X_new)[0, 1]
        
        return {
            'is_fraudulent': bool(prediction),
            'fraud_probability': float(probability),
            'confidence': float(probability if prediction else 1-probability)
        }
        
    @staticmethod
    def prepare_job_for_model(job_data):
        title = job_data.get('title', '')
        company_profile = job_data.get('aboutCompany', job_data.get('company_profile', ''))
        description = job_data.get('jobDescription', job_data.get('description', ''))   
        raw_requirements = job_data.get('requirements', job_data.get('skills', ''))
        if isinstance(raw_requirements, list):
            requirements = ", ".join(raw_requirements)
        else:
            requirements = str(raw_requirements)
        if len(requirements.split()) > 20 and ',' not in requirements and '.' not in requirements:
            requirements = re.sub(r'([a-z])([A-Z])', r'\1 \2', requirements)
            requirements = re.sub(r'([a-zA-Z])(\d)', r'\1 \2', requirements)
            requirements = re.sub(r'(\d)([a-zA-Z])', r'\1 \2', requirements)
            words = requirements.split()
            sentences = []
            for i in range(0, len(words), 12):
                sentence = ' '.join(words[i:i+12])
                sentences.append(sentence)
            requirements = '. '.join(sentences)
        experience_raw = job_data.get('experience', job_data.get('required_experience', ''))
        required_experience = ''  
        if isinstance(experience_raw, str):
            exp_lower = experience_raw.lower()
            if 'intern' in exp_lower:
                required_experience = 'internship'
            elif 'entry' in exp_lower or '0' in exp_lower or '1 year' in exp_lower:
                required_experience = 'entry level'
            elif 'mid' in exp_lower or 'senior' in exp_lower or any(f"{i}" in exp_lower for i in range(4, 10)):
                required_experience = 'midsenior level'
            elif 'associate' in exp_lower or '2' in exp_lower or '3' in exp_lower:
                required_experience = 'associate'
            elif 'director' in exp_lower:
                required_experience = 'director'
            elif 'executive' in exp_lower or 'chief' in exp_lower or 'vp' in exp_lower:
                required_experience = 'executive'
            elif experience_raw: 
                required_experience = 'applicable'
        education_raw = job_data.get('education', job_data.get('required_education', ''))
        required_education = '' 
    
        if isinstance(education_raw, str):
            edu_lower = education_raw.lower()
            if 'bachelor' in edu_lower or 'graduate' in edu_lower or 'degree' in edu_lower:
                required_education = 'bachelors degree'
            if 'master' in edu_lower or 'post graduate' in edu_lower or 'mba' in edu_lower:
                required_education = 'masters degree'
            elif 'high school' in edu_lower or 'secondary' in edu_lower:
                required_education = 'high school equivalent'
            elif 'phd' in edu_lower or 'doctor' in edu_lower:
                required_education = 'doctorate'
            elif 'certification' in edu_lower or 'certified' in edu_lower:
                required_education = 'certification'
            elif 'vocational' in edu_lower:
                required_education = 'vocational'
            elif education_raw:  
                required_education = 'unspecified'

        benefits = job_data.get('benefits', '')
        if not benefits:
            benefits_parts = []
            if 'salary' in job_data and job_data['salary']:
                benefits_parts.append(f"Salary: {job_data['salary']}")
            if 'workMode' in job_data and job_data['workMode'] != 'Not available':
                benefits_parts.append(f"Work mode: {job_data['workMode']}")
            benefits = " ".join(benefits_parts)

        job_for_prediction = {
            'title': title,
            'company_profile': company_profile,
            'description': description,
            'requirements': requirements,
            'required_experience': required_experience,
            'required_education': required_education,
            'benefits': benefits        
        }

        result = JobVerificationModel.predict_job_fraud(job_for_prediction)

        return result
    