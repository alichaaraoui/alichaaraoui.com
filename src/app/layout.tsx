import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

/* The emphasised words in the statement only. Everything around them is the
   light sans; the jump between the two is the whole effect. */
const serif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alichaaraoui.com"),
  title: {
    default: "Ali Chaaraoui",
    template: "%s — Ali Chaaraoui",
  },
  description: "Selected software and architecture work by Ali Chaaraoui.",
  openGraph: {
    title: "Ali Chaaraoui",
    description: "Selected software and architecture work.",
    url: "https://alichaaraoui.com",
    siteName: "Ali Chaaraoui",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Nav />
        {children}
      </body>
    </html>
  );
}
