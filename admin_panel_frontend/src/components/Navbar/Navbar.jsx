"use client";
import React, { useState, useEffect } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "../Theme/ThemeProvider";
import { Header } from "..";
import { navItems } from "@/lib/routes_variables";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RouteGuard } from "@/components/index";
import { apiClientEvents } from "@/helper/commonHelper";

export function Navbar({ children }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [pages, setPages] = useState("Home");
  const [filteredNavItems, setFilteredNavItems] = useState([]);
  const router = useRouter();
  const pathname = usePathname();

  // Filter nav items based on permissions
  useEffect(() => {
    const checkPermissions = () => {
      try {
        const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");

        const allowedItems = navItems.filter((item) => {
          // Check if there's any permission for this page
          return permissions.some((permission) => permission.page === item.id);
        });

        setFilteredNavItems(allowedItems);

        // If current route is not accessible, redirect to first accessible page or home
        const currentPageId = navItems.find((item) => item.href === pathname)?.id;
        if (currentPageId && !permissions.some((p) => p.page === currentPageId)) {
          const firstAllowedItem = allowedItems[0];
          if (firstAllowedItem) {
            router.push(firstAllowedItem.href);
            setPages(firstAllowedItem.pages);
          }
        }
      } catch (error) {
        console.error("Error checking permissions:", error);
        setFilteredNavItems([]);
      }
    };

    checkPermissions();

    // Listen for storage changes (in case permissions are updated)
    const handleStorageChange = () => {
      checkPermissions();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [pathname, router]);

  const handleThemeChange = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavItemClick = (item) => {
    setPages(item.pages);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const evtSource = apiClientEvents.events("/notifications/stream", {
      onMessage: (msg) => {
        // console.log(msg,'weofjeowij')
        if (msg.type == "role_updated") {
          // fetchNotifications();
          localStorage.removeItem("User");
          localStorage.removeItem("permissions");
          router.push("/login");
        }
      },
      onError: (err) => {
        console.error("SSE error:", err);
      }
    });

    return () => evtSource.close();
  }, []);

  const handleNotification = async()=>{
    router.push('/all-notifications')
  }

  return (
    <div className="h-screen bg-background text-text">
      <div className="flex h-full">
        {/* Desktop Sidebar - hidden on mobile */}
        <nav
          className={`
            hidden sm:block
            fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out
            ${isExpanded ? "w-64" : "w-16"}
            bg-sidebar border-r border-sidebarBorder shadow-lg
          `}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          {/* Header */}
          <div className="flex items-center justify-start h-16 px-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-hoverBg">
                <Menu className="w-5 h-5 text-text" />
              </div>
              <span
                className={`font-semibold text-lg text-heading transition-opacity duration-300 ${
                  isExpanded ? "opacity-100" : "opacity-0"
                }`}
              >
                Dashboard
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-3 py-6">
            <ul className="space-y-2">
              {filteredNavItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={index}>
                    <Link
                      href={item.href}
                      onClick={() => setPages(item.pages)}
                      className="flex items-center px-3 py-3 rounded-lg transition-all duration-200 text-text hover:text-heading hover:bg-secondaryBg"
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span
                        className={`ml-3 transition-all duration-300 whitespace-nowrap ${
                          isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border">
            <Button
              onClick={handleThemeChange}
              variant="ghost"
              size="sm"
              className={`w-full justify-start px-3 py-3 h-auto text-text 
                ${
                  theme === "dark"
                    ? "hover:text-hoverText hover:bg-secondaryBg"
                    : "hover:bg-gray-800 hover:bg-secondaryBg hover:text-heading"
                }`}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span
                className={`ml-3 transition-all duration-300 whitespace-nowrap ${
                  isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                }`}
              >
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            </Button> 
          </div>
        </nav>

        {/* Mobile Sidebar Overlay */}
        <div
          className={`sm:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileMenu} />

          {/* Mobile Sidebar */}
          <nav
            className={`fixed left-0 top-0 h-full w-64 z-50 bg-sidebar border-r border-sidebarBorder shadow-lg transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* Header with Close Button */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-buttonBg">
                  <Menu className="w-5 h-5 text-text" />
                </div>
                <span className="font-semibold text-lg text-heading">Dashboard</span>
              </div>
              <Button
                onClick={toggleMobileMenu}
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-buttonBg"
              >
                <X className="w-5 h-5 text-text" />
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-3 py-6">
              <ul className="space-y-2">
                {filteredNavItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={index}>
                      <Link
                        href={item.href}
                        onClick={() => handleNavItemClick(item)}
                        className="flex items-center px-3 py-3 rounded-lg transition-all duration-200 text-text hover:text-hoverText hover:bg-buttonBg"
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="ml-3 whitespace-nowrap">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border">
              <Button
                onClick={handleThemeChange}
                variant="ghost"
                size="sm"
                className="w-full justify-start px-3 py-3 h-auto text-text hover:text-hoverText hover:bg-secondaryBg"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="ml-3 whitespace-nowrap">
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
              </Button>
              <Button
                onClick={handleThemeChange}
                variant="ghost"
                size="sm"
                className="w-full justify-start px-3 py-3 h-auto text-text hover:text-hoverText hover:bg-secondaryBg"
              >
                Notifications
              </Button>
            </div>
          </nav>
        </div>

        {/* Mobile Menu Button - only visible on mobile */}
        <Button
          onClick={toggleMobileMenu}
          className="h-16 w-16 rounded-none sm:hidden fixed top-0 left-0 z-30 p-2 border border-sidebarBorder bg-sidebar"
          variant="ghost"
          size="sm"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-buttonBg">
            <Menu className="w-5 h-5 text-text" />
          </div>
        </Button>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out 
            ${isExpanded ? "sm:ml-64" : "sm:ml-16"} 
            ml-0 
            background bg-cardBg`}
        >
          <Header
            pages={pages}
            isExpanded={isExpanded}
            isMobile={true}
            onMobileMenuToggle={toggleMobileMenu}
          />
          <div className="mt-20 mx-1 sm:mx-2 min-w-400">
            <RouteGuard>
              {React.isValidElement(children)
                ? React.cloneElement(children, { isExpanded })
                : children || (
                    <div className="p-8">
                      <div className="rounded-lg p-8 text-center bg-cardBg text-cardText">
                        <h1 className="text-3xl font-bold mb-4 text-heading">
                          Welcome to Your Dashboard
                        </h1>
                        <p className="text-lg text-text">
                          <span className="hidden sm:inline">
                            Hover over the sidebar to expand it.
                          </span>
                          <span className="sm:hidden">Tap the menu icon to open the sidebar.</span>
                        </p>
                      </div>
                    </div>
                  )}
            </RouteGuard>
          </div>
        </main>
      </div>
    </div>
  );
}
