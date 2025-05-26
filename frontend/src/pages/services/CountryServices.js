import axios from "axios";

const BASE_URL = "https://restcountries.com/v3.1";

// Common mapper to filter country data
const formatCountry = (country) => ({
  name: country.name?.common || "N/A",
  population: country.population || "N/A",
  region: country.region || "N/A",
  languages: country.languages
    ? Object.values(country.languages).join(", ")
    : "N/A",
  flag: country.flags?.png || "N/A",
  capital: country.capital?.[0] || "N/A",
});

// ▪ GET /all – to get a list of all countries.
export const getAllCountries = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/all`);
    return res.data.map(formatCountry);
  } catch (err) {
    console.error("Error fetching all countries:", err);
    throw err;
  }
};

// ▪ GET /name/{name} – to search a country by its name.
export const getCountryByName = async (name) => {
  try {
    const res = await axios.get(`${BASE_URL}/name/${name}`);
    return res.data.map(formatCountry);
  } catch (err) {
    console.error(`Error searching for country "${name}":`, err);
    throw err;
  }
};

// ▪ GET /region/{region} – to get countries from a specific region.
export const getCountriesByRegion = async (region) => {
  try {
    const res = await axios.get(`${BASE_URL}/region/${region}`);
    return res.data.map(formatCountry);
  } catch (err) {
    console.error(`Error fetching countries from region "${region}":`, err);
    throw err;
  }
};

// ▪ GET /alpha/{code} – to get full details using a country code.
export const getCountryByCode = async (code) => {
  try {
    const res = await axios.get(`${BASE_URL}/alpha/${code}`);
    return formatCountry(res.data[0]); // alpha returns array
  } catch (err) {
    console.error(`Error fetching country with code "${code}":`, err);
    throw err;
  }
};
