"use client";

import { PropertySection } from "@/components/property/PropertySection";

export default function CarsPage({ isExpanded }) {
  return (
    <div>
      <PropertySection isExpanded={isExpanded} />
    </div>
  );
}

