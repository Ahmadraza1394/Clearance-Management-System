import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "./components/ClientProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Clearance Management System",
  description: "A comprehensive system for managing student clearance processes",
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
  