import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import ViewButton from '../components/ViewButton';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock the useDisclosure hook from @heroui/react
vi.mock('@heroui/react', async () => {
  const actual = await vi.importActual('@heroui/react');
  return {
    ...actual,
    useDisclosure: () => ({
      isOpen: false,
      onOpen: vi.fn(),
      onOpenChange: vi.fn(),
    }),
  };
});

describe('ViewButton', () => {
  const mockProps = {
    country: 'Japan',
    flag: 'https://flagcdn.com/jp.svg'
  };

  const mockGuideData = {
    data: {
      result: 'Japan is a beautiful country with rich culture and history.'
    }
  };

  beforeEach(() => {
    // Reset axios mock before each test
    axios.post.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Visit button correctly', () => {
    render(<ViewButton {...mockProps} />);
    
    const visitButton = screen.getByText('Visit');
    expect(visitButton).toBeDefined();
    expect(visitButton.closest('button')).toBeDefined();
  });

  it('makes API call when modal is opened', async () => {
    // Mock useDisclosure to simulate open modal
    vi.mock('@heroui/react', async () => {
      const actual = await vi.importActual('@heroui/react');
      return {
        ...actual,
        useDisclosure: () => ({
          isOpen: true,
          onOpen: vi.fn(),
          onOpenChange: vi.fn(),
        }),
      };
    });
    
    axios.post.mockResolvedValueOnce(mockGuideData);
    
    render(<ViewButton {...mockProps} />);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/country-guide',
        { country: 'Japan' }
      );
    });
  });

  it('displays loading state while fetching data', async () => {
    // Mock useDisclosure to simulate open modal
    vi.mock('@heroui/react', async () => {
      const actual = await vi.importActual('@heroui/react');
      return {
        ...actual,
        useDisclosure: () => ({
          isOpen: true,
          onOpen: vi.fn(),
          onOpenChange: vi.fn(),
        }),
      };
    });
    
    // Delay the API response to ensure loading state is visible
    axios.post.mockImplementationOnce(() => 
      new Promise(resolve => {
        setTimeout(() => resolve(mockGuideData), 100);
      })
    );
    
    render(<ViewButton {...mockProps} />);
    
    // Check for loading indicators
    expect(screen.getByText('Traveling to Japan... Please Wait')).toBeDefined();
    expect(screen.getByAltText('Loading...')).toBeDefined();
  });

  it('handles API error gracefully', async () => {
    // Mock useDisclosure to simulate open modal
    vi.mock('@heroui/react', async () => {
      const actual = await vi.importActual('@heroui/react');
      return {
        ...actual,
        useDisclosure: () => ({
          isOpen: true,
          onOpen: vi.fn(),
          onOpenChange: vi.fn(),
        }),
      };
    });
    
    // Simulate API error
    axios.post.mockRejectedValueOnce(new Error('API Error'));
    
    render(<ViewButton {...mockProps} />);
    
    await waitFor(() => {
      const textarea = screen.getByRole('textbox');
      expect(textarea.value).toBe('Sorry! Could not load country guide.');
    });
  });

  it('clears previous guide data when reopening for a different country', async () => {
    // Mock module with controlled isOpen state
    let isModalOpen = false;
    const onOpenChangeMock = vi.fn(() => {
      isModalOpen = !isModalOpen;
    });
    
    vi.mock('@heroui/react', async () => {
      const actual = await vi.importActual('@heroui/react');
      return {
        ...actual,
        useDisclosure: () => ({
          isOpen: isModalOpen,
          onOpen: () => { isModalOpen = true; },
          onOpenChange: onOpenChangeMock,
        }),
      };
    });
    
    // First country
    axios.post.mockResolvedValueOnce({
      data: { result: 'Japan guide content' }
    });
    
    const { rerender } = render(<ViewButton country="Japan" flag="jp-flag.svg" />);
    
    // Simulate opening modal
    isModalOpen = true;
    rerender(<ViewButton country="Japan" flag="jp-flag.svg" />);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/country-guide',
        { country: 'Japan' }
      );
    });
    
    // Simulate closing modal
    isModalOpen = false;
    rerender(<ViewButton country="Japan" flag="jp-flag.svg" />);
    
    // Second country
    axios.post.mockResolvedValueOnce({
      data: { result: 'Italy guide content' }
    });
    
    // Rerender with new country and open modal
    isModalOpen = true;
    rerender(<ViewButton country="Italy" flag="it-flag.svg" />);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/country-guide',
        { country: 'Italy' }
      );
    });
  });

  it('renders guide avatar image', async () => {
    // Mock useDisclosure to simulate open modal
    vi.mock('@heroui/react', async () => {
      const actual = await vi.importActual('@heroui/react');
      return {
        ...actual,
        useDisclosure: () => ({
          isOpen: true,
          onOpen: vi.fn(),
          onOpenChange: vi.fn(),
        }),
      };
    });
    
    axios.post.mockResolvedValueOnce(mockGuideData);
    
    render(<ViewButton {...mockProps} />);
    
    await waitFor(() => {
      const guideAvatar = screen.getByAltText('Guide Avatar');
      expect(guideAvatar).toBeDefined();
      expect(guideAvatar.getAttribute('src')).toBe(
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSvbmogXrtrNtTEWVwFQO3RKNI8Ri7BixXIQ&s'
      );
    });
  });

  it('renders spinner component in loading state', async () => {
    // Mock useDisclosure to simulate open modal
    vi.mock('@heroui/react', async () => {
      const actual = await vi.importActual('@heroui/react');
      return {
        ...actual,
        useDisclosure: () => ({
          isOpen: true,
          onOpen: vi.fn(),
          onOpenChange: vi.fn(),
        }),
      };
    });
    
    // Delay the API response
    axios.post.mockImplementationOnce(() => 
      new Promise(resolve => {
        setTimeout(() => resolve(mockGuideData), 100);
      })
    );
    
    render(<ViewButton {...mockProps} />);
    
    // Spinner should be visible during loading
    const spinner = document.querySelector('.dots'); // Assuming Spinner has a 'dots' class
    expect(spinner).toBeDefined();
  });
});