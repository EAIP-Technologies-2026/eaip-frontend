import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "../components/app-providers";

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
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
