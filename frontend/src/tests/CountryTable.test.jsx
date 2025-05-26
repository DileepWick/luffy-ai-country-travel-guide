import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import CountryTable from '../components/CountryTable';
import * as CountryServices from '../pages/services/CountryServices';

// Create the mock data
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
  },
  {
    name: 'Kenya',
    capital: 'Nairobi',
    region: 'Africa',
    population: 53700000,
    languages: 'Swahili, English',
    flag: 'https://flagcdn.com/ke.svg',
  },
  {
    name: 'Japan',
    capital: 'Tokyo',
    region: 'Asia',
    population: 126000000,
    languages: 'Japanese',
    flag: 'https://flagcdn.com/jp.svg',
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

describe('CountryTable', () => {
  beforeEach(() => {
    // Mock the services
    vi.spyOn(CountryServices, 'getAllCountries').mockResolvedValue(mockCountries);
    vi.spyOn(CountryServices, 'getCountryByName').mockImplementation((name) => {
      return Promise.resolve(mockCountries.filter(country => 
        country.name.toLowerCase().includes(name.toLowerCase())
      ));
    });
    vi.spyOn(CountryServices, 'getCountriesByRegion').mockImplementation((region) => {
      return Promise.resolve(mockCountries.filter(country => 
        country.region === region
      ));
    });
    vi.spyOn(CountryServices, 'getCountryByCode').mockImplementation((code) => {
      // In a real scenario, this would match country codes - for test simplicity:
      const found = mockCountries.find(country => country.name.substring(0, 3).toLowerCase() === code.toLowerCase());
      return Promise.resolve(found || null);
    });
  });

  it('renders country table with data', async () => {
    render(<CountryTable />);
    
    // Wait for countries to appear
    await waitFor(() => {
      expect(screen.getByText('Sri Lanka')).toBeDefined();
      expect(screen.getByText('United States')).toBeDefined();
    });
    
    // Check headers
    expect(screen.getByText('Flag')).toBeDefined();
    expect(screen.getByText('Country')).toBeDefined();
    expect(screen.getByText('Capital')).toBeDefined();
    expect(screen.getByText('Region')).toBeDefined();
    expect(screen.getByText('Population')).toBeDefined();
    expect(screen.getByText('Languages')).toBeDefined();
  });

  it('renders flag images correctly', async () => {
    render(<CountryTable />);
    
    await waitFor(() => {
      const sriLankaFlag = screen.getByAltText('Flag of Sri Lanka');
      expect(sriLankaFlag).toBeDefined();
      expect(sriLankaFlag.getAttribute('src')).toBe('https://flagcdn.com/lk.svg');
      
      const usFlag = screen.getByAltText('Flag of United States');
      expect(usFlag).toBeDefined();
      expect(usFlag.getAttribute('src')).toBe('https://flagcdn.com/us.svg');
    });
  });

  it('performs pagination correctly', async () => {
    render(<CountryTable />);
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Sri Lanka')).toBeDefined();
    });
    
    // With 5 items per page, USA should be visible on first page
    expect(screen.getByText('United States')).toBeDefined();
    
    // Australia should be on second page (not visible initially)
    expect(screen.queryByText('Australia')).toBeNull();
    
    // Click next page
    fireEvent.click(screen.getByText('Next'));
    
    // Now Australia should be visible
    await waitFor(() => {
      expect(screen.getByText('Australia')).toBeDefined();
    });
    
    // And USA should no longer be visible
    expect(screen.queryByText('United States')).toBeNull();
    
    // Go back to first page
    fireEvent.click(screen.getByText('Previous'));
    
    // USA should be visible again
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeDefined();
    });
  });

  it('filters countries by name search', async () => {
    render(<CountryTable />);
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Sri Lanka')).toBeDefined();
    });
    
    // Find the search input
    const searchInput = screen.getByLabelText('Search');
    
    // Search for "japan"
    fireEvent.change(searchInput, { target: { value: 'japan' } });
    
    // Wait for search results
    await waitFor(() => {
      expect(CountryServices.getCountryByName).toHaveBeenCalledWith('japan');
      expect(screen.getByText('Japan')).toBeDefined();
      expect(screen.queryByText('Sri Lanka')).toBeNull();
    });
  });



  it('handles short code search correctly', async () => {
    render(<CountryTable />);
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Sri Lanka')).toBeDefined();
    });
    
    // Find the search input
    const searchInput = screen.getByLabelText('Search');
    
    // Search for "ger" (first 3 letters of Germany)
    fireEvent.change(searchInput, { target: { value: 'ger' } });
    
    // Wait for search results
    await waitFor(() => {
      expect(CountryServices.getCountryByCode).toHaveBeenCalledWith('ger');
      expect(screen.getByText('Germany')).toBeDefined();
      expect(screen.queryByText('United States')).toBeNull();
    });
  });

  it('handles error cases gracefully', async () => {
    // Mock a failed API call for this specific test
    vi.spyOn(CountryServices, 'getAllCountries').mockRejectedValueOnce(new Error('API Error'));
    
    render(<CountryTable />);
    
    // Wait for component to handle the error
    await waitFor(() => {
      expect(CountryServices.getAllCountries).toHaveBeenCalled();
    });
    
    // Check that no countries are displayed
    expect(screen.queryByText('Sri Lanka')).toBeNull();
    expect(screen.queryByText('United States')).toBeNull();
  });

  it('displays correct pagination information', async () => {
    render(<CountryTable />);
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Sri Lanka')).toBeDefined();
    });
    
    // With 6 countries and 5 per page, we should have 2 pages
    expect(screen.getByText('1 / 2')).toBeDefined();
    
    // Click next page
    fireEvent.click(screen.getByText('Next'));
    
    // Page indicator should update
    await waitFor(() => {
      expect(screen.getByText('2 / 2')).toBeDefined();
    });
  });

  it('disables pagination buttons appropriately', async () => {
    render(<CountryTable />);
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Sri Lanka')).toBeDefined();
    });
    
    // On first page, Previous should be disabled, Next enabled
    const prevButton = screen.getByText('Previous').closest('button');
    const nextButton = screen.getByText('Next').closest('button');
    
    expect(prevButton.hasAttribute('disabled')).toBe(true);
    expect(nextButton.hasAttribute('disabled')).toBe(false);
    
    // Go to second page
    fireEvent.click(nextButton);
    
    // On second page, Previous should be enabled, Next disabled
    await waitFor(() => {
      expect(prevButton.hasAttribute('disabled')).toBe(false);
      expect(nextButton.hasAttribute('disabled')).toBe(true);
    });
  });
});