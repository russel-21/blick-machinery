import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Blick Machinery Cameroon SARL | Machines Industrielles & Équipements Lourds",
  description: "Blick Machinery Cameroon SARL — Spécialiste en machines industrielles, granuleuses et équipements lourds à Douala, Cameroun. Filiale de Blick Refractory Technology (Chine).",
  keywords: "machines industrielles Cameroun, granuleuses, équipements lourds, Douala, Blick Machinery",
  openGraph: {
    title: "Blick Machinery Cameroon SARL",
    description: "Votre partenaire en machines industrielles au Cameroun",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ paddingTop: '72px' }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
