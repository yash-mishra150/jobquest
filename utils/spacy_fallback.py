# Add spaCy model fallback
try:
    import spacy
    try:
        # Try to load the model
        nlp = spacy.load("en_core_web_sm")
        print("Successfully loaded en_core_web_sm model")
    except OSError:
        # If model not found, use a small blank model instead
        print("Warning: en_core_web_sm not found. Using blank model as fallback.")
        nlp = spacy.blank("en")
        # Make this available globally
        import builtins
        builtins.nlp = nlp
except ImportError:
    print("Warning: spaCy not installed. NLP features may be limited.")