import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import BotpressWebchat from "./components/BotpressWebchat";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeoLynk",
  description: "Comprehensive management system for Leo Clubs",
  icons: {
    icon: [
      { url: '/logo.png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
        <BotpressWebchat />
        <SpeedInsights />
      </body>
    </html>
  );
}
