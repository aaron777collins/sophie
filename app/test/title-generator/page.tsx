/**
 * @file Test page for Title Generator
 * @spec clawd-l92.6 - Title Generation
 * @bead clawd-l92.6
 * 
 * This test page allows E2E testing without authentication.
 * Not for production use - test only.
 */

import { TitleGeneratorPanel } from '../../../components/editor/TitleGeneratorPanel';

export default function TitleGeneratorTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Title Generator Test Page
        </h1>
        <p className="text-gray-600 mb-6">
          This page is for E2E testing. Enter transcript text and generate AI-powered titles.
        </p>
        <TitleGeneratorPanel />
      </div>
    </div>
  );
}
