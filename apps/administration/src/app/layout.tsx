import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "../components/app-providers";

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
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
