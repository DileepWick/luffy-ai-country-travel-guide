import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Login from '../pages/Login';
import Home from '../pages/Home';
import App from '../App'; // Assuming you have an App component that handles routing

// Mock dependencies
vi.mock('axios');
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    // For testing purposes, we'll just render whatever the app wants to navigate to
    Navigate: ({ to }) => <div data-testid="navigate" data-to={to}>Navigated to {to}</div>
  };
});

// Mock CountryServices module
vi.mock('../pages/services/CountryServices', () => ({
  getAllCountries: vi.fn(),
  getCountryByName: vi.fn(),
  getCountriesByRegion: vi.fn(),
  getCountryByCode: vi.fn(),
}));

// Import mocked services to control their behavior
import * as CountryServices from '../pages/services/CountryServices';

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

// Mock data
const mockCountries = [
  {
    name: 'Sri Lanka',
    capital: 'Colombo',
    region: 'Asia',
    population: 22000000,
    languages: 'Sinhala, Tamil',
    flag: 'https://flagcdn.com/lk.svg',
  },
  {
    name: 'United States',
    capital: 'Washington D.C.',
    region: 'Americas',
    population: 331000000,
    languages: 'English',
    flag: 'https://flagcdn.com/us.svg',
  },
  {
    name: 'Germany',
    capital: 'Berlin',
    region: 'Europe',
    population: 83000000,
    languages: 'German',
    flag: 'https://flagcdn.com/de.svg',
  }
];

const mockGuideData = {
  result: 'Germany is a beautiful country with rich history and culture. Known for its engineering excellence, delicious food, and picturesque landscapes.'
};

