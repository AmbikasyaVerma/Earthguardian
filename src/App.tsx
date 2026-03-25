import React, { useState } from "react";
import LandingPage from "./LandingPage";
import Dashboard from "./Dashboard";
import Login from "./Login";
import Signup from "./Signup";

function App() {
  const [currentPage, setCurrentPage] = useState<
    "landing" | "login" | "signup" | "dashboard"
  >("landing");

  const handleEnterDashboard = () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      setCurrentPage("dashboard");
    } else {
      setCurrentPage("login");
    }
  };

  const handleLogin = (email: string, password: string) => {
    // Simple demo login - replace with actual authentication
    if (email && password.length >= 6) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      setCurrentPage("dashboard");
    }
  };

  const handleSignup = (name: string, email: string, password: string) => {
    // Simple demo signup - replace with actual registration
    if (name && email && password.length >= 6) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", name);
      localStorage.setItem("userEmail", email);
      setCurrentPage("dashboard");
    }
  };

  const handleLogout = () => {
    console.log("Logging out..."); // Add this to debug
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    setCurrentPage("landing");
  };

  return (
    <>
      {currentPage === "landing" && (
        <LandingPage
          onEnterDashboard={handleEnterDashboard}
          onLoginClick={() => setCurrentPage("login")}
          onSignupClick={() => setCurrentPage("signup")}
        />
      )}
      {currentPage === "login" && (
        <Login
          onLogin={handleLogin}
          onSignupClick={() => setCurrentPage("signup")}
          onBackToLanding={() => setCurrentPage("landing")}
        />
      )}
      {currentPage === "signup" && (
        <Signup
          onSignup={handleSignup}
          onLoginClick={() => setCurrentPage("login")}
          onBackToLanding={() => setCurrentPage("landing")}
        />
      )}
      {currentPage === "dashboard" && <Dashboard onLogout={handleLogout} />}
    </>
  );
}

export default App;
