import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Header from '../components/Header';

// Mock React Router's useNavigate hook
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
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

describe('Header', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the header with logo and title correctly', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('testuser');
    
    render(<Header />);
    
    // Check if logo is rendered
    const logo = screen.getByAltText('Grand Line Guide Logo');
    expect(logo).toBeDefined();
    expect(logo.tagName).toBe('IMG');
    
    // Check if title and subtitle are rendered
    expect(screen.getByText('Grand Line Guide')).toBeDefined();
    expect(screen.getByText('Find your favorite Grand Line characters')).toBeDefined();
  });

  it('redirects to login page if username is not found in localStorage', () => {
    // Ensure localStorage.getItem returns null for 'username'
    mockLocalStorage.getItem.mockReturnValueOnce(null);
    
    render(<Header />);
    
    // Verify navigation was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('displays capitalized username from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('luffy');
    
    render(<Header />);
    
    // Check if the username is displayed and capitalized correctly
    expect(screen.getByText('Luffy')).toBeDefined();
    expect(screen.getByText('Traveler')).toBeDefined();
  });

  it('displays "Guest" when username is empty but component still renders', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('');
    
    render(<Header />);
    
    // Check if "Guest" is displayed when username is empty
    expect(screen.getByText('Guest')).toBeDefined();
  });

  it('handles logout correctly', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('testuser');
    
    render(<Header />);
    
    // Find and click the logout button
    const logoutButton = screen.getByText('SignOut');
    fireEvent.click(logoutButton);
    
    // Verify localStorage items were removed
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('username');
    
    // Verify navigation to login page
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('renders User component with correct props', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('zoro');
    
    render(<Header />);
    
    // Verify User component props
    const avatarElement = screen.getByText('Zoro').closest('div');
    expect(avatarElement).toBeDefined();
    
    // Check if description is shown
    expect(screen.getByText('Traveler')).toBeDefined();
  });

  it('renders responsive layout with correct classes', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('testuser');
    
    render(<Header />);
    
    // Check header container classes
    const header = screen.getByRole('banner');
    expect(header.className).toContain('flex');
    expect(header.className).toContain('md:flex-row');
  });

});