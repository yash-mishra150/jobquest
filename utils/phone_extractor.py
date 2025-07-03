import re

def extract_phone(text):
    # Comprehensive list of phone patterns
    phone_patterns = [
        # Indian format: +91 XXXXX XXXXX or +91-XXXXX-XXXXX
        r'(?:\+91)[-\s]?(\d{5})[-\s]?(\d{5})',
        
        # International format with various separators
        r'(?:\+\d{1,3})[-\.\s]?(\d{3})[-\.\s]?(\d{3})[-\.\s]?(\d{4})',
        
        # US/Canada format: (XXX) XXX-XXXX
        r'\((\d{3})\)[-\.\s]?(\d{3})[-\.\s]?(\d{4})',
        
        # Basic 10-digit format with various separators
        r'(\d{3})[-\.\s]?(\d{3})[-\.\s]?(\d{4})',
        
        # Indian mobile without country code (10 digits starting with 6-9)
        r'\b([6-9]\d{2})[-\.\s]?(\d{3})[-\.\s]?(\d{4})\b',
        
        # Any sequence of digits that might be a phone number (fallback)
        r'\b\d{8,15}\b'
    ]
    
    for pattern in phone_patterns:
        matches = re.findall(pattern, text)
        if matches:
            # Handle tuple returns from regex groups
            if isinstance(matches[0], tuple):
                # Join the matched groups to form the complete number
                phone = ''.join(matches[0])
                
                # If it's likely an Indian number without country code, add it
                if len(phone) == 10 and phone[0] in '6789':
                    return "+91" + phone
                    
                # Add country code for 10-digit numbers if missing
                elif len(phone) == 10:
                    return "+1" + phone  # Assuming US/Canada as default
                    
                return phone
            else:
                # Handle single match (not in groups)
                phone = matches[0]
                
                # Clean the phone number
                cleaned = ''.join(c for c in phone if c.isdigit() or c == '+')
                
                # Add appropriate country code if missing
                if len(cleaned) == 10 and cleaned[0] in '6789':
                    return "+91" + cleaned
                elif len(cleaned) == 10:
                    return "+1" + cleaned
                    
                return cleaned
    
    return ""