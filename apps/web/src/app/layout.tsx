import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DialogProvider } from "@/components/providers/DialogProvider";
import { GlobalErrorCatcher } from "@/components/GlobalErrorCatcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: 'COMERZA - %s',
    default: 'COMERZA',
  },
  description: "Punto de venta y administración en la nube",
  icons: {
    icon: "/logo.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <GlobalErrorCatcher />
        <DialogProvider>
          {children}
        </DialogProvider>
      </body>
    </html>
  );
}
