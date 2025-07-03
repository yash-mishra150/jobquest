import re
import sys

# Define preprocess_text in the global namespace for pickle loading
def preprocess_text(text, stop_words=None):
    if not isinstance(text, str):
        text = str(text)
    text = text.lower()
    text = re.sub(r'\d+', '', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s]', '', text)
    if stop_words:
        text = ' '.join([word for word in text.split() if word not in stop_words])
    return text

# Make it available in globals AND in sys.modules['__main__']
globals()['preprocess_text'] = preprocess_text
sys.modules['__main__'].__dict__['preprocess_text'] = preprocess_text

# Now import the app after preprocess_text is defined
from app import app

if __name__ == "__main__":
    app.run()