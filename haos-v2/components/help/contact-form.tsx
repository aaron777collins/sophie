/**
 * Contact Form Component
 * 
 * Help/support contact form with ticket submission functionality.
 * Provides users with a way to submit support requests and feedback.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { ComponentErrorBoundary } from '../error/error-boundary';
import { errorReporter } from '../../lib/monitoring/error-reporter';

export interface ContactTicket {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'bug' | 'feature-request' | 'general' | 'technical-support' | 'billing' | 'other';
  attachments?: File[];
  createdAt?: Date;
  status?: 'pending' | 'in-progress' | 'resolved' | 'closed';
}

export interface ContactFormProps {
  onSubmitSuccess?: (ticket: ContactTicket) => void;
  onSubmitError?: (error: Error) => void;
  initialData?: Partial<ContactTicket>;
  className?: string;
}

export interface SubmitResponse {
  success: boolean;
  ticketId?: string;
  message: string;
  error?: string;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', description: 'General inquiries, non-urgent issues' },
  { value: 'medium', label: 'Medium', description: 'Standard support requests' },
  { value: 'high', label: 'High', description: 'Issues affecting functionality' },
  { value: 'critical', label: 'Critical', description: 'Service outages, security issues' },
] as const;

const CATEGORY_OPTIONS = [
  { value: 'bug', label: 'Bug Report', description: 'Report a software bug or error' },
  { value: 'feature-request', label: 'Feature Request', description: 'Suggest new features or improvements' },
  { value: 'technical-support', label: 'Technical Support', description: 'Help with setup, configuration, or usage' },
  { value: 'billing', label: 'Billing', description: 'Account, subscription, or payment issues' },
  { value: 'general', label: 'General Inquiry', description: 'Questions about the service' },
  { value: 'other', label: 'Other', description: 'Other topics not listed above' },
] as const;

/**
 * Simulate ticket submission API call
 * In a real implementation, this would call your backend API
 */
