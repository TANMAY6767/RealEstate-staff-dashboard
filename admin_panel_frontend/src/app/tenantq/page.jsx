// Feedback page (page.jsx)
"use client";
import {  Navbar } from "@/components";
import  {TenantQSection} from "@/components/TenantQ/TenantQSection";
export default function Role({ isExpanded }) {
  return (
    <div
    className="overflow-auto w-full "
    >
      {/* <Navbar> */}
        <TenantQSection isExpanded={isExpanded} />
      {/* </Navbar> */}
    </div>
  );
}
