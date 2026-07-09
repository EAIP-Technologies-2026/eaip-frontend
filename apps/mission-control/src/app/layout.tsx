import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EAIP - Mission Control",
  description: "EAIP Frontend - Mission Control application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
