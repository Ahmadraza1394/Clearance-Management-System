"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { StudentProvider } from "./context/StudentContext";
import { NotificationProvider } from "./context/NotificationContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <StudentProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </StudentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
  