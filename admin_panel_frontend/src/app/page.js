"use client";
import {PropertyDashboard} from "../components/Dashboard/Dashboard"
import { Navbar } from "@/components";
import { useState, useEffect } from "react";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check if splash has been shown before
    const splashShown = localStorage.getItem("splashShown");

    if (splashShown === "true") {
      setShowSplash(false);
      return;
    }

    // Show splash for 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
      localStorage.setItem("splashShown", "true");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <PropertyDashboard />
    </div>
  );
}

// SplashScreen Component
function SplashScreen() {
  return (
    <div className="flex justify-center items-center w-screen h-screen bg-white fixed top-0 left-0 z-50">
      <img
        src="https://res.cloudinary.com/dcg8mpgar/image/upload/v1757176857/Untitled_design__1_-removebg-preview_rpdk9q.png" // Update with your actual logo path
        alt="Company Logo"
        className="w-64 md:w-80 animate-zoomOutFade"
      />
    </div>
  );
}
