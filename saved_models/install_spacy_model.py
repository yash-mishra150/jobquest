#!/usr/bin/env python
"""
Script to install spaCy model in the saved_models folder
"""

import os
import sys
import shutil
import subprocess
import spacy

def install_spacy_model():
    """Install spaCy model to the saved_models folder"""
    
    # Set paths
    saved_models_dir = os.path.dirname(os.path.abspath(__file__))
    spacy_model_dir = os.path.join(saved_models_dir, 'spacy_skills_model')
    
    # Create the directory if it doesn't exist
    if not os.path.exists(spacy_model_dir):
        os.makedirs(spacy_model_dir)
        print(f"Created directory: {spacy_model_dir}")
    
    # Install the model if not already installed
    try:
        nlp = spacy.load("en_core_web_sm")
        print("spaCy model already installed, copying to saved_models folder...")
    except OSError:
        print("Installing spaCy model...")
        subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
        nlp = spacy.load("en_core_web_sm")
    
    # Save the model to the skills model directory
    nlp.to_disk(spacy_model_dir)
    print(f"spaCy model successfully saved to {spacy_model_dir}")
    
    return True

if __name__ == "__main__":
    success = install_spacy_model()
    if success:
        print("Installation complete!")
    else:
        print("Installation failed.")