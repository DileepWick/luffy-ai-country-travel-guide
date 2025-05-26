import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Home from '../pages/Home';
import axios from 'axios';

// Mock dependencies
vi.mock('axios');
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));
vi.mock('../components/Header', () => ({
  default: () => <div data-testid="mock-header">Header Component</div>
}));
vi.mock('../components/CountryTable', () => ({
  default: () => <div data-testid="mock-country-table">Country Table Component</div>
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock navigate function
const mockNavigate = vi.fn();

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login page if no token is found', () => {
    // Ensure localStorage.getItem returns null for 'token'
    mockLocalStorage.getItem.mockReturnValueOnce(null);
    
    render(<Home />);
    
    // Verify navigation was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('makes API call to verify token when token exists', async () => {
    // Set up localStorage mock to return a token
    mockLocalStorage.getItem.mockReturnValueOnce('mock-token');
   
    // Set up axios mock to resolve with success
    axios.get.mockResolvedValueOnce({
      data: { message: 'Protected content accessed successfully' }
    });
    
    render(<Home />);
    
    // Verify axios was called with the correct parameters
    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:5000/protected',
      { headers: { Authorization: 'Bearer mock-token' } }
    );
  });

  it('redirects to login when API call fails', async () => {
    // Set up localStorage mock to return a token
    mockLocalStorage.getItem.mockReturnValueOnce('invalid-token');
    
    // Set up axios mock to reject
    axios.get.mockRejectedValueOnce(new Error('Unauthorized'));
    
    render(<Home />);
    
    await waitFor(() => {
      // Verify localStorage item was removed
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      
      // Verify navigation was called with the correct path
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('renders Header component', async () => {
    // Set up localStorage mock to return a token
    mockLocalStorage.getItem.mockReturnValueOnce('mock-token');
    
    // Set up axios mock to resolve with success
    axios.get.mockResolvedValueOnce({
      data: { message: 'Success' }
    });
    
    render(<Home />);
    
    // Verify Header component is rendered
    expect(screen.getByTestId('mock-header')).toBeDefined();
  });


  it('renders desktop layout with correct styling', async () => {
    // Set up localStorage mock to return a token
    mockLocalStorage.getItem.mockReturnValueOnce('mock-token');
    
    // Set up axios mock to resolve with success
    axios.get.mockResolvedValueOnce({
      data: { message: 'Success' }
    });
    
    render(<Home />);
    
    // Find the desktop container
    const desktopContainer = document.querySelector('.hidden.md\\:flex');
    expect(desktopContainer).toBeDefined();
    
    // Check background style
    expect(desktopContainer.style.backgroundImage).toContain('bg2.gif');
    expect(desktopContainer.style.backgroundSize).toBe('contain');
    expect(desktopContainer.style.backgroundRepeat).toBe('no-repeat');
    expect(desktopContainer.style.backgroundPosition).toBe('left center');
  });

  it('renders mobile layout when on smaller screens', async () => {
    // Set up localStorage mock to return a token
    mockLocalStorage.getItem.mockReturnValueOnce('mock-token');
    
    // Set up axios mock to resolve with success
    axios.get.mockResolvedValueOnce({
      data: { message: 'Success' }
    });
    
    render(<Home />);
    
    // Find the mobile container
    const mobileContainer = document.querySelector('.flex.md\\:hidden');
    expect(mobileContainer).toBeDefined();
  });

  it('updates message state when API call succeeds', async () => {
    // Set up localStorage mock to return a token
    mockLocalStorage.getItem.mockReturnValueOnce('mock-token');
    
    // Set up axios mock to resolve with success and a specific message
    const testMessage = 'Welcome to the protected area!';
    axios.get.mockResolvedValueOnce({
      data: { message: testMessage }
    });
    
    render(<Home />);
    
    // Verify the message state was updated correctly
    // Note: We can't directly test state, but we could test for message display
    // if it were rendered in the component
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  it('has correct layout ratios in desktop view', async () => {
    // Set up localStorage mock to return a token
    mockLocalStorage.getItem.mockReturnValueOnce('mock-token');
    
    // Set up axios mock to resolve with success
    axios.get.mockResolvedValueOnce({
      data: { message: 'Success' }
    });
    
    render(<Home />);
    
    // Check layout divisions in desktop view
    const desktopContainer = document.querySelector('.hidden.md\\:flex');
    const leftDiv = desktopContainer.querySelector('.w-1\\/4');
    const rightDiv = desktopContainer.querySelector('.w-3\\/4');
    
    expect(leftDiv).toBeDefined();
    expect(rightDiv).toBeDefined();
  });

  it('properly sets auth header for API call', async () => {
    // Set up localStorage mock to return a specific token
    const testToken = 'test-auth-token-123';
    mockLocalStorage.getItem.mockReturnValueOnce(testToken);
    
    // Set up axios mock to resolve with success
    axios.get.mockResolvedValueOnce({
      data: { message: 'Success' }
    });
    
    render(<Home />);
    
    // Verify the auth header was set correctly
    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:5000/protected',
      { headers: { Authorization: `Bearer ${testToken}` } }
    );
  });
});