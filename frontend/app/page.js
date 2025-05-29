"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import Image from "next/image";


import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const router = useRouter();
  const { auth } = useAuth();

  // If user is already logged in, redirect to the appropriate dashboard
  if (auth.isAuthenticated && !auth.loading) {
    if (auth.role === "admin") {
      router.push("/admin/dashboard");
    } else if (auth.role === "student") {
      router.push("/student/dashboard");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 via-white to-blue-500 p-6">
      {/* Logo Section */}
      <div className="mb-10">
        <Image
          src="/logo.jpg" // Ensure the image is in the /public folder
          alt="UET Taxila Logo"
          width={180} // Slightly adjusted size
          height={180}
          className="rounded-full shadow-lg" // Added rounded corners and shadow
        />
      </div>

      {/* Welcome Message */}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 text-center mb-4 leading-tight">
        Welcome to the UET Taxila <br /> Clearance Management System
      </h1>
      <p className="text-gray-600 mt-2 text-lg md:text-xl text-center max-w-2xl mb-8">
        Streamline your university clearance process efficiently and accessibly
        online.
      </p>

      {/* Continue Button */}
      <button
        onClick={() => router.push("/login")}
        className="mt-6 flex items-center gap-2 bg-blue-600 text-white text-lg px-8 py-3 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
      >
        <span>Proceed to Login</span>
        <ArrowRightIcon className="h-5 w-5" /> {/* Example Icon */}
      </button>
      {/* new button for moving to main menu */}
    </div>
  );
}
