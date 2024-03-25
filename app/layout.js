import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from 'jspdf';

import SessionProvider from "../lib/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children, session }) {
  const doc = new jsPDF();
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={inter.className + "h-full"}>
        <SessionProvider session={session}>
          <ToastContainer></ToastContainer>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
