import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { User ,Avatar} from "@heroui/react";
import Logo from "../assets/images/Logo.png";

const Header = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  // Load username on mount
  useEffect(() => {
    const storedUserName = localStorage.getItem("username");
    if (storedUserName) {
      setUsername(storedUserName);
    } else {
      navigate("/login"); // Redirect to login if not found
    }
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const getUserDisplayName = () => {
    return username
      ? username.charAt(0).toUpperCase() + username.slice(1)
      : "Guest";
  };

  return (
    <header className="w-full px-1 py-1 bg-white text-white flex flex-col md:flex-row justify-between items-center shadow-lg font-semibold">
      <div className="flex items-center gap-2 mb-4 md:mb-0 w-full md:w-auto justify-center md:justify-start">
        <div className="w-12 h-12 sm:w-16 sm:h-16 overflow-hidden rounded-full bg-white flex items-center justify-center">
          <img
            src={Logo}
            alt="Grand Line Guide Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl text-[#0d6ffc] font-semibold">
            Grand Line Guide
          </h1>
          <p className="text-xs sm:text-sm text-black">
            Find your favorite Grand Line characters
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 text-black w-full md:w-auto justify-center md:justify-end">
        <User
         size="md"
          color="primary"
          avatar='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlf_qoogqgSXAoiHVQKlXDykZfAHs8MunqDg&s'
          description="Traveler"
          name={getUserDisplayName()}
        />

        <Button variant="ghost" size="sm" onClick={handleLogout} color="danger">
          SignOut
        </Button>
      </div>
    </header>
  );
};

export default Header;