// components/ui/ButtonLoader.tsx

"use client";

import React from "react";
import "./ButtonLoader.css"; // put your spinner CSS here

const ButtonLoader = () => {
  return (
    <div className="spinner center text-text">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="spinner-blade"></div>
      ))}
    </div>
  );
};

export default ButtonLoader;
