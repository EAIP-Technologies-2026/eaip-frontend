import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EAIP - Enterprise Console",
  description: "EAIP Frontend - Enterprise Console application",
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
