from flask import jsonify
from flask_restful import Resource
import platform
import time

class HealthCheckResource(Resource):
    def get(self):
        """Health check endpoint for the API"""
        return jsonify({
            "status": "healthy",
            "timestamp": time.time(),
            "version": "1.0.0",
            "python_version": platform.python_version(),
            "platform": platform.platform()
        })