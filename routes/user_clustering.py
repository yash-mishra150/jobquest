from flask import request
from flask_restful import Resource
from models.user_clustering_model import UserClusteringModel

class UserClusteringResource(Resource):
    def __init__(self):
        self.model = UserClusteringModel()
    
    def post(self):
        try:
            data = request.get_json()
            
            if not data:
                return {"error": "No data provided"}, 400
                  # Extract user data from request
            user_data = data
            if 'user_data' in data:
                user_data = data.get('user_data', {})
            
            # Get recommendations using clustering model
            result = self.model.get_recommendations(user_data)
            
            return {
                "status": "success",
                "cluster": result["cluster"],
                "recommendations": result["recommendations"]
            }, 200
            
        except Exception as e:
            return {"status": "error", "message": str(e)}, 500