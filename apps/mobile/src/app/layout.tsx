import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "../components/app-providers";
import { MobileShell } from "../components/mobile-shell";
import { ThemeScript } from "@eaip/theme";

export const metadata: Metadata = {
  title: "EAIP Mobile",
  description: "Field interface — access memory, run quick actions, and view activity on the go.",
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
        <AppProviders>
          <MobileShell>{children}</MobileShell>
        </AppProviders>
      </body>
    </html>
  );
}
