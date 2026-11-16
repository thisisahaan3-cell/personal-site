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

/**
 * Netlify inserts an HTML comment (and a line break before it) into <head> when it
 * serves the page. React counts that as a hydration mismatch and re-renders the whole
 * page, which restarts the entrance. This removes the comment and any whitespace-only
 * text from <head> before React starts. React's own markers are a few characters long
 * and never sit in <head>, so only long comments go.
 */
const headCleanupScript = `try{for(const n of Array.from(document.head.childNodes)){if((n.nodeType===8&&n.data.length>8)||(n.nodeType===3&&!n.data.trim()))n.remove()}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${display.variable} ${text.variable} ${data.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `${motionScript};${headCleanupScript}` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
