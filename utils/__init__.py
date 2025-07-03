# Makes the utils directory a Python package
from .text_processing import preprocess_text
from .patch_waitress import apply_patch

# Apply the waitress patch automatically when utils is imported
apply_patch()

# Import spaCy fallback
try:
    from . import spacy_fallback
except Exception as e:
    print(f"Warning: Could not import spacy_fallback: {e}")

__all__ = ['preprocess_text', 'apply_patch', 'spacy_fallback']