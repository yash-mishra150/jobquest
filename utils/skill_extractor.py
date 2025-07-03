import nltk
import spacy
import re
import os
from nltk.corpus import stopwords, wordnet
from nltk.tokenize import word_tokenize
import json

# Ensure NLTK data is downloaded
try:
    nltk.data.find('corpora/stopwords')
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('stopwords')
    nltk.download('punkt')
    nltk.download('wordnet')

class SkillExtractor:
    def __init__(self, custom_skills_path=None):
        """
        Initialize the skill extractor.
        
        Args:
            custom_skills_path (str, optional): Path to a JSON file containing custom skills categories.
        """
        # Load spaCy model
        try:
            model_path = os.path.join(os.path.dirname(__file__), '../saved_models/spacy_skills_model')
            self.nlp = spacy.load(model_path) if os.path.exists(model_path) else spacy.load("en_core_web_sm")
        except:
            self.nlp = spacy.blank("en")
        
        # Default skill categories
        self.skill_categories = {
            "programming_languages": [
                "python", "java", "javascript", "c++", "c#", "ruby", "php", "swift", 
                "kotlin", "go", "rust", "typescript", "scala", "perl", "r", "matlab"
            ],
            "web_development": [
                "html", "css", "react", "angular", "vue.js", "node.js", "express", 
                "django", "flask", "spring", "asp.net", "jquery", "bootstrap", "tailwind"
            ],
            "databases": [
                "sql", "mysql", "postgresql", "mongodb", "sqlite", "oracle", "cassandra",
                "redis", "firebase", "dynamodb", "mariadb", "neo4j", "elasticsearch"
            ],
            "cloud_platforms": [
                "aws", "azure", "gcp", "google cloud", "heroku", "digitalocean", 
                "kubernetes", "docker", "terraform", "cloudformation"
            ],
            "data_science": [
                "machine learning", "deep learning", "ai", "artificial intelligence",
                "data analysis", "data visualization", "pandas", "numpy", "scikit-learn",
                "tensorflow", "pytorch", "keras", "tableau", "power bi", "statistics"
            ],
            "soft_skills": [
                "communication", "leadership", "teamwork", "problem solving",
                "critical thinking", "time management", "project management",
                "creativity", "adaptability", "collaboration"
            ],
            "methodologies": [
                "agile", "scrum", "kanban", "waterfall", "devops", "ci/cd", "tdd",
                "bdd", "lean", "six sigma", "itil"
            ]
        }
        
        # Load custom skills if provided
        if custom_skills_path and os.path.exists(custom_skills_path):
            try:
                with open(custom_skills_path, 'r') as f:
                    custom_skills = json.load(f)
                    # Merge custom skills with default skills
                    for category, skills in custom_skills.items():
                        if category in self.skill_categories:
                            self.skill_categories[category].extend(skills)
                        else:
                            self.skill_categories[category] = skills
            except Exception as e:
                print(f"Error loading custom skills: {e}")
        
        # Flatten all skills into a single list
        self.all_skills = []
        for category in self.skill_categories.values():
            self.all_skills.extend(category)
    
    def similar(self, a, b):
        """Check if two strings are similar."""
        a = a.lower()
        b = b.lower()
        # Exact match
        if a == b:
            return True
        # Contained match
        if a in b or b in a:
            return True
        # Acronym match
        if len(a) > 1 and a.isalpha():
            words = b.split()
            if len(words) > 1:
                acronym = ''.join(word[0] for word in words if word)
                if acronym == a:
                    return True
        return False
    
    def extract_skills(self, text):
        """
        Extract skills from text using multiple NLP techniques.
        
        Args:
            text (str): The text to extract skills from.
            
        Returns:
            dict: Dictionary with skills categorized by type and a list of all skills.
        """
        try:
            # Clean the text
            text = text.lower()
            
            # First pass: Find exact matches
            identified_skills = set()
            for skill in self.all_skills:
                if re.search(r'\b' + re.escape(skill) + r'\b', text):
                    identified_skills.add(skill)
            
            # Second pass: Process with spaCy
            doc = self.nlp(text)
            
            # Extract entities
            for ent in doc.ents:
                if ent.label_ in ["PRODUCT", "ORG", "GPE"]:
                    skill_candidate = ent.text.lower()
                    if any(self.similar(skill_candidate, skill) for skill in self.all_skills):
                        identified_skills.add(skill_candidate)
            
            # Extract noun phrases
            for chunk in doc.noun_chunks:
                chunk_text = chunk.text.lower()
                for skill in self.all_skills:
                    if skill in chunk_text:
                        identified_skills.add(skill)
            
            # Third pass: Use NLTK
            tokens = word_tokenize(text)
            stop_words = set(stopwords.words('english'))
            filtered_tokens = [word for word in tokens if word.isalpha() and word not in stop_words]
            
            # Use WordNet to find technical terms
            for token in filtered_tokens:
                if len(token) > 3:  # Most skill names are longer
                    synsets = wordnet.synsets(token)
                    for synset in synsets:
                        if any(tech_term in synset.definition() for tech_term in ['technology', 'computing', 'software', 'programming']):
                            identified_skills.add(token)
            
            # Categorize the identified skills
            categorized_skills = {}
            for category, skills in self.skill_categories.items():
                categorized_skills[category] = [skill for skill in identified_skills if skill in skills]
            
            # Add uncategorized skills
            all_categorized = set()
            for skills in categorized_skills.values():
                all_categorized.update(skills)
            
            uncategorized = identified_skills - all_categorized
            if uncategorized:
                categorized_skills["other"] = list(uncategorized)
            
            return {
                "all_skills": list(identified_skills),
                "categorized_skills": categorized_skills
            }
            
        except Exception as e:
            print(f"Error in skill extraction: {e}")
            return {
                "all_skills": [],
                "categorized_skills": {}
            }

# Example usage
if __name__ == "__main__":
    extractor = SkillExtractor()
    sample_text = """
    Software Engineer with 5 years of experience in Python, JavaScript, and React. 
    Proficient in AWS cloud services including EC2, S3, and Lambda. 
    Experience with machine learning using TensorFlow and scikit-learn.
    """
    skills = extractor.extract_skills(sample_text)
    print(json.dumps(skills, indent=2))