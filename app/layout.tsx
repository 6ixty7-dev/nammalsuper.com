import type { Metadata } from "next";
import { Cormorant_Garamond, Caveat, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { PresenceProvider } from "@/hooks/usePresence";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-handwriting",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Our Space 💕 | A Digital Love Story",
  description: "A private digital space for two souls. Our story, our memories, our love.",
  keywords: ["couple", "love", "private", "memories", "together"],
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${caveat.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#FAF7F2" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💕</text></svg>" />
      </head>
      <body className="min-h-screen bg-paper-bg text-ink-brown font-ui selection:bg-antique-gold/20 antialiased overflow-x-hidden">
        <AuthProvider>
          <PresenceProvider>
            {children}
          </PresenceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
