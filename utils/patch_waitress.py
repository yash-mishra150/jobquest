import sys
import re

# This monkeypatches the waitress __main__ module to include preprocess_text
def apply_patch():
    try:
        # Define preprocess_text function
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
        
        # Try to find the waitress __main__ module
        for module_name in list(sys.modules.keys()):
            if 'waitress' in module_name and '__main__' in module_name:
                sys.modules[module_name].__dict__['preprocess_text'] = preprocess_text
                print(f"Patched {module_name} with preprocess_text function")
        
        # Also patch the actual __main__ module
        if '__main__' in sys.modules:
            sys.modules['__main__'].__dict__['preprocess_text'] = preprocess_text
            print("Patched __main__ with preprocess_text function")
        
        # Make it available in the current module too
        globals()['preprocess_text'] = preprocess_text
        
        return True
    except Exception as e:
        print(f"Error applying patch: {e}")
        return False