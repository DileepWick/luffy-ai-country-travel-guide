import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { 
  getAllCountries, 
  getCountryByName, 
  getCountriesByRegion, 
  getCountryByCode 
} from '../pages/services/CountryServices';

// Mock axios
vi.mock('axios');

describe('Country API Services', () => {
  const mockCountryData = [
    {
      name: { common: 'Japan' },
      population: 125836021,
      region: 'Asia',
      languages: { jpn: 'Japanese' },
      flags: { png: 'https://flagcdn.com/jp.png' },
      capital: ['Tokyo']
    },
    {
      name: { common: 'Italy' },
      population: 59554023,
      region: 'Europe',
      languages: { ita: 'Italian' },
      flags: { png: 'https://flagcdn.com/it.png' },
      capital: ['Rome']
    }
  ];

  const expectedFormattedData = [
    {
      name: 'Japan',
      population: 125836021,
      region: 'Asia',
      languages: 'Japanese',
      flag: 'https://flagcdn.com/jp.png',
      capital: 'Tokyo'
    },
    {
      name: 'Italy',
      population: 59554023,
      region: 'Europe',
      languages: 'Italian',
      flag: 'https://flagcdn.com/it.png',
      capital: 'Rome'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getAllCountries', () => {
    it('should fetch and format all countries', async () => {
      // Setup
      axios.get.mockResolvedValueOnce({ data: mockCountryData });

      // Execute
      const result = await getAllCountries();

      // Verify
      expect(axios.get).toHaveBeenCalledWith('https://restcountries.com/v3.1/all');
      expect(result).toEqual(expectedFormattedData);
    });

    it('should handle API errors when fetching all countries', async () => {
      // Setup
      const errorMsg = 'Network Error';
      axios.get.mockRejectedValueOnce(new Error(errorMsg));

      // Execute & Verify
      await expect(getAllCountries()).rejects.toThrow(Error);
      expect(axios.get).toHaveBeenCalledWith('https://restcountries.com/v3.1/all');
    });
  });

  describe('getCountryByName', () => {
    it('should fetch and format country by name', async () => {
      // Setup
      const countryName = 'japan';
      axios.get.mockResolvedValueOnce({ data: [mockCountryData[0]] });

      // Execute
      const result = await getCountryByName(countryName);

      // Verify
      expect(axios.get).toHaveBeenCalledWith(`https://restcountries.com/v3.1/name/${countryName}`);
      expect(result).toEqual([expectedFormattedData[0]]);
    });

    it('should handle API errors when fetching country by name', async () => {
      // Setup
      const countryName = 'nonexistent';
      const errorMsg = 'Country not found';
      axios.get.mockRejectedValueOnce(new Error(errorMsg));

      // Execute & Verify
      await expect(getCountryByName(countryName)).rejects.toThrow(Error);
      expect(axios.get).toHaveBeenCalledWith(`https://restcountries.com/v3.1/name/${countryName}`);
    });
  });

  describe('getCountriesByRegion', () => {
    it('should fetch and format countries by region', async () => {
      // Setup
      const region = 'europe';
      axios.get.mockResolvedValueOnce({ data: [mockCountryData[1]] });

      // Execute
      const result = await getCountriesByRegion(region);

      // Verify
      expect(axios.get).toHaveBeenCalledWith(`https://restcountries.com/v3.1/region/${region}`);
      expect(result).toEqual([expectedFormattedData[1]]);
    });

    it('should handle API errors when fetching countries by region', async () => {
      // Setup
      const region = 'invalid';
      const errorMsg = 'Region not found';
      axios.get.mockRejectedValueOnce(new Error(errorMsg));

      // Execute & Verify
      await expect(getCountriesByRegion(region)).rejects.toThrow(Error);
      expect(axios.get).toHaveBeenCalledWith(`https://restcountries.com/v3.1/region/${region}`);
    });
  });

  describe('getCountryByCode', () => {
    it('should fetch and format country by code', async () => {
      // Setup
      const countryCode = 'jpn';
      axios.get.mockResolvedValueOnce({ data: [mockCountryData[0]] });

      // Execute
      const result = await getCountryByCode(countryCode);

      // Verify
      expect(axios.get).toHaveBeenCalledWith(`https://restcountries.com/v3.1/alpha/${countryCode}`);
      expect(result).toEqual(expectedFormattedData[0]);
    });

    it('should handle API errors when fetching country by code', async () => {
      // Setup
      const countryCode = 'xyz';
      const errorMsg = 'Country code not found';
      axios.get.mockRejectedValueOnce(new Error(errorMsg));

      // Execute & Verify
      await expect(getCountryByCode(countryCode)).rejects.toThrow(Error);
      expect(axios.get).toHaveBeenCalledWith(`https://restcountries.com/v3.1/alpha/${countryCode}`);
    });
  });

  describe('Edge cases for country data formatting', () => {
    it('should handle country with missing data fields', async () => {
      // Setup
      const incompleteCountry = {
        // Missing name.common
        name: {},
        // No population
        region: 'Oceania',
        // No languages
        flags: {}, // No PNG
        // No capital
      };
      
      const expectedFormatted = {
        name: 'N/A',
        population: 'N/A',
        region: 'Oceania',
        languages: 'N/A',
        flag: 'N/A',
        capital: 'N/A'
      };
      
      axios.get.mockResolvedValueOnce({ data: [incompleteCountry] });

      // Execute
      const result = await getCountryByCode('incomplete');

      // Verify all fields have fallback values
      expect(result).toEqual(expectedFormatted);
    });

    it('should handle multiple languages correctly', async () => {
      // Setup
      const multiLanguageCountry = {
        name: { common: 'Switzerland' },
        population: 8636896,
        region: 'Europe',
        languages: { 
          deu: 'German', 
          fra: 'French', 
          ita: 'Italian', 
          roh: 'Romansh' 
        },
        flags: { png: 'https://flagcdn.com/ch.png' },
        capital: ['Bern']
      };
      
      const expected = {
        name: 'Switzerland',
        population: 8636896,
        region: 'Europe',
        languages: 'German, French, Italian, Romansh',
        flag: 'https://flagcdn.com/ch.png',
        capital: 'Bern'
      };
      
      axios.get.mockResolvedValueOnce({ data: [multiLanguageCountry] });

      // Execute
      const result = await getCountryByCode('ch');

      // Verify languages are joined correctly
      expect(result).toEqual(expected);
    });

    it('should handle countries with multiple capitals', async () => {
      // Setup
      const multiCapitalCountry = {
        name: { common: 'SouthAfrica' },
        population: 59308690,
        region: 'Africa',
        languages: { afr: 'Afrikaans', eng: 'English' },
        flags: { png: 'https://flagcdn.com/za.png' },
        capital: ['Pretoria', 'Cape Town', 'Bloemfontein']
      };
      
      axios.get.mockResolvedValueOnce({ data: [multiCapitalCountry] });

      // Execute
      const result = await getCountryByCode('za');

      // Verify only first capital is used
      expect(result.capital).toBe('Pretoria');
    });
  });

  describe('Console error logging', () => {
    it('should log error when API call fails', async () => {
      // Setup
      const consoleSpy = vi.spyOn(console, 'error');
      const errorMsg = 'API Error';
      axios.get.mockRejectedValueOnce(new Error(errorMsg));

      // Execute
      try {
        await getAllCountries();
      } catch (error) {
        // Expected to throw
      }

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching all countries:', 
        expect.any(Error)
      );
    });
  });
});