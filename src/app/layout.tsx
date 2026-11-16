import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Martian_Mono, Schibsted_Grotesk } from "next/font/google";
import { Shell } from "@/components/shell/Shell";
import { site } from "@/content/site";
import "./globals.css";

const display = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal"],
  axes: ["opsz"],
  display: "swap",
  variable: "--ff-display",
});

const text = Schibsted_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--ff-text",
});

const figure = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--ff-figure",
});

const name = site.identity.name;
const description = site.about.profile.text;

export const metadata: Metadata = {
  title: { default: name, template: `%s, ${name}` },
  description,
  openGraph: { title: name, description, type: "profile", siteName: name, locale: "en_IN" },
  twitter: { card: "summary", title: name, description },
};

export const viewport: Viewport = {
  themeColor: "#0A101C",
  colorScheme: "dark",
};

/**
 * Runs before first paint. Intro start states apply only when `js-motion` is present, so
 * with scripts off or reduced motion every page is complete and still.
 */
const motionScript = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('js-motion')}}catch(e){}`;

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
      className={`${display.variable} ${text.variable} ${figure.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `${motionScript};${headCleanupScript}` }} />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
