import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EAIP - Administration",
  description: "EAIP Frontend - Administration application",
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
