import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--ff-display",
});

const text = Geist({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--ff-text",
});

const data = Geist_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--ff-data",
});

const title = site.identity.name;
const description = site.about.profile.text;

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "profile",
    siteName: title,
    locale: "en_IN",
  },
  twitter: { card: "summary", title, description },
};

export const viewport: Viewport = {
  themeColor: "#F6F5F1",
  colorScheme: "light",
};

/**
 * Runs before first paint. Motion start states (the hero entrance) apply only when
 * this class is present, so with scripts off or reduced motion the page is complete.
 */
const motionScript = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('js-motion','pre-entrance')}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${display.variable} ${text.variable} ${data.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
