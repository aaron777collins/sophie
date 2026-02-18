import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Simplified version to debug validation
function SimpleModal() {
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({ matrixId: '' });

  const validateMatrixId = (matrixId) => {
    console.log('validateMatrixId called with:', matrixId);
    if (!matrixId.trim()) {
      return 'Matrix ID is required';
    }
    return undefined;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('handleSubmit called');
    
    const errors = {};
    const matrixIdError = validateMatrixId(formData.matrixId);
    console.log('matrixIdError:', matrixIdError);
    
    if (matrixIdError) {
      errors.matrixId = matrixIdError;
    }

    console.log('Setting validation errors:', errors);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }
  };

  console.log('Rendering with validationErrors:', validationErrors);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input 
          value={formData.matrixId}
          onChange={(e) => setFormData({matrixId: e.target.value})}
          placeholder="Matrix ID"
        />
        {validationErrors.matrixId && (
          <div data-testid="error-message">{validationErrors.matrixId}</div>
        )}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

// Test this simple component
console.log('Testing simple modal...');
const { container } = render(<SimpleModal />);

console.log('Initial HTML:', container.innerHTML);

const submitButton = screen.getByText('Submit');
console.log('Clicking submit button...');
fireEvent.click(submitButton);

console.log('HTML after click:', container.innerHTML);

const errorElement = screen.queryByTestId('error-message');
console.log('Error element found:', errorElement ? errorElement.textContent : 'NOT FOUND');