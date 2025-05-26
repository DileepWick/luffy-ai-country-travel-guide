import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Logo from "../assets/images/Logo.png";
import { Input, Button } from "@heroui/react";

const Signup = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });
  
  const [error, setError] = useState("");
  
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      const response = await axios.post("http://localhost:5000/signup", {
        username: form.username,
        password: form.password,
      });
      
      localStorage.setItem("token", response.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "User already exists");
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 font-semibold px-4 sm:px-6">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-white rounded-xl shadow-lg">
        {/* Form Section */}
        <div className="p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
          <p className="mt-3 text-lg text-gray-600">Join Grand Line Guide and start exploring</p>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 text-base rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSignup} className="mt-8 space-y-6">
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
                placeholder="Choose a username"
              />
            </div>
            
            <div>
              <Input
                id="password"
                color="primary"
                name="password"
                variant="faded"
                type="password"
                label="Password"
                placeholder="Create a password"
                required
                value={form.password}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <Input
                id="confirmPassword"
                color="primary"
                name="confirmPassword"
                variant="faded"
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>
            
            <div className="pt-2">
              <Button
                type="submit"
                color="primary"
                className="w-full flex justify-center"
              >
                Sign Up
              </Button>
            </div>
          </form>
          
          <p className="mt-8 text-center text-base text-gray-600">
            Already have an account?{" "}
            <a 
              className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Log in
            </a>
          </p>
        </div>
        
        {/* Logo Section */}
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

export default Signup;