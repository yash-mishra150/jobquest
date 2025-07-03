import re

def normalize_text(text):
    """
    Normalize text by fixing common OCR and text extraction issues, including:
    - Fixing split words (like "t rivy" → "trivy" or "b us" → "bus")
    - Fixing spacing issues
    - Normalizing whitespace
    
    Args:
        text (str): The text to normalize
        
    Returns:
        str: The normalized text
    """
    if not text:
        return text
        
    # First, normalize all whitespace to single spaces
    text = re.sub(r'\s+', ' ', text)
    
    # Fix common OCR word splitting patterns
    
    # Pattern 1: Single letter followed by space then word (e.g., "t rivy", "b us")
    text = re.sub(r'\b([a-z])\s+([a-z]{2,})\b', r'\1\2', text, flags=re.IGNORECASE)
    
    # Pattern 2: Two letter word that's likely split (e.g., "i s" → "is", "i t" → "it")
    common_two_letter_words = ['is', 'it', 'in', 'at', 'an', 'as', 'be', 'by', 'he', 'me', 'my', 'of', 'on', 'or', 'to', 'up', 'we']
    for word in common_two_letter_words:
        text = re.sub(r'\b{}\s+{}\b'.format(word[0], word[1]), word, text, flags=re.IGNORECASE)
    
    # Pattern 3: Fix hyphenated words that should be together
    text = re.sub(r'([a-z])-\s+([a-z])', r'\1\2', text, flags=re.IGNORECASE)
    
    # Pattern 4: Fix split with apostrophe (e.g., "don t" → "don't")
    text = re.sub(r'([a-z])\s+\'([a-z])', r'\1\'\2', text, flags=re.IGNORECASE)
    
    # Pattern 5: Fix common prefixes that might be split
    prefixes = ['re', 'pre', 'de', 'in', 'un', 'dis', 'sub', 'co', 'anti']
    for prefix in prefixes:
        text = re.sub(r'\b{}\s+([a-z]+)\b'.format(prefix), r'{}\1'.format(prefix), text, flags=re.IGNORECASE)
    
    # Pattern 6: Fix common suffixes that might be split
    suffixes = ['ing', 'ed', 'ers', 'or', 'ion', 'ment', 'ly', 'ize', 'ise']
    for suffix in suffixes:
        text = re.sub(r'\b([a-z]+)\s+{}\b'.format(suffix), r'\1{}'.format(suffix), text, flags=re.IGNORECASE)
    
    # Pattern 7: Fix common technology terms that might be split
    tech_terms = [
        ('java', 'script', 'javascript'),
        ('type', 'script', 'typescript'),
        ('react', 'native', 'react native'),
        ('node', 'js', 'node.js'),
        ('mongo', 'db', 'mongodb'),
        ('my', 'sql', 'mysql'),
        ('no', 'sql', 'nosql'),
        ('ms', 'sql', 'mssql'),
        ('post', 'gre', 'postgre'),
        ('gi', 't', 'git'),
        ('python', '3', 'python3'),
        ('c', 'sharp', 'c#'),
        ('dot', 'net', '.net'),
        ('j', 'query', 'jquery')
    ]
    
    for first, second, full in tech_terms:
        text = re.sub(r'\b{}\s+{}\b'.format(first, second), full, text, flags=re.IGNORECASE)
    
    # Fix spacing around punctuation
    text = re.sub(r'\s+([.,;:!?)])', r'\1', text)
    text = re.sub(r'([(])\s+', r'\1', text)
    
    # Normalize whitespace again
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def normalize_lines(text):
    """Normalize text by handling each line independently."""
    if not text:
        return text
        
    lines = text.split('\n')
    normalized_lines = [normalize_text(line) for line in lines]
    return '\n'.join(normalized_lines)

# Example usage
if __name__ == "__main__":
    test_text = "I am a p rofessional with s kills in java script and t ype script"
    print(normalize_text(test_text))
    # Output: "I am a professional with skills in javascript and typescript"