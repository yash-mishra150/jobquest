import os
import re
import PyPDF2
import spacy
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from pdfminer.high_level import extract_text as pdfminer_extract_text
from .skill_extractor import SkillExtractor  # Import the new SkillExtractor
from .phone_extractor import extract_phone  # Import the specialized phone extractor

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
    
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        # First try with PyPDF2
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page_num in range(len(pdf_reader.pages)):
                text += pdf_reader.pages[page_num].extract_text()
                
        # If PyPDF2 fails to extract meaningful text, try pdfminer
        if not text.strip():
            text = pdfminer_extract_text(pdf_path)
            
    except Exception as e:
        print(f"Error extracting text: {str(e)}")
    
    return text

def extract_name(text):
    name = ""
    lines = text.split('\n')
    if lines:
        name = lines[0].strip()
        
    return name

def extract_email(text):
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    return emails[0] if emails else ""

def extract_education(text):
    education = []
    education_keywords = [
        'Bachelor', 'Master', 'PhD', 'B.Tech', 'M.Tech', 'B.E.', 'M.E.',
        'B.Sc', 'M.Sc', 'B.A.', 'M.A.', 'BBA', 'MBA', 'Diploma'
    ]
    
    lines = text.split('\n')
    for line in lines:
        for keyword in education_keywords:
            if keyword.lower() in line.lower():
                education.append(line.strip())
                break
                
    return education

def extract_skills(text):
    try:
        # Use the new SkillExtractor class
        skill_extractor = SkillExtractor()
        result = skill_extractor.extract_skills(text)
        
        # Return all extracted skills
        return result["all_skills"]
    except Exception as e:
        print(f"Error in skill extraction: {str(e)}")
        # Fallback if something goes wrong
        common_skills = [
            "python", "java", "javascript", "react", "node.js", "html", "css",
            "sql", "nosql", "mongodb", "mysql", "postgresql", "aws", "azure",
            "docker", "kubernetes", "git", "machine learning", "data analysis"
        ]
        return [skill for skill in common_skills if skill in text.lower()]

# Helper function to check similarity between strings
def similar(a, b):
    a = a.lower()
    b = b.lower()
    # Exact match
    if a == b:
        return True
    # Contained match
    if a in b or b in a:
        return True
    # Acronym match (e.g., "artificial intelligence" and "ai")
    if len(a) > 1 and a.isalpha():
        words = b.split()
        if len(words) > 1:
            acronym = ''.join(word[0] for word in words if word)
            if acronym == a:
                return True
    return False

def extract_experience(text):
    experience = []
    
    experience_patterns = [
        r'(?i)experience',
        r'(?i)work\s+experience',
        r'(?i)employment\s+history'
    ]
    
    for pattern in experience_patterns:
        match = re.search(pattern, text)
        if match:            
            start_idx = match.start()
            next_section = re.search(r'(?i)(education|skills|projects|achievements)', text[start_idx:])
            
            if next_section:
                exp_text = text[start_idx:start_idx + next_section.start()]
            else:
                exp_text = text[start_idx:]
                
            lines = exp_text.split('\n')
            for line in lines:
                if line.strip() and not line.strip().lower() in ['experience', 'work experience', 'employment history']:
                    experience.append(line.strip())
                    
            break
            
    return experience

def extract_resume_data(pdf_path):
    if not os.path.exists(pdf_path):
        return {"error": "File not found"}
        
    text = extract_text_from_pdf(pdf_path)
    
    if not text:
        return {"error": "Could not extract text from PDF"}
    
    # Extract skills with categories
    skill_extractor = SkillExtractor()
    skills_data = skill_extractor.extract_skills(text)
        
    data = {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "education": extract_education(text),
        "skills": skills_data["all_skills"],
        "skills_by_category": skills_data["categorized_skills"],
        "skills_array": skills_data["all_skills"],  # Adding skills in array format
        "experience": extract_experience(text)
    }
    
    return data