const submitTicket = async (ticket: ContactTicket): Promise<SubmitResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Simulate occasional API errors for testing
  if (Math.random() < 0.1) {
    throw new Error('Service temporarily unavailable. Please try again later.');
  }
  
  // Generate mock ticket ID
  const ticketId = `HAOS-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  // Log ticket submission for development
  console.log('Ticket submitted:', { ...ticket, ticketId });
  
  // Report to monitoring service
  errorReporter.setTags({
    feature: 'contact-form',
    ticketCategory: ticket.category,
    ticketPriority: ticket.priority,
  });
  
  return {
    success: true,
    ticketId,
    message: `Your support ticket has been submitted successfully. Ticket ID: ${ticketId}`,
  };
};

/**
 * Validate form data
 */
const validateFormData = (data: Partial<ContactTicket>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  if (!data.name?.trim()) {
    errors.name = 'Name is required';
  }
  
  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!data.subject?.trim()) {
    errors.subject = 'Subject is required';
  } else if (data.subject.length < 5) {
    errors.subject = 'Subject must be at least 5 characters long';
  }
  
  if (!data.message?.trim()) {
    errors.message = 'Message is required';
  } else if (data.message.length < 10) {
    errors.message = 'Message must be at least 10 characters long';
  }
  
  if (!data.category) {
    errors.category = 'Please select a category';
  }
  
  if (!data.priority) {
    errors.priority = 'Please select a priority level';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const ContactForm: React.FC<ContactFormProps> = ({
  onSubmitSuccess,
  onSubmitError,
  initialData = {},
  className = '',
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<ContactTicket>>({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general',
    attachments: [],
    ...initialData,
  });
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmitResponse | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Handle input changes
  const handleInputChange = useCallback((field: keyof ContactTicket, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle field blur (for validation timing)
  const handleFieldBlur = useCallback((field: string) => {
    setTouchedFields(prev => {
      const newSet = new Set(prev);
      newSet.add(field);
      return newSet;
    });
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation display
    const allFields = new Set<string>();
    allFields.add('name');
    allFields.add('email');
    allFields.add('subject');
    allFields.add('message');
    allFields.add('category');
    allFields.add('priority');
    setTouchedFields(allFields);
    
    // Validate form
    const validation = validateFormData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const result = await submitTicket(formData as ContactTicket);
      setSubmissionResult(result);
      setIsSubmitted(true);
      
      if (onSubmitSuccess) {
        onSubmitSuccess(formData as ContactTicket);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setSubmissionResult({
        success: false,
        message: errorMessage,
        error: errorMessage,
      });
      
      if (onSubmitError) {
        onSubmitError(error instanceof Error ? error : new Error(errorMessage));
      }
      
      // Report error to monitoring
      errorReporter.captureError(error instanceof Error ? error : new Error(errorMessage), {
        feature: 'contact-form',
        extra: {
          formData: { ...formData, message: '[REDACTED]' }, // Don't log message content
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle starting over
  const handleStartOver = () => {
    setIsSubmitted(false);
    setSubmissionResult(null);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      priority: 'medium',
      category: 'general',
      attachments: [],
      ...initialData,
    });
    setErrors({});
    setTouchedFields(new Set());
  };

  // Success state
  if (isSubmitted && submissionResult?.success) {
    return (
      <div className={`max-w-2xl mx-auto ${className}`}>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            Ticket Submitted Successfully!
          </h3>
          
          <p className="text-green-700 dark:text-green-300 mb-4">
            {submissionResult.message}
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded border p-3 mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Reference Number:</p>
            <p className="font-mono text-lg font-semibold text-gray-900 dark:text-gray-100">
              {submissionResult.ticketId}
            </p>
          </div>
          
          <div className="space-x-4">
            <button
              onClick={handleStartOver}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Submit Another Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state (submission failed)
  if (isSubmitted && submissionResult && !submissionResult.success) {
    return (
      <div className={`max-w-2xl mx-auto ${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                Submission Failed
              </h3>
              
              <p className="text-red-700 dark:text-red-300 mb-4">
                {submissionResult.message}
              </p>
              
              <div className="space-x-4">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
                
                <button
                  onClick={handleStartOver}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Contact Support
          </h2>
          
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={() => handleFieldBlur('name')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                  touchedFields.has('name') && errors.name 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Your full name"
              />
              {touchedFields.has('name') && errors.name && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleFieldBlur('email')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                  touchedFields.has('email') && errors.email 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="your.email@example.com"
              />
              {touchedFields.has('email') && errors.email && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>
          
          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                id="category"
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                onBlur={() => handleFieldBlur('category')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                  touchedFields.has('category') && errors.category 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select category...</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {touchedFields.has('category') && errors.category && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.category}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority *
              </label>
              <select
                id="priority"
                value={formData.priority || ''}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                onBlur={() => handleFieldBlur('priority')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                  touchedFields.has('priority') && errors.priority 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select priority...</option>
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {touchedFields.has('priority') && errors.priority && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.priority}</p>
              )}
            </div>
          </div>
          
          {/* Subject */}
          <div className="mb-6">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject || ''}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              onBlur={() => handleFieldBlur('subject')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                touchedFields.has('subject') && errors.subject 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Brief description of your issue or request"
            />
            {touchedFields.has('subject') && errors.subject && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.subject}</p>
            )}
          </div>
          
          {/* Message */}
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message *
            </label>
            <textarea
              id="message"
              rows={6}
              value={formData.message || ''}
              onChange={(e) => handleInputChange('message', e.target.value)}
              onBlur={() => handleFieldBlur('message')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                touchedFields.has('message') && errors.message 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Please provide detailed information about your issue or request. Include any error messages, steps to reproduce, or relevant context."
            />
            {touchedFields.has('message') && errors.message && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.message}</p>
            )}
            
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Provide as much detail as possible for faster resolution</span>
              <span>{formData.message?.length || 0} characters</span>
            </div>
          </div>
          
          {/* Help text based on category */}
          {formData.category && (
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Tip for {CATEGORY_OPTIONS.find(c => c.value === formData.category)?.label}:</strong>{' '}
                {CATEGORY_OPTIONS.find(c => c.value === formData.category)?.description}
              </p>
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleStartOver}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Form
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            <span>{isSubmitting ? 'Submitting...' : 'Submit Ticket'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

// Export wrapped with error boundary
export default function ContactFormWithErrorBoundary(props: ContactFormProps) {
  return (
    <ComponentErrorBoundary 
      componentName="contact-form"
      enableUserFeedback={true}
    >
      <ContactForm {...props} />
    </ComponentErrorBoundary>
  );
}