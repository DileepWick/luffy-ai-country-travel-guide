// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

//Components
import Header from "../components/Header";
import CountryTable from "../components/CountryTable";
import Loader from "../assets/images/bg2.gif";

const Home = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      axios
        .get("http://localhost:5000/protected", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setMessage(response.data.message))
        .catch((error) => {
          localStorage.removeItem("token");
          navigate("/login");
        });
    }
  }, [navigate]);

  return (
    <div>
      <Header />
      {/* Desktop layout with background image */}
      <div
        className="hidden md:flex min-h-screen bg-white"
        style={{
          backgroundImage: `url(${Loader})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "left center",
        }}
      >
        {/* Right: Banner Image */}
        <div className="w-1/4 flex items-center justify-center p-4"></div>

        {/* Left: Countries Table */}
        <div className="w-3/4 p-6">
          <CountryTable />
        </div>
      </div>

      {/* Mobile layout without background image */}
      <div className="flex md:hidden min-h-screen bg-white">
        <div className="w-full p-4">
          <CountryTable />
        </div>
      </div>
    </div>
  );
};

export default Home;
