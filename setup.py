#!/usr/bin/env python
"""
Setup script to initialize the project directory structure.
"""

import os
import argparse

def setup_project_structure(base_dir="."):
    """Create the project directory structure"""
    
    # Create directories
    directories = [
        "routes",
        "models",
        "utils",
        "saved_models",
        "logs",
        "tests"
    ]
    
    for directory in directories:
        dir_path = os.path.join(base_dir, directory)
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)
            print(f"Created directory: {dir_path}")
        
        # Create __init__.py file in each directory
        init_file = os.path.join(dir_path, "__init__.py")
        if not os.path.exists(init_file):
            with open(init_file, 'w') as f:
                f.write(f"# Initialize {directory} package")
            print(f"Created file: {init_file}")
    
    # Ensure .env file exists
    env_file = os.path.join(base_dir, ".env")
    if not os.path.exists(env_file):
        with open(env_file, 'w') as f:
            f.write("""# Flask configuration
FLASK_APP=app.py
FLASK_ENV=development
PORT=5000
DEBUG=True

# Security
SECRET_KEY=your_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_key_here

# CORS settings
CORS_ALLOW_ORIGINS=http://localhost:3000,https://jobquest.example.com

# Model paths (relative to project root)
JOB_VERIFICATION_MODEL_PATH=saved_models/job_verification_model.pkl
USER_CLUSTERING_MODEL_PATH=saved_models/user_clustering_model.pkl
SPACY_MODEL_PATH=saved_models/spacy_skills_model

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
""")
        print(f"Created file: {env_file}")
    
    print("\nProject structure setup complete!")
    print("\nNext steps:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Run the application: python app.py")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Setup JobQuest ML project structure")
    parser.add_argument("--dir", default=".", help="Base directory for the project")
    args = parser.parse_args()
    
    setup_project_structure(args.dir)