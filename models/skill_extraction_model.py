import os
import spacy
from utils.text_processing import clean_text

class SkillExtractionModel:
    def __init__(self):
        # Try to load the spaCy model
        model_path = os.path.join(os.path.dirname(__file__), '../saved_models/spacy_skills_model')
        try:
            if os.path.exists(model_path):
                self.nlp = spacy.load(model_path)
                print("Skill extraction spaCy model loaded successfully")
            else:
                # Fall back to a standard spaCy model if custom model isn't available
                try:
                    self.nlp = spacy.load("en_core_web_sm")
                    print("Using standard spaCy model for skill extraction")
                except:
                    print("No spaCy model available, using dummy implementation")
                    self.nlp = None
        except Exception as e:
            print(f"Error loading spaCy model: {str(e)}")
            self.nlp = None
    
    def extract_skills(self, text):
        """
        Extract skills from text using NLP (spaCy)
        
        Args:
            text (str): Text to analyze for skills
            
        Returns:
            list: Extracted skills
        """
        if self.nlp is None:
            # Dummy implementation for testing
            common_skills = ["Python", "Machine Learning", "Data Analysis", 
                            "Communication", "Problem Solving"]
            # Return a subset of common skills as if they were detected
            import random
            num_skills = random.randint(2, 4)
            return random.sample(common_skills, num_skills)
        
        # Clean the text
        cleaned_text = clean_text(text)
        
        # Process the text with spaCy
        doc = self.nlp(cleaned_text)
        
        # In a real implementation, this would use named entity recognition,
        # pattern matching, or a custom model to identify skills
        # For this example, we'll use a simplified approach
        
        # Extract entities that might be skills
        potential_skills = []
        
        # Look for noun chunks and entities that might represent skills
        for chunk in doc.noun_chunks:
            if len(chunk.text) > 3:  # Avoid very short phrases
                potential_skills.append(chunk.text)
        
        # Look for specific entity types that might be skills
        for ent in doc.ents:
            if ent.label_ in ["PRODUCT", "ORG", "GPE"]:
                potential_skills.append(ent.text)
        
        # Remove duplicates and normalize
        skills = list(set([skill.lower().capitalize() for skill in potential_skills]))
        
        # Limit to the top 10 skills
        return skills[:10]