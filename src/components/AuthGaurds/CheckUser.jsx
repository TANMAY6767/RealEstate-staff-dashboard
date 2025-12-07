"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Login from "@/app/login/page";
import SearchLoader from "../custom_ui/SearchLoader";

export function CheckUser({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("User");
      if (storedUser) {
        setUser(storedUser);
        // If user is present and trying to access login, redirect to dashboard
        if (pathname === "/login") {
          router.push("/dashboard"); // Or your preferred default route
        }
      } else {
        setUser(null);
        // If no user and not on login page, redirect to login
        if (pathname !== "/login") {
          router.push("/login");
        }
      }
      setLoading(false);
    };

    // Check initially
    checkUser();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === "User") {
        checkUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Custom event listener for same-tab changes
    const handleUserChange = () => checkUser();
    window.addEventListener("userUpdated", handleUserChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userUpdated", handleUserChange);
    };
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <SearchLoader />
      </div>
    );
  }

  // If no user but we're on login page, show login
  if (!user && pathname === "/login") {
    return <Login />;
  }

  // If user exists and tries to access login, show nothing (will redirect)
  if (user && pathname === "/login") {
    return null;
  }

  // If no user and not on login page, show nothing (will redirect)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
