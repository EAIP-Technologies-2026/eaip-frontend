import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "../components/app-providers";
import { ThemeScript } from "@eaip/theme";

export const metadata: Metadata = {
  title: "EAIP Workspace",
  description: "Knowledge and memory management — upload documents, search enterprise data, and curate agent memory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <a
          href="#main-content"
          className="absolute -top-10 left-0 z-50 rounded-md bg-primary px-4 py-2 text-sm text-text-inverse transition-all focus:top-2"
        >
          Skip to main content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
