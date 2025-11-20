import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import { Font } from "@react-pdf/renderer";

import SessionProvider from "../lib/SessionProvider";
import Head from "next/head";

Font.register({
  family: "Inter",
  fonts: [
    { src: "/Inter_18pt-Regular.ttf", format: "truetype" },
    { src: "/Inter_18pt-Light.ttf", format: "truetype", fontWeight: 300 },
    { src: "/Inter_18pt-Medium.ttf", format: "truetype", fontWeight: "normal" },
    { src: "/Inter_18pt-SemiBold.ttf", format: "truetype", fontWeight: 600 },
    { src: "/Inter_18pt-Bold.ttf", format: "truetype", fontWeight: "bold" },
    { src: "/Inter_18pt-Black.ttf", format: "truetype", fontWeight: "black" },
  ],
});

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HoT Kampagnen-Station",
  description: "Kampagnen und Reportings",
};

export default function RootLayout({ children, session }) {
  const doc = new jsPDF();
  return (
    <html lang="en" className="h-full bg-gray-50">
      <Head>
        <title>Home of Talents - Reportings und Angebote</title>
        <meta
          property="og:title"
          content="Home of Talents - Reportings und Angebote"
          key="title"
        />
      </Head>

      <body className={inter.className + "h-full"}>
        <SessionProvider session={session}>
          <ToastContainer></ToastContainer>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
