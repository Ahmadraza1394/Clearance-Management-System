import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { StudentProvider } from "./context/StudentContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "UET Taxila Clearance Management System",
  description: "Manage student clearance processes efficiently",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <StudentProvider>{children}</StudentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
