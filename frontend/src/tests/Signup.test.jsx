import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Signup from '../pages/Signup';
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

describe('Signup Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders signup form correctly', () => {
    render(<Signup />);
    
    // Check for heading and subheading
    expect(screen.getByText('Create an account')).toBeDefined();
    expect(screen.getByText('Join Grand Line Guide and start exploring')).toBeDefined();
    
    // Check for form inputs
    expect(screen.getByLabelText('Username')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
    expect(screen.getByLabelText('Confirm Password')).toBeDefined();
    
    // Check for signup button
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeDefined();
    
    // Check for login link
    expect(screen.getByText('Already have an account?')).toBeDefined();
    expect(screen.getByText('Log in')).toBeDefined();
    
    // Check for logo section
    expect(screen.getByAltText('Grand Line Guide Logo')).toBeDefined();
    expect(screen.getByText('Grand Line Guide')).toBeDefined();
  });

  it('updates form state when input values change', () => {
    render(<Signup />);
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    
    // Simulate user typing
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    // Check if inputs have been updated
    expect(usernameInput.value).toBe('newuser');
    expect(passwordInput.value).toBe('password123');
    expect(confirmPasswordInput.value).toBe('password123');
  });

  it('navigates to login page when login link is clicked', () => {
    render(<Signup />);
    
    const loginLink = screen.getByText('Log in');
    fireEvent.click(loginLink);
    
    // Verify navigation was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('displays error when passwords do not match', async () => {
    render(<Signup />);
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const signupButton = screen.getByRole('button', { name: 'Sign Up' });
    
    // Fill in the form with mismatched passwords
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
    
    // Submit the form
    fireEvent.click(signupButton);
    
    // Verify error message is displayed
    expect(screen.getByText('Passwords do not match')).toBeDefined();
    
    // Verify API call was not made
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('submits the form and handles successful signup', async () => {
    // Set up axios mock to resolve with success
    const mockResponse = {
      data: {
        token: 'new-user-token-123'
      }
    };
    
    axios.post.mockResolvedValueOnce(mockResponse);
    
    render(<Signup />);
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const signupButton = screen.getByRole('button', { name: 'Sign Up' });
    
    // Fill in the form
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(signupButton);
    
    // Verify API call was made with correct parameters
    expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/signup', {
      username: 'newuser',
      password: 'password123'
    });
    
    await waitFor(() => {
      // Verify localStorage was updated
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'new-user-token-123');
      
      // Verify navigation to home page
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays error message when signup fails', async () => {
    // Set up axios mock to reject with error
    const errorMessage = 'User already exists';
    axios.post.mockRejectedValueOnce({
      response: { data: { message: errorMessage } }
    });
    
    render(<Signup />);
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const signupButton = screen.getByRole('button', { name: 'Sign Up' });
    
    // Fill in the form
    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(signupButton);
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeDefined();
    });
  });

  it('displays fallback error message when specific error is not provided', async () => {
    // Set up axios mock to reject with a non-specific error
    axios.post.mockRejectedValueOnce({
      response: {}
    });
    
    render(<Signup />);
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const signupButton = screen.getByRole('button', { name: 'Sign Up' });
    
    // Fill in the form with matching passwords
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(signupButton);
    
    // Verify fallback error message is displayed
    await waitFor(() => {
      expect(screen.getByText('User already exists')).toBeDefined();
    });
  });


  it('renders responsive layout correctly', () => {
    render(<Signup />);
    
    // Check for responsive container
    const container = screen.getByText('Create an account').closest('div').parentElement;
    expect(container.className).toContain('grid-cols-1');
    expect(container.className).toContain('lg:grid-cols-2');
  });
});