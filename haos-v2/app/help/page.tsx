/**
 * Help Page
 * 
 * Demonstrates the contact form component with ticket submission functionality
 */

'use client';

import React from 'react';
import { PageErrorBoundary } from '../../components/error/error-boundary';
import ContactForm from '../../components/help/contact-form';
import type { ContactTicket } from '../../components/help/contact-form';

export default function HelpPage() {
  const handleSubmitSuccess = (ticket: ContactTicket) => {
    console.log('Ticket submitted successfully:', ticket);
  };

  const handleSubmitError = (error: Error) => {
    console.error('Error submitting ticket:', error);
  };

  return (
    <PageErrorBoundary pageName="help">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Help & Support
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Need help with HAOS v2? Submit a support ticket and our team will get back to you as soon as possible.
            </p>
          </div>

          {/* Contact Form */}
          <ContactForm
            onSubmitSuccess={handleSubmitSuccess}
            onSubmitError={handleSubmitError}
            className="mb-8"
          />

          {/* Additional Help Resources */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Other Ways to Get Help
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Documentation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Check out our comprehensive user guide and API documentation
                </p>
              </div>

              <div className="text-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Community</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Join our community forums to get help from other users
                </p>
              </div>

              <div className="text-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">FAQ</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Find quick answers to frequently asked questions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageErrorBoundary>
  );
}