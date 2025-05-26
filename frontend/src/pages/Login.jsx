import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Logo from "../assets/images/Logo.png"; // Assuming you have a logo image
 
import {Input ,Button} from "@heroui/react"

const Login = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  
  const [error, setError] = useState("");
  
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const res = await axios.post("http://localhost:5000/login", form);
      const { token, user } = res.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("username", form.username);
      
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 font-semibold px-4 sm:px-6 ">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-white rounded-xl shadow-lg">
        {/* Form Section */}
        <div className="p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-3 text-lg text-gray-600">Login to your Grand Line Guide account</p>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 text-base rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div>
              <Input
                id="username"
                name="username"
                color="primary"
                label="Username"
                variant="faded"
                type="text"
                required
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your username"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
              </div>
              <Input
                id="password"
                color="primary"
                name="password"
                variant="faded"
                type="password"
                label="Password"
                placeholder="Enter your password"
                required
                value={form.password}
                onChange={handleChange}
              />
            </div>
            
            <div className="pt-2">
              <Button
                type="submit"
                color="primary"
                className="w-full flex justify-center "
              >
                Login
              </Button>
            </div>
          </form>
          
          <p className="mt-8 text-center text-base text-gray-600">
            Don't have an account?{" "}
            <a 
              className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </a>
          </p>
        </div>
        
        {/* Logo Section - Now visible on small screens as well */}
        <div className="bg-gray-100 flex items-center justify-center p-8 lg:p-10">
          <div className="flex flex-col items-center">
            <img 
              src={Logo}
              alt="Grand Line Guide Logo" 
              className="w-40 h-40 sm:w-48 sm:h-48"
            />
            <h3 className="mt-6 text-2xl font-semibold text-blue-600">Grand Line Guide</h3>
            <p className="mt-3 text-base text-center text-gray-600 max-w-xs font-semibold">
              Visit your favourite countries and cities with our travel guide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;