import os
import uuid
import werkzeug
from flask import request, current_app
from flask_restful import Resource
from utils.resume_parser import extract_resume_data

class ResumeExtractionResource(Resource):
    def __init__(self):
        self.upload_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
        if not os.path.exists(self.upload_folder):
            os.makedirs(self.upload_folder)
    
    def post(self):
        try:
            if 'resume' not in request.files:
                return {"error": "No resume file provided"}, 400
                
            resume_file = request.files['resume']
            
            if resume_file.filename == '':
                return {"error": "No file selected"}, 400
                
            if not resume_file.filename.lower().endswith('.pdf'):
                return {"error": "Only PDF files are supported"}, 400
              # Save the uploaded file with a unique name
            filename = str(uuid.uuid4()) + '.pdf'
            file_path = os.path.join(self.upload_folder, filename)
            resume_file.save(file_path)
            
            # Extract data from the resume
            result = extract_resume_data(file_path)
            
            # Remove the file after processing
            if os.path.exists(file_path):
                os.remove(file_path)
            
            if "error" in result:
                return {"status": "error", "message": result["error"]}, 400
            
            return {
                "status": "success",
                "data": result
            }, 200
            
        except Exception as e:
            return {"status": "error", "message": str(e)}, 500
            
    def get(self):
        return {
            "status": "success",
            "message": "Resume extraction API is working. Use POST to upload and analyze a resume."
        }, 200