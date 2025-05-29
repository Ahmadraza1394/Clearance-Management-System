"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { EyeIcon } from "@heroicons/react/24/outline"; // Importing only EyeIcon



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const router = useRouter();
  const { loginWithEmailAndPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate form
      if (!email || !password) {
        throw new Error("Please enter both email and password");
      }

      // Login with credentials - now properly awaiting the result
      const result = await loginWithEmailAndPassword(email, password);
      console.log('Login result:', result);

      if (result.success) {
        // Redirect based on role
        if (result.user.role === "admin") {
          router.push("/admin/dashboard");
        } else if (result.user.role === "student") {
          router.push("/student/dashboard");
        }
      } else {
        throw new Error(result.message || "Invalid credentials");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 sm:p-10">
        {/* UET Logo & Header */}
        <div className="text-center mb-8">
          <img
            src="/logo.jpg"
            alt="UET Taxila Logo"
            className="mx-auto h-20 w-20 object-contain"
          />
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-800">
            UET Taxila Clearance Portal
          </h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
        </div>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-blue-600 focus:border-blue-600 sm:text-sm px-3 py-2"
                placeholder="e.g. 21-se-32@students.uettaxila.edu.pk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"} // Toggle password visibility
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-blue-600 focus:border-blue-600 sm:text-sm px-3 py-2"
                  placeholder="Your secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)} // Toggle showPassword state
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500"
                >
                  {showPassword ? (
                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-sm text-red-600 px-4 py-2 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Info */}
        <div className="text-xs text-center text-gray-500 mt-6">
          <p>
            Admin: <strong>admin@uettaxila.edu.pk</strong> / <strong>admin123</strong>
          </p>
          <p>
            Student: <strong>21-se-32@students.uettaxila.edu.pk </strong> /{" "}
            <strong>student123</strong>
          </p>
        </div>

        {/* Divider */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                <Link href="/" className="text-blue-600 hover:underline">
                  Return to Home
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
