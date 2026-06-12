import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amesthyst Workspace",
  description: "Enterprise SaaS Workspace",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const theme = (await cookieStore).get("theme")?.value;

  return (
    <html
      lang="en"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        h-full antialiased
        ${theme === "dark" ? "dark" : ""}
      `}
    >
      <body className="min-h-full
    flex
    flex-col
    bg-background
    text-foreground
    ui-scale">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}