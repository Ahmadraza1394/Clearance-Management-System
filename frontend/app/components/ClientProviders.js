"use client";
import { AuthProvider } from "../context/AuthContext";
import { StudentProvider } from "../context/StudentContext";
import { NotificationProvider } from "../context/NotificationContext";
import Footer from "./Footer";

export default function ClientProviders({ children }) {
  return (
    <AuthProvider>
      <StudentProvider>
        <NotificationProvider>
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </NotificationProvider>
      </StudentProvider>
    </AuthProvider>
  );
}