describe('Country App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    
    // Setup default responses for country service mocks
    CountryServices.getAllCountries.mockResolvedValue(mockCountries);
    CountryServices.getCountryByName.mockImplementation((name) => {
      return Promise.resolve(mockCountries.filter(country => 
        country.name.toLowerCase().includes(name.toLowerCase())
      ));
    });
    CountryServices.getCountriesByRegion.mockImplementation((region) => {
      return Promise.resolve(mockCountries.filter(country => 
        country.region === region
      ));
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('handles the complete user flow: login, view countries, and view country details', async () => {
    // STAGE 1: User Login
    // Mock successful login response
    axios.post.mockResolvedValueOnce({
      data: {
        token: 'test-token-123',
        user: { username: 'testuser' }
      }
    });
    
    // Setup token verification for protected routes
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5000/protected') {
        return Promise.resolve({
          data: { message: 'Protected content accessed successfully' }
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
    
    // Mock country guide API call
    axios.post.mockImplementation((url, data) => {
      if (url === 'http://localhost:5000/api/country-guide') {
        return Promise.resolve({
          data: { result: mockGuideData.result }
        });
      }
      return Promise.resolve({
        data: {
          token: 'test-token-123',
          user: { username: 'testuser' }
        }
      });
    });

    // Start with login page
    const { unmount } = render(<Login />);
    
    // Fill and submit login form
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: 'Login' });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    // Verify login API call and localStorage updates
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/login', {
        username: 'testuser',
        password: 'password123'
      });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'test-token-123');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('username', 'testuser');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
    
    unmount();
    
    // STAGE 2: Home Page with Country Table
    // Simulate having a token in localStorage for the Home component
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'test-token-123';
      if (key === 'username') return 'testuser';
      return null;
    });
    
    // Render Home page which should include Header and CountryTable
    const { rerender } = render(<Home />);
    
    // Verify protected API call to validate token
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:5000/protected',
        { headers: { Authorization: 'Bearer test-token-123' } }
      );
    });
    
    // Since we're mocking out components in tests, let's directly render CountryTable
    // to test its functionality
    const CountryTable = (await import('../components/CountryTable')).default;
    rerender(<CountryTable />);
    
    // Wait for countries to load
    await waitFor(() => {
      expect(CountryServices.getAllCountries).toHaveBeenCalled();
    });
    
    // Verify country data is displayed
    await waitFor(() => {
      expect(screen.getByText('Sri Lanka')).toBeDefined();
      expect(screen.getByText('United States')).toBeDefined();
      expect(screen.getByText('Germany')).toBeDefined();
    });
    
    // STAGE 3: Search for a specific country
    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'germany' } });
    
    // Verify search was performed
    await waitFor(() => {
      expect(CountryServices.getCountryByName).toHaveBeenCalledWith('germany');
      
      // Germany should be visible, others should not
      expect(screen.getByText('Germany')).toBeDefined();
      expect(screen.queryByText('Sri Lanka')).toBeNull();
      expect(screen.queryByText('United States')).toBeNull();
    });
    
    // STAGE 4: View country details
    // For this we would typically click the "Visit" button, but since we've mocked the modal
    // we'll simulate direct API call for country guide
    
    // Lets assume we have ViewButton component available
    const ViewButton = (await import('../components/ViewButton')).default;
    
    // Unmount previous component and render ViewButton
    rerender(<ViewButton country="Germany" flag="https://flagcdn.com/de.svg" />);
    
    // Find and click the Visit button
    const visitButton = screen.getByText('Visit');
    fireEvent.click(visitButton);
    
    // Verify guide API call is made
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/country-guide',
        { country: 'Germany' }
      );
    });
    
    // Verify guide data is displayed (if modal content is rendered)
    // Note: This depends on how ViewButton and its modal are implemented
    // If the modal is in a portal or uses a different rendering strategy,
    // this might need adjustment
    await waitFor(() => {
      // Since the ViewButton test shows it renders a text area with the guide content
      const textarea = screen.getByRole('textbox');
      expect(textarea.value).toContain('Germany is a beautiful country');
    });
    
    // STAGE 5: Log out
    // For this test to be complete, we would navigate back to full app and test logout
    // but this depends on how routing is structured in your app
  });

  it('handles authentication failures and redirects appropriately', async () => {
    // Set invalid token
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'invalid-token';
      return null;
    });
    
    // Protected route should fail and redirect
    axios.get.mockRejectedValueOnce(new Error('Unauthorized'));
    
    render(<Home />);
    
    // Verify redirection occurred
    await waitFor(() => {
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });


  it('handles pagination correctly with different data sets', async () => {
    // Create a larger dataset to test pagination
    const manyCountries = [
      ...mockCountries,
      {
        name: 'Japan',
        capital: 'Tokyo',
        region: 'Asia',
        population: 126000000,
        languages: 'Japanese',
        flag: 'https://flagcdn.com/jp.svg',
      },
      {
        name: 'Brazil',
        capital: 'Brasília',
        region: 'Americas',
        population: 212000000,
        languages: 'Portuguese',
        flag: 'https://flagcdn.com/br.svg',
      },
      {
        name: 'Australia',
        capital: 'Canberra',
        region: 'Oceania',
        population: 25000000,
        languages: 'English',
        flag: 'https://flagcdn.com/au.svg',
      }
    ];
    
    // Update mock to return our larger dataset
    CountryServices.getAllCountries.mockResolvedValueOnce(manyCountries);
    
    // Set token for authenticated state
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'test-token-123';
      if (key === 'username') return 'testuser';
      return null;
    });
    
    axios.get.mockResolvedValueOnce({
      data: { message: 'Protected content accessed successfully' }
    });
    
    // Load the CountryTable component
    const CountryTable = (await import('../components/CountryTable')).default;
    render(<CountryTable />);
    
    // Wait for countries to load
    await waitFor(() => {
      expect(CountryServices.getAllCountries).toHaveBeenCalled();
    });
    
    // Verify first page countries are visible (assuming 5 per page based on tests)
    await waitFor(() => {
      expect(screen.getByText('Sri Lanka')).toBeDefined();
      expect(screen.getByText('United States')).toBeDefined();
      expect(screen.getByText('Germany')).toBeDefined();
      expect(screen.getByText('Japan')).toBeDefined();
      expect(screen.getByText('Brazil')).toBeDefined();
      
      // Australia should be on second page
      expect(screen.queryByText('Australia')).toBeNull();
    });
    
    // Find and click the Next button
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Verify second page countries
    await waitFor(() => {
      expect(screen.getByText('Australia')).toBeDefined();
      
      // First page countries should not be visible
      expect(screen.queryByText('Sri Lanka')).toBeNull();
    });
    
    // Go back to first page
    const prevButton = screen.getByText('Previous');
    fireEvent.click(prevButton);
    
    // Verify first page countries again
    await waitFor(() => {
      expect(screen.getByText('Sri Lanka')).toBeDefined();
      expect(screen.queryByText('Australia')).toBeNull();
    });
  });
});