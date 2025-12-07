"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/user/userServices";
import { toast } from "sonner";
import { ButtonLoader } from "@/components";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setLoading(true); // start loader
      try {
        const response = await loginUser({ email, password });
        // console.log(response.data, "fewiofhwio");

        if (response.data) {
         
          toast.success("Login successful");
          localStorage.setItem("User", JSON.stringify(response.data.data.User));
          localStorage.setItem("permissions", JSON.stringify(response.data.data.permissions));
          localStorage.setItem("accessToken", response.data.data.User.accessToken);
          router.push("/");
        } else {
          
          toast.error(`${response.error}`);
          // setErrors({ email:  });
        }
      } catch (error) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false); // stop loader
      }
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-cardBg border border-border">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-heading">Login</h1>
          {/* <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-muted hover:bg-hoverBg"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button> */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-md bg-background text-text border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500 px-2 py-1 rounded-md border border-red-300 bg-red-50 dark:bg-red-900/20">
                {errors.email}
              </p>
            )}
          </div>

          <div>
  <label
    htmlFor="password"
    className="block text-sm font-medium text-text"
  >
    Password
  </label>
  <div className="relative">
    <input
      id="password"
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="mt-1 block w-full px-3 py-2 rounded-md bg-background text-text border border-border focus:outline-none focus:ring-2 focus:ring-primary pr-10"
      placeholder="Enter your password"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
  {errors.password && (
    <p className="mt-1 text-sm text-red-500 px-2 py-1 rounded-md border border-red-300 bg-red-50 dark:bg-red-900/20">
      {errors.password}
    </p>
  )}
</div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-text"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-primary hover:text-heading"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading} // disable while loading
              className="w-full flex justify-center items-center gap-2 py-2 px-4 rounded-md text-sm font-medium bg-primary text-white hover:bg-heading disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <ButtonLoader /> : "Sign in"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-text">
          Don&apos;t have an account?{" "}
          <a className="font-medium text-primary hover:text-heading">
            Contact the owner
          </a>
        </p>
      </div>
    </div>
  );
}
