import os
import re
import PyPDF2
import spacy
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from pdfminer.high_level import extract_text as pdfminer_extract_text

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

def extract_phone(text):
    phone_pattern = r'(\+\d{1,3}[-.\s]?)?(\d{3}[-.\s]?)?\d{3}[-.\s]?\d{4}'
    phones = re.findall(phone_pattern, text)
    formatted_phones = []
    for phone in phones:
        formatted_phone = ''.join(phone)
        if formatted_phone:
            formatted_phones.append(formatted_phone)
    return formatted_phones[0] if formatted_phones else ""

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
    nlp = spacy.load("en_core_web_sm")
    
    common_skills = [
        "python", "java", "javascript", "react", "node.js", "html", "css",
        "sql", "nosql", "mongodb", "mysql", "postgresql", "aws", "azure",
        "docker", "kubernetes", "git", "machine learning", "data analysis",
        "excel", "powerpoint", "word", "communication", "leadership",
        "project management", "agile", "scrum", "c++", "c#", "php", "ruby",
        "swift", "kotlin", "angular", "vue.js", "django", "flask", "spring",
        "hibernate", "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn"
    ]
    
    doc = nlp(text.lower())
    tokens = [token.text for token in doc if not token.is_stop and not token.is_punct]
    
    skills = []
    for token in tokens:
        if token in common_skills and token not in skills:
            skills.append(token)
            
    for skill in common_skills:
        if skill in text.lower() and skill not in skills:
            skills.append(skill)
            
    return skills

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
        
    data = {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "education": extract_education(text),
        "skills": extract_skills(text),
        "experience": extract_experience(text)
    }
    
    return data