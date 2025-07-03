import os
import sys

def check_model_paths():
    """
    Check if model files exist and print diagnostic information.
    This is useful for troubleshooting deployment issues.
    """
    # Get the current working directory
    cwd = os.getcwd()
    print(f"Current working directory: {cwd}")
    
    # List the contents of the current directory
    print("Contents of current directory:")
    for item in os.listdir(cwd):
        print(f"  - {item}")
    
    # Check if saved_models directory exists
    saved_models_dir = os.path.join(cwd, 'saved_models')
    if os.path.exists(saved_models_dir):
        print(f"saved_models directory exists at: {saved_models_dir}")
        # List the contents of saved_models
        print("Contents of saved_models directory:")
        for item in os.listdir(saved_models_dir):
            print(f"  - {item}")
            
        # Check if job_verification-model directory exists
        job_model_dir = os.path.join(saved_models_dir, 'job_verification-model')
        if os.path.exists(job_model_dir):
            print(f"job_verification-model directory exists at: {job_model_dir}")
            # List the contents of job_verification-model
            print("Contents of job_verification-model directory:")
            for item in os.listdir(job_model_dir):
                print(f"  - {item}")
        else:
            print(f"job_verification-model directory does NOT exist at: {job_model_dir}")
    else:
        print(f"saved_models directory does NOT exist at: {saved_models_dir}")
    
    # Check various possible model paths
    model_paths = [
        os.path.join(cwd, 'saved_models', 'job_verification-model', 'job_fraud_detector.pkl'),
        os.path.join(cwd, 'saved_models/job_verification-model/job_fraud_detector.pkl'),
        './saved_models/job_verification-model/job_fraud_detector.pkl',
        'saved_models/job_verification-model/job_fraud_detector.pkl'
    ]
    
    print("\nChecking possible model paths:")
    for path in model_paths:
        if os.path.exists(path):
            print(f"✓ Model exists at: {path}")
        else:
            print(f"✗ Model does NOT exist at: {path}")
    
    # Check Python path
    print("\nPython path:")
    for p in sys.path:
        print(f"  - {p}")

if __name__ == "__main__":
    check_model_paths()