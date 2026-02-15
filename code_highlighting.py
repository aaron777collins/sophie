from pygments import highlight
from pygments.lexers import get_lexer_by_name
from pygments.formatters import HtmlFormatter

def highlight_code(code, language):
    """
    Highlight code for a given programming language.
    
    :param code: The source code to highlight
    :param language: The programming language of the code
    :return: HTML with syntax highlighting
    """
    try:
        # Attempt to get the appropriate lexer for the language
        lexer = get_lexer_by_name(language)
    except Exception:
        # Fallback to plain text if language is not recognized
        lexer = get_lexer_by_name('text')
    
    # Create an HTML formatter with default styling
    formatter = HtmlFormatter(linenos='table', style='default')
    
    # Generate the highlighted HTML
    highlighted_code = highlight(code, lexer, formatter)
    
    # Optional: Include CSS for styling
    css = formatter.get_style_defs('.highlight')
    
    return {
        'highlighted_html': highlighted_code,
        'css': css
    }

# Example usage
if __name__ == '__main__':
    python_code = '''
def greet(name):
    """Simple greeting function."""
    return f"Hello, {name}!"

# Test the function
print(greet("World"))
'''
    
    result = highlight_code(python_code, 'python')
    print(result['highlighted_html'])
    print("\nCSS:\n", result['css'])