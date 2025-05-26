import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  Chip,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";

import {
  getAllCountries,
  getCountryByName,
  getCountriesByRegion,
  getCountryByCode,
} from "../pages/services/CountryServices";

import ViewButton from "./ViewButton";


const ITEMS_PER_PAGE = 5;

const CountryTable = () => {
  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [region, setRegion] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchFiltered = async () => {
      try {
        if (searchTerm.trim()) {
          if (searchTerm.trim().length <= 3) {
            const result = await getCountryByCode(searchTerm.trim());
            setCountries([result]); // country by code returns single
            setCurrentPage(1);
          } else {
            const result = await getCountryByName(searchTerm.trim());
            setCountries(result);
            setCurrentPage(1);
          }
        } else if (region !== "All") {
          const result = await getCountriesByRegion(region);
          setCountries(result);
          setCurrentPage(1);
        } else {
          fetchCountries();
        }
      } catch (err) {
        setCountries([]);
      }
    };

    const delay = setTimeout(() => fetchFiltered(), 300);
    return () => clearTimeout(delay);
  }, [searchTerm, region]);

  const fetchCountries = async () => {
    try {
      const result = await getAllCountries();
      setCountries(result);
    } catch (error) {
      console.error("Failed to fetch countries:", error);
    }
  };

  const totalPages = Math.ceil(countries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCountries = countries.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Input
          type="text"
          placeholder="Name or Code"
          value={searchTerm}
          color="primary"
          variant="faded"
          label="Search"
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2  rounded w-full sm:w-1/2"
        />
        <Select
          className="max-w-xs"
          label="Filter by Region"
          color="primary"
            variant="underlined"
          placeholder="All"
          selectedKeys={[region]}
          onChange={(e) => setRegion(e.target.value)}
        >
          {["All", "Africa", "Americas", "Asia", "Europe", "Oceania"].map(
            (region) => (
              <SelectItem key={region} value={region} color="primary">
                {region}
              </SelectItem>
            )
          )}
        </Select>
      </div>

      {/* Table */}
      <Table aria-label="List of Countries" className="bg-transparent">
        <TableHeader>
          <TableColumn>Flag</TableColumn>
          <TableColumn>Country</TableColumn>
          <TableColumn>Capital</TableColumn>
          <TableColumn>Region</TableColumn>
          <TableColumn>Population</TableColumn>
          <TableColumn>Languages</TableColumn>
          <TableColumn></TableColumn>
        </TableHeader>
        <TableBody>
          {paginatedCountries.map((country, index) => (
            <TableRow key={index}>
              <TableCell>
                <img
                  src={country.flag}
                  alt={`Flag of ${country.name}`}
                  className="w-10 h-6 object-cover border radius"
                  style={{ borderRadius: "5px" }}
                />
              </TableCell>
              <TableCell>{country.name}</TableCell>
              <TableCell>{country.capital}</TableCell>
              <TableCell>{country.region}</TableCell>
              <TableCell>
                <Chip color="primary" variant="dot">
                  {country.population.toLocaleString()}
                </Chip>
              </TableCell>
              <TableCell>{country.languages}</TableCell>
              <TableCell>
                <ViewButton country={country.name} flag={country.flag} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="flex justify-center gap-2 mt-4">
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          size="sm"
          variant="ghost"
        >
          Previous
        </Button>
        <span className="px-4 py-2 font-semibold text-sm tex-gray">{` ${currentPage} / ${totalPages}`}</span>
        <Button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          size="sm"
          variant="ghost"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default CountryTable;
