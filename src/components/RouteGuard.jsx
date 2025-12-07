"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { navItems } from "@/lib/routes_variables";
import SearchLoader from "./custom_ui/SearchLoader";
export function RouteGuard({ children, requiredPermission = "read" }) {
  const [isAllowed, setIsAllowed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAccess = () => {
      try {
        const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");

        // Find the current page ID based on the route
        const currentNavItem = navItems.find((item) => item.href === pathname);

        if (!currentNavItem) {
          // If route not found in navItems, allow access (could be a sub-route)
          setIsAllowed(true);
          setIsChecking(false);
          return;
        }

        // Check if user has the required permission for this page
        const hasPermission = permissions.some(
          (permission) =>
            permission.page === currentNavItem.id && permission.operation === requiredPermission
        );

        if (!hasPermission) {
          // Redirect to first accessible page
          const allowedItems = navItems.filter((item) =>
            permissions.some((p) => p.page === item.id)
          );

          if (allowedItems.length > 0) {
            router.push(allowedItems[0].href);
          } else {
            // No accessible pages, show access denied
            setIsAllowed(false);
          }
        } else {
          setIsAllowed(true);
        }
      } catch (error) {
        console.error("Error checking route access:", error);
        setIsAllowed(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();

    // Listen for storage changes
    const handleStorageChange = () => {
      setIsChecking(true);
      checkAccess();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [pathname, requiredPermission, router]);

  if (isChecking) {
    return (
      // <div className="flex items-center justify-center min-h-64">
      //   <div className="text-center">
      //     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      //     <p className="mt-2 text-text">Checking permissions...</p>
      //   </div>
      // </div>
      <SearchLoader/>
    );
  }

  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-heading mb-2">Access Denied</h2>
          <p className="text-text mb-4">You don&apos;t have permission to access this page.</p>
          <Button
            onClick={() => {
              const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
              const allowedItems = navItems.filter((item) =>
                permissions.some((p) => p.page === item.id)
              );
              if (allowedItems.length > 0) {
                router.push(allowedItems[0].href);
              }
            }}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return children;
}

// Higher Order Component for page-level protection
export function withRouteGuard(Component, requiredPermission = "read") {
  return function ProtectedComponent(props) {
    return (
      <RouteGuard requiredPermission={requiredPermission}>
        <Component {...props} />
      </RouteGuard>
    );
  };
}
