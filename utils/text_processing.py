import re
import string

def clean_text(text):
    """
    Clean and normalize text for NLP processing
    
    Args:
        text (str): Raw text
        
    Returns:
        str: Cleaned text
    """
    # Convert to lowercase
    text = text.lower()
    
    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    
    # Remove email addresses
    text = re.sub(r'\S+@\S+', '', text)
    
    # Remove punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def extract_keywords(text, n=10):
    """
    Extract keywords from text
    
    Args:
        text (str): Input text
        n (int): Number of keywords to extract
        
    Returns:
        list: Keywords
    """
    # This is a placeholder for a more sophisticated keyword extraction
    # In a real implementation, you might use TF-IDF, TextRank, etc.
    
    # Clean the text
    cleaned_text = clean_text(text)
    
    # Split into words
    words = cleaned_text.split()
    
    # Remove common stop words (a simple list for demonstration)
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 
                  'were', 'be', 'been', 'being', 'in', 'on', 'at', 'to', 'for',
                  'with', 'by', 'about', 'from', 'of', 'as', 'have', 'has', 'had'}
    
    words = [word for word in words if word not in stop_words]
    
    # Count word frequencies
    word_counts = {}
    for word in words:
        if len(word) > 2:  # Skip very short words
            word_counts[word] = word_counts.get(word, 0) + 1
    
    # Sort by frequency
    sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
    
    # Extract top n keywords
    keywords = [word for word, count in sorted_words[:n]]
    
    return keywords

def preprocess_text(text, stop_words=None):
    text = text.lower()
    text = re.sub(r'\d+', '', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s]', '', text)
    if stop_words:
        text = [word for word in text.split() if word not in stop_words]
        return ' '.join(text)
    return text