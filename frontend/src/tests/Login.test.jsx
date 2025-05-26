import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Login from '../pages/Login';
import axios from 'axios';

// Mock dependencies
vi.mock('axios');
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

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<Login />);
    
    // Check for heading and subheading
    expect(screen.getByText('Welcome back')).toBeDefined();
    expect(screen.getByText('Login to your Grand Line Guide account')).toBeDefined();
    
    // Check for form inputs
    expect(screen.getByLabelText('Username')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
    
    // Check for login button
    expect(screen.getByRole('button', { name: 'Login' })).toBeDefined();
    
    // Check for signup link
    expect(screen.getByText("Don't have an account?")).toBeDefined();
    expect(screen.getByText('Sign up')).toBeDefined();
    
    // Check for logo section
    expect(screen.getByAltText('Grand Line Guide Logo')).toBeDefined();
    expect(screen.getByText('Grand Line Guide')).toBeDefined();
  });

  it('updates form state when input values change', () => {
    render(<Login />);
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    
    // Simulate user typing
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Check if inputs have been updated
    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  it('navigates to signup page when signup link is clicked', () => {
    render(<Login />);
    
    const signupLink = screen.getByText('Sign up');
    fireEvent.click(signupLink);
    
    // Verify navigation was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  it('submits the form and handles successful login', async () => {
    // Set up axios mock to resolve with success
    const mockResponse = {
      data: {
        token: 'mock-token-123',
        user: { username: 'testuser' }
      }
    };
    
    axios.post.mockResolvedValueOnce(mockResponse);
    
    render(<Login />);
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: 'Login' });
    
    // Fill in the form
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(loginButton);
    
    // Verify API call was made with correct parameters
    expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/login', {
      username: 'testuser',
      password: 'password123'
    });
    
    await waitFor(() => {
      // Verify localStorage was updated
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'mock-token-123');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('username', 'testuser');
      
      // Verify navigation to home page
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays error message when login fails', async () => {
    // Set up axios mock to reject with error
    const errorMessage = 'Invalid username or password';
    axios.post.mockRejectedValueOnce({
      response: { data: { message: errorMessage } }
    });
    
    render(<Login />);
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: 'Login' });
    
    // Fill in the form
    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    
    // Submit the form
    fireEvent.click(loginButton);
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeDefined();
    });
    
    // Verify localStorage was not updated
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    
    // Verify navigation did not occur
    expect(mockNavigate).not.toHaveBeenCalled();
  });


  it('renders responsive layout correctly', () => {
    render(<Login />);
    
    // Check for responsive container
    const container = screen.getByText('Welcome back').closest('div').parentElement;
    expect(container.className).toContain('grid-cols-1');
    expect(container.className).toContain('lg:grid-cols-2');
  });
});