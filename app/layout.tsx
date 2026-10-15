/**
 * Root layout for MPSS application
 * Includes header, footer, cart provider, and global font setup.
 * The /customization route renders without header/footer (full-screen studio mode).
 */
"use client";

import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { UserProvider } from "@/lib/user-context";
import ProfileSettingsModal from "@/components/profile/profile-settings-modal";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/customization") || pathname?.startsWith("/custom-studio");
  const isHome = pathname === "/";

  if (isStudio) {
    // Full-screen studio — no header, no footer, no padding
    return <>{children}</>;
  }

  if (isHome) {
    // Landing page — no top header section, no top padding offset
    return (
      <>
        <main className="flex-1">{children}</main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      {/* Top padding to offset the fixed header */}
      <main className="flex-1 pt-16 lg:pt-20">{children}</main>
      <Footer />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <UserProvider>
          <CartProvider>
            <LayoutShell>{children}</LayoutShell>
            <ProfileSettingsModal />
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
