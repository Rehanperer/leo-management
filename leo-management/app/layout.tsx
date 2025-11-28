import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import BotpressWebchat from "./components/BotpressWebchat";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Leo Management System",
  description: "Comprehensive management system for Leo Clubs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <BotpressWebchat />
        </ThemeProvider>
      </body>
    </html>
  );
}
