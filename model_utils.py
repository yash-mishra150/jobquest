import re

# Define the preprocess_text function globally to ensure it's available for model loading
def preprocess_text(text, stop_words=None):
    """
    Preprocess text by converting to lowercase, removing digits, 
    extra whitespace, punctuation, and stop words.
    
    Parameters:
    text (str): The text to preprocess
    stop_words (list, optional): List of stop words to remove. Defaults to None.
    
    Returns:
    str: The preprocessed text
    """
    if not isinstance(text, str):
        text = str(text)
    text = text.lower()
    text = re.sub(r'\d+', '', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s]', '', text)
    if stop_words:
        text = ' '.join([word for word in text.split() if word not in stop_words])
    return text