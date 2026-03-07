import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { TitleGenerator } from '@/src/components/ai/TitleGenerator';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('TitleGenerator Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });
  it('renders generate button', () => {
    render(<TitleGenerator transcriptText="Test content" />);
    expect(screen.getByTestId('generate-titles-button')).toBeInTheDocument();
  });

  it('shows loading state when generating', async () => {
    render(<TitleGenerator transcriptText="Test content" />);
    fireEvent.click(screen.getByTestId('generate-titles-button'));
    expect(screen.getByText(/generating/i)).toBeInTheDocument();
  });

  it('displays suggestions after generation', async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        suggestions: [
          {
            id: '1',
            title: 'Test Title 1',
            category: 'descriptive',
            engagementScore: 85,
            confidence: 0.9,
            characterCount: 12
          },
          {
            id: '2',
            title: 'Test Title 2',
            category: 'clickbait',
            engagementScore: 92,
            confidence: 0.8,
            characterCount: 12
          }
        ],
        detectedTopics: ['cooking'],
        contentSummary: 'Content about cooking',
        generatedAt: new Date().toISOString(),
        processingTimeMs: 1000
      })
    });

    render(<TitleGenerator transcriptText="Test content about cooking" />);
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('generate-titles-button'));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('title-suggestions')).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    // Mock API failure
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Service unavailable' }),
    });

    render(<TitleGenerator transcriptText="Test" />);
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('generate-titles-button'));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('ai-error-message')).toBeInTheDocument();
    });
  });

  it('displays platform-specific character counts', async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        suggestions: [
          {
            id: '1',
            title: 'Test Title',
            category: 'descriptive',
            engagementScore: 85,
            confidence: 0.9,
            characterCount: 10
          }
        ],
        detectedTopics: ['test'],
        contentSummary: 'Test content',
        generatedAt: new Date().toISOString(),
        processingTimeMs: 1000
      })
    });

    render(<TitleGenerator transcriptText="Test content" />);
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('generate-titles-button'));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('title-suggestions')).toBeInTheDocument();
    });

    // Check platform filters exist
    expect(screen.getByTestId('platform-filter-youtube')).toBeInTheDocument();
    expect(screen.getByTestId('platform-filter-tiktok')).toBeInTheDocument();
    expect(screen.getByTestId('platform-filter-linkedin')).toBeInTheDocument();
    expect(screen.getByTestId('platform-filter-twitter')).toBeInTheDocument();
  });

  it('filters titles by platform when selected', async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        suggestions: [
          {
            id: '1',
            title: 'Professional Title',
            category: 'professional',
            engagementScore: 85,
            confidence: 0.9,
            characterCount: 18
          }
        ],
        detectedTopics: ['test'],
        contentSummary: 'Test content',
        generatedAt: new Date().toISOString(),
        processingTimeMs: 1000
      })
    });

    render(<TitleGenerator transcriptText="Test content" />);
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('generate-titles-button'));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('title-suggestions')).toBeInTheDocument();
    });

    // Select LinkedIn platform
    fireEvent.click(screen.getByTestId('platform-filter-linkedin'));
    
    // Verify professional tone indicator appears
    expect(screen.getByTestId('platform-active-linkedin')).toBeInTheDocument();
  });
});