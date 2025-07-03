import re
import spacy

class NameExtractor:
    def __init__(self):
        # Try to load spaCy model or use blank model as fallback
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except:
            self.nlp = spacy.blank("en")
        
        # Common titles to filter out
        self.titles = [
            'mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'professor', 'sir', 'madam', 
            'eng', 'engr', 'atty', 'advocate', 'capt', 'captain', 'rev', 'reverend'
        ]
        
        # Common Indian surname prefixes that should stay with the surname
        self.surname_prefixes = ['de', 'das', 'la', 'van', 'von', 'der', 'al', 'el']
        
    def clean_name(self, name):
        """Clean a name by removing titles and formatting correctly."""
        parts = name.split()
        clean_parts = []
        
        i = 0
        while i < len(parts):
            current = parts[i].lower().rstrip('.,:;')
            
            # Skip titles
            if current in self.titles:
                i += 1
                continue
            
            # Handle surname prefixes (e.g., "de Silva" should stay together)
            if i < len(parts) - 1 and current in self.surname_prefixes:
                clean_parts.append(parts[i] + ' ' + parts[i+1])
                i += 2
                continue
                
            # Add the current part with proper capitalization
            clean_parts.append(parts[i].capitalize())
            i += 1
            
        return ' '.join(clean_parts)
    
    def extract_with_nlp(self, text):
        """Extract name using NLP techniques."""
        doc = self.nlp(text[:500])  # Only process beginning of text for efficiency
        
        # Look for PERSON entities
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                return self.clean_name(ent.text)
                
        return ""
    
    def extract_from_position(self, text):
        """Extract name based on position in document."""
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        if not lines:
            return ""
        
        # Check first few lines for potential names
        potential_names = []
        
        for i in range(min(4, len(lines))):
            line = lines[i]
            # Names typically have 2-3 words and don't contain digits
            words = line.split()
            
            if 1 <= len(words) <= 4 and not any(c.isdigit() for c in line):
                # Skip lines that look like titles/headers
                if any(word.lower() in ['resume', 'cv', 'curriculum', 'vitae'] for word in words):
                    continue
                    
                # Skip lines that are all uppercase (likely headers)
                if not line.isupper():
                    potential_names.append(line)
        
        if potential_names:
            # Prefer shorter names (2-3 words) as they're more likely to be actual names
            sorted_names = sorted(potential_names, key=lambda x: len(x.split()))
            return self.clean_name(sorted_names[0])
            
        return ""
    
    def extract_name(self, text):
        """
        Extract name from resume text using multiple approaches.
        
        Args:
            text (str): The resume text
            
        Returns:
            str: The extracted name or empty string if none found
        """
        # First try NLP approach
        name = self.extract_with_nlp(text)
        
        # If NLP failed, try position-based approach
        if not name:
            name = self.extract_from_position(text)
            
        # Clean the name and ensure proper spacing
        if name:
            # Ensure there's no extra spacing
            name = re.sub(r'\s+', ' ', name).strip()
            
            # Combine single letter initials with surnames
            parts = name.split()
            i = 0
            while i < len(parts) - 1:
                if len(parts[i]) == 1:
                    parts[i] = parts[i] + '.' + parts[i+1]
                    parts.pop(i+1)
                else:
                    i += 1
                    
            name = ' '.join(parts)
            
        return name

# Example usage
if __name__ == "__main__":
    extractor = NameExtractor()
    test_text = """
    Yash Mishra
    Software Engineer
    
    Contact: yash.mishra@example.com
    """
    name = extractor.extract_name(test_text)
    print(f"Extracted name: {name}")