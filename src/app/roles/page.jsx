"use client";
import { RoleSection,Navbar } from "@/components";
export default function Role({ isExpanded }) {
  return (
    <div
    className="overflow-auto w-full "
    >
      {/* <Navbar> */}
      <RoleSection isExpanded={isExpanded} />
      {/* </Navbar> */}
    </div>
  );
}
