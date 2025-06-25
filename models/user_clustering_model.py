import os
import joblib
from utils.preprocessing import preprocess_user_data

class UserClusteringModel:
    def __init__(self):
        # Load the trained KMeans model
        model_path = os.path.join(os.path.dirname(__file__), '../saved_models/user_clustering_model.pkl')
        try:
            self.model = joblib.load(model_path)
            print("User clustering model loaded successfully")
        except FileNotFoundError:
            print("User clustering model not found, using dummy implementation")
            self.model = None
    
    def get_recommendations(self, user_data):
        if self.model is None:
            return self._dummy_recommendations(user_data)
        
        # Preprocess user data
        processed_data = preprocess_user_data(user_data)
        
        # Predict the cluster
        cluster = self.model.predict([processed_data])[0]
        
        # In a real implementation, you would fetch recommendations based on the cluster
        # For now, return dummy recommendations
        recommendations = self._generate_recommendations(user_data, cluster)
        
        return {
            "cluster": int(cluster),
            "recommendations": recommendations
        }
    
    def _dummy_recommendations(self, user_data):
        user_skills = user_data.get('skills', [])
        
        sample_jobs = [
            {
                "id": 101, 
                "title": "Data Scientist", 
                "companyName": "Tech Innovators Inc.",
                "location": "Remote",
                "skills": ["Python", "Machine Learning", "SQL", "Data Analysis", "Statistics"],
                "stipend": "₹ 40,000 - 60,000 /month",
                "match": 0.92
            },
            {
                "id": 203, 
                "title": "Machine Learning Engineer", 
                "companyName": "AI Solutions Ltd.",
                "location": "Bangalore",
                "skills": ["Python", "TensorFlow", "Deep Learning", "Computer Vision", "NLP"],
                "stipend": "₹ 50,000 - 70,000 /month",
                "match": 0.88
            },
            {
                "id": 156, 
                "title": "Full Stack Developer", 
                "companyName": "WebTech Systems",
                "location": "Hybrid - Delhi",
                "skills": ["JavaScript", "React", "Node.js", "MongoDB", "Express"],
                "stipend": "₹ 30,000 - 45,000 /month",
                "match": 0.75
            },
            {
                "id": 302, 
                "title": "Frontend Developer", 
                "companyName": "UX Dynamics",
                "location": "Work from home",
                "skills": ["HTML", "CSS", "JavaScript", "React", "Redux"],
                "stipend": "₹ 25,000 - 35,000 /month",
                "match": 0.82
            },
            {
                "id": 405, 
                "title": "DevOps Engineer", 
                "companyName": "Cloud Systems Inc",
                "location": "Mumbai",
                "skills": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
                "stipend": "₹ 45,000 - 65,000 /month",
                "match": 0.68
            }
        ]
        
        # Calculate match score based on skills overlap
        recommendations = []
        for job in sample_jobs:
            job_skills = job["skills"]
            if user_skills:
                # Calculate overlap between user skills and job skills
                overlap = set(user_skills).intersection(set(job_skills))
                match_score = len(overlap) / max(len(user_skills), len(job_skills))
                job["match"] = round(0.5 + (match_score * 0.5), 2)  # Base 0.5 + skill match
            recommendations.append(job)
        
        # Sort by match score
        recommendations.sort(key=lambda x: x["match"], reverse=True)
        
        return {
            "cluster": 2,  # Dummy cluster
            "recommendations": recommendations[:3]  # Return top 3
        }
        
    def _generate_recommendations(self, user_data, cluster):
        # This would use the cluster information to fetch relevant jobs
        # For now, we'll use the dummy implementation
        return self._dummy_recommendations(user_data)["recommendations"]