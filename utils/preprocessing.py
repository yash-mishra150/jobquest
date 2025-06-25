import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

def preprocess_job_data(job_details):
    features = []
    
    description = job_details.get('jobDescription', '')
    features.append(min(1.0, len(description) / 1000))
    
    has_company = 1 if job_details.get('companyName') else 0
    features.append(has_company)
    
    has_company_desc = 1 if job_details.get('aboutCompany') else 0
    features.append(has_company_desc)
    
    has_location = 1 if job_details.get('location') else 0
    features.append(has_location)
    
    skills_count = min(1.0, len(job_details.get('skills', [])) / 10)
    features.append(skills_count)
    
    has_openings = 1 if job_details.get('numberOfOpenings') else 0
    features.append(has_openings)    
    has_stipend = 1 if job_details.get('stipend') else 0
    features.append(has_stipend)
    
    has_duration = 1 if job_details.get('duration') else 0
    features.append(has_duration)
    
    return features

def preprocess_user_data(user_data):
    features = []
    
    features.append(user_data.get('login_frequency', 0) / 7)
    features.append(user_data.get('job_views', 0) / 100)
    features.append(user_data.get('application_rate', 0))
    
    features.append(user_data.get('remote_preference', 0) / 5)
    features.append(user_data.get('salary_importance', 0) / 5)
    
    features.append(user_data.get('profile_completeness', 0) / 100)
    
    return features

def preprocess_company_data(company_data):
    features = []
    
    import datetime
    current_year = datetime.datetime.now().year
    year_founded = company_data.get('year_founded', current_year)
    if isinstance(year_founded, str) and year_founded.isdigit():
        year_founded = int(year_founded)
    company_age = max(0, current_year - year_founded) / 100
    features.append(company_age)
    
    has_website = 1 if company_data.get('website') else 0
    features.append(has_website)
    
    social_media_count = len(company_data.get('social_media', [])) / 5
    features.append(social_media_count)
    
    description = company_data.get('description', '')
    features.append(min(1.0, len(description) / 1000))
    
    has_phone = 1 if company_data.get('phone') else 0
    has_email = 1 if company_data.get('email') else 0
    has_address = 1 if company_data.get('address') else 0
    features.append(has_phone)
    features.append(has_email)
    features.append(has_address)
    
    employee_count = company_data.get('employee_count', 0)
    if isinstance(employee_count, str) and employee_count.isdigit():
        employee_count = int(employee_count)
    features.append(min(1.0, employee_count / 1000))
    
    return features