import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { DevLinkProvider } from "@/devlink/DevLinkProvider";
import { NavbarTubbly } from "@/devlink/NavbarTubbly";
import { FooterTubbly } from "@/devlink/FooterTubbly";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plinx Analytics | Tubbly",
  description: "Analyze token airdrops and recipient holdings across multiple blockchains with Plinx by Tubbly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <DevLinkProvider>
          <NavbarTubbly
            navlinkPartnersLink={{ href: "/en/partnerzy" }}
            navlinkBlockchain={{ href: "/en/blockchain" }}
            navlinkDownload={{ href: "/en/download" }}
            navlinkLogoHome={{ href: "/en" }}
            navlinkPartnersName="Partners"
            navlinkBlockchainName="Blockchain"
            navlinkDownloadName="Download Tubbly"
          />
          {children}
          <FooterTubbly
            footerAktualnosciName="Updates"
            footerAktualnosciLink={{ href: "/en/articles" }}
            footerRegulaminLInk={{ href: "/en/warunki-uzytkowania-tubbly" }}
            footerRegulaminName="Regulation"
            footerPolitykaPrywatnosciLink={{ href: "/en/polityka-prywatnosci" }}
            footerPolitykaPrywatnosciName="Privacy Policy"
            footerSkrzynkiRegulaminLink={{ href: "/en/regulamin-lootbox-tubbly" }}
            footerSkrzynkiRegulaminName="Terms & Conditions Lootboxes"
          />
        </DevLinkProvider>
      </body>
    </html>
  );
}
