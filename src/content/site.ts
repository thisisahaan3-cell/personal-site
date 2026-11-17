/**
 * ──────────────────────────────────────────────────────────────────────────
 *  AHAAN GUPTA — SITE CONTENT
 *  This is the ONLY file the website reads its words and facts from.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * HOW TO EDIT
 *  - Change text between the quote marks. Keep the commas and brackets.
 *  - Everything is plain data: lists ([ ... ]) of items ({ ... }).
 *  - To add an item, copy an existing one in the same list and edit it.
 *  - To remove an item, delete it from { to }, including the trailing comma.
 *
 * HOW PLACEHOLDERS WORK
 *  - Anything that needs Ahaan's own words is written as ph("..."), which
 *    produces { text: "...", placeholder: true }.
 *  - The site shows these as visibly unfinished slots. Search this file for
 *    `ph(` to find every one.
 *  - To fill one in, replace `ph("Biography — to be written by Ahaan.")`
 *    with `t("Your own sentence here.")`. That removes the placeholder flag.
 *
 * SOURCES
 *  - Facts come from the resume, or from messages Ahaan sent (marked
 *    "client message" in comments). Nothing here is invented.
 *  - Items marked `needsConfirmation: true` are readings of unclear source
 *    text. Confirm them before launch.
 *  - Exact figures and qualifiers ("20+", "19+", "50+", "100+", "5+",
 *    "400+") are kept as written. Do not round or upgrade them.
 *  - The phone number is deliberately absent. Do not add it.
 *
 * WHERE THINGS LIVE
 *  - `site.stats`: headline figures. `note` is shown to readers; `editorNote`
 *    is a caveat for you and is never printed.
 *  - `site.interests`: `evidence` and `statedLine` are facts; `description`
 *    is the placeholder for Ahaan's own words.
 *  - `site.timeline`: `org` adds that organisation's logo to the event (only
 *    where a logo exists); `span` draws multi-year facts on the axis.
 *  - `site.quiz`: the six quiz questions. Each has a checked source link.
 *  - `site.ui`: every interface word (menu, headings, table heads, button and
 *    figure labels, footer). Tokens like {n} are filled in by the site.
 */

// ───────────────────────────── Types ─────────────────────────────

/** Text that may be a placeholder awaiting the client's own words. */
export type Editable = { text: string; placeholder?: boolean };

/** Plain text that is final. */
export const t = (text: string): Editable => ({ text });
/** Placeholder: the text is a neutral prompt, not copy. */
export const ph = (text: string): Editable => ({ text, placeholder: true });

export type Domain = "finance" | "quiz" | "academic" | "pitch";

/** Exact award names as printed on the resume, highest first. */
export type AwardLevel =
  | "Best Delegate"
  | "High Commendation"
  | "Runner Up"
  | "Special Mention"
  | "Honourable Mention"
  | "Verbal Mention";

export type TimelineCategory =
  | "school"
  | "academic"
  | "mun"
  | "finance"
  | "quiz"
  | "leadership"
  | "internship"
  | "course"
  | "parliament"
  | "pitch"; // business pitch competitions (SHISFEST); shown under Competitions

export type MunAward = {
  conference: string;
  conferenceFull?: string; // only where the resume expands the name
  committee: string;
  committeeFull?: string;
  award: AwardLevel; // same as `level`; kept for readability in components
  level: AwardLevel;
  year: number;
};

export type Organisation = {
  name: string;
  /** Path under /public. Present only where an official logo was obtained. */
  logo?: string;
  /** Notes for the component: "light" logos are white and need a dark background. */
  logoOnDark?: boolean;
  url?: string;
};

export type StatId =
  | "gradeX"
  | "consistency"
  | "conferences"
  | "awardsSummary"
  | "delegateAwards"
  | "nfo"
  | "fellowship"
  | "books";

export type Stat = {
  id: StatId;
  value: string; // exact, with qualifiers: "20+", "99.4%"
  label: string;
  note?: string; // context the reader should see, shown small
  editorNote?: string; // caveat for the editor only; never printed on the site
};

export type Evidence = {
  text: string;
  source: "resume" | "client message";
};

export type Interest = {
  id: string;
  name: string;
  /** Facts from the resume or client messages that genuinely relate. Not claims of expertise. */
  evidence: Evidence[];
  /** Where the interest itself is stated. */
  statedIn: ("resume" | "client message")[];
  /** Shown for interests with no evidence. Worded only from where the interest is stated. */
  statedLine?: string;
  description: Editable;
};

export type TimelineEvent = {
  year: number;
  /** Shown instead of `year` when the fact spans a range. */
  yearLabel?: string;
  title: string;
  detail: string;
  category: TimelineCategory;
  /** Key into `organisations`; set only where that organisation has a logo and the event took place there. */
  org?: string;
  /** Multi-year facts drawn as a span on the axis: rings on each year tick, or a rule from first to last year. */
  span?: { from: number; to: number; style: "rings" | "rule" };
};

export type QuizQuestion = {
  id: string;
  /** Interest id: finance, aviation, law, motorsport, mun or reading. */
  subject: string;
  question: string;
  options: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  explanation: string; // one sentence
  source: { label: string; url: string };
};

export type Competition = {
  name: string;
  year: string; // "2025", "2018 – 2024", "Ongoing", or "Year not stated"
  results: string[];
  domain: Domain;
  org?: string; // key into `organisations`
  ongoing?: boolean;
  /** Placeholder slots for details the client has not supplied. */
  details?: Record<string, Editable>;
  note?: string;
};

export type Role = {
  title: string;
  organisation: string;
  org?: string;
  period: string;
  points: string[];
  needsConfirmation?: boolean;
  confirmationNote?: string;
};

// ───────────────────────────── Organisations ─────────────────────────────
// Logos shown only where an official file was obtained (see
// content/research/assets.md). Logos indicate where something took place.
// They never imply endorsement. Others fall back to the name in text.

export const organisations: Record<string, Organisation> = {
  lotusValley: {
    name: "Lotus Valley International School, Gurugram",
    logo: "/logos/lotus-valley.jpg",
    url: "https://www.lotusvalleygurgaon.com",
  },
  srcc: {
    name: "Shri Ram College of Commerce",
    logo: "/logos/srcc.png",
    url: "https://www.srcc.edu",
  },
  iitMadras: {
    name: "IIT Madras",
    logo: "/logos/iit-madras.png",
    url: "https://www.iitm.ac.in",
  },
  iitDelhi: {
    name: "IIT Delhi",
    logo: "/logos/iit-delhi-white.png",
    logoOnDark: true,
    url: "https://home.iitd.ac.in",
  },
  cbse: {
    name: "CBSE",
    logo: "/logos/cbse.png",
    url: "https://www.cbse.gov.in",
  },
  sof: {
    name: "Science Olympiad Foundation",
    logo: "/logos/sof.jpg",
    url: "https://sofworld.org",
  },
  // The Wharton mark identifies the competition's organiser only. Penn and Wharton
  // restrict use of their marks; delete the `logo` line to show the name in text instead.
  wharton: {
    name: "Wharton Global Youth Program",
    logo: "/logos/wharton.svg",
    url: "https://globalyouth.wharton.upenn.edu/investment-competition/",
  },
  prs: { name: "PRS Legislative Research", url: "https://prsindia.org" },
  gitam: { name: "GITAM" },
  melbourne: { name: "University of Melbourne" },
  fortis: { name: "Fortis Adayu Hospital" },
  hcl: { name: "HCL" },
  nfo: { name: "National Finance Olympiad" },
  scottishHigh: { name: "Scottish High International School" },
  gurugramUniversity: { name: "Gurugram University" },
  blueBells: { name: "Blue Bells International School" },
  fateh: { name: "Fateh Education" },
  weCare: { name: "We Care Foundation" },
};

// ───────────────────────────── Site content ─────────────────────────────

export const site = {
  // ── Identity ──
  identity: {
    name: "Ahaan Gupta",
    school: "Lotus Valley International School",
    city: "Gurugram",
    grade: "Grade 11",
    stream: "Commerce",
    email: "thisisahaan@gmail.com", // the only public contact
    resumeFile: "/Ahaan-Gupta-Resume.pdf", // redacted copy, no phone number
    portrait: "/images/portrait.webp",
    /** States only what is visible, never character. */
    portraitAlt:
      "Head-and-shoulders photograph of Ahaan Gupta, smiling, in a navy blazer and light blue shirt, outdoors.",
  },

  // ── Media (version 2) ──
  /**
   * Footage and stills used as atmosphere behind each page.
   * To use your own photo or clip, replace the `src` (and `poster`, for a loop) with the path of
   * your file in /public/media/ and set `stock` to false.
   * Items marked `stock: true` are free-to-use stock media: atmosphere only. They are not
   * pictures of Ahaan, his school or any event he attended, and the site never captions them.
   * `pending: true` means the file has not been supplied yet (the page must render without it).
   * Sources and licences: content/research/assets.md, "Stock media".
   */
  media: {
    m1: { src: "/media/m1-home.mp4", poster: "/media/m1-home.jpg", kind: "loop", stock: true, alt: "" }, // Home: aerial city at night
    m2: { src: "/media/m2-finance.mp4", poster: "/media/m2-finance.jpg", kind: "loop", stock: true, alt: "" }, // Finance: towers at blue hour
    m3: { src: "/media/m3-model-un.mp4", poster: "/media/m3-model-un.jpg", kind: "loop", stock: true, alt: "", pending: true }, // Model UN: neutral hall/globe loop (file removed: previous flag clip was unsuitable; none found yet)
    m4: { src: "/media/m4-chamber.webp", kind: "still", stock: true, alt: "" }, // Model UN: legislative chamber, seats and desks
    m5: { src: "/media/m5-clouds.mp4", poster: "/media/m5-clouds.jpg", kind: "loop", stock: true, alt: "" }, // Academics: clouds from the wing
    m6: { src: "/media/m6-aircraft.mp4", poster: "/media/m6-aircraft.jpg", kind: "loop", stock: true, alt: "" }, // Academics: aircraft overhead
    m7: { src: "/media/m7-colonnade.webp", kind: "still", stock: true, alt: "" }, // Academics: fluted Ionic pilasters (bright; darken in CSS)
    m8: { src: "/media/m8-canopy.mp4", poster: "/media/m8-canopy.jpg", kind: "loop", stock: true, alt: "" }, // Leadership: forest canopy
    m9: { src: "/media/m9-library.webp", kind: "still", stock: true, alt: "" }, // Contact: reading room with book alcoves
  } as Record<
    "m1" | "m2" | "m3" | "m4" | "m5" | "m6" | "m7" | "m8" | "m9",
    {
      src: string;
      poster?: string;
      kind: "loop" | "still";
      stock: boolean;
      alt: string;
      pending?: boolean;
    }
  >,

  /**
   * Empty slots for Ahaan's own photo or clip, one per page. Nothing renders while `src` is empty.
   * To fill one: put the file in /public/media/ and set `src` (and `poster` for a clip) and `alt`.
   * `aspect` reserves the space, so the page does not shift when the file loads.
   */
  mediaSlots: {
    finance: { src: "", poster: "", kind: "still", alt: "", aspect: "16 / 9" },
    modelUn: { src: "", poster: "", kind: "still", alt: "", aspect: "16 / 9" },
    leadership: { src: "", poster: "", kind: "still", alt: "", aspect: "16 / 9" },
  } as Record<"finance" | "modelUn" | "leadership", { src: string; poster: string; kind: "loop" | "still"; alt: string; aspect: string }>,

  // ── Hero ──
  hero: {
    /** One-line descriptor taken from the resume profile ("interested in civil aviation and finance"). */
    descriptor: t("Grade 11 (Commerce) student at Lotus Valley International School, Gurugram."),
    tagline: ph("Personal tagline — to be written by Ahaan."),
    statement: ph("Personal statement — to be written by Ahaan."),
  },

  // ── About ──
  about: {
    /** Resume profile, lightly edited: removed "16-year-old" (age is not published). */
    profile: t(
      "Self-driven student with a track record of competing and winning at the national level across finance, diplomacy, parliamentary debate and academics. Interested in the fields of civil aviation and finance.",
    ),
    profileSource: "Resume, Profile section (age removed; wording otherwise as written).",
    biography: [
      ph("Biography, paragraph 1 — to be written by Ahaan."),
      ph("Biography, paragraph 2 — to be written by Ahaan."),
      ph("Biography, paragraph 3 — to be written by Ahaan."),
    ] as Editable[],
  },

  // ── Headline figures (only numbers present in the resume) ──
  stats: [
    { id: "gradeX", value: "99.4%", label: "CBSE Grade X Secondary Examinations", editorNote: "Resume dates this \"2025–26\"; year to be confirmed." },
    { id: "consistency", value: "96%+", label: "Consistent across all academic years" },
    { id: "conferences", value: "20+", label: "Prestigious MUN and debate conferences" },
    { id: "awardsSummary", value: "19+", label: "Awards (resume's own summary line)", editorNote: "The awards table lists 16 delegate awards; what the 19+ counts is to be confirmed." },
    { id: "delegateAwards", value: "16", label: "Delegate awards listed in the table", note: "6 Best Delegate" },
    { id: "nfo", value: "AIR 54", label: "National Finance Olympiad 2025, Nationals", note: "Out of 10,000+ participants. Round 1: AIR 10." },
    { id: "fellowship", value: "100 of 2,000", label: "SRCC FIC Finance Research Fellowship", note: "Selected from 2,000 candidates into a cohort of 100." },
    { id: "books", value: "400+", label: "Books read", note: "Across fiction, non-fiction and philosophy." },
  ] as Stat[],

  // ── Education ──
  education: {
    institution: "Lotus Valley International School, Gurugram",
    org: "lotusValley",
    period: "2013 – Present",
    current: "Grade 11 (Commerce)",
    consistency: "Consistent 96%+ across all academic years",
    gradeX: {
      score: "99.4%",
      exam: "CBSE Grade X Secondary Examinations",
      yearAsWritten: "2025–26",
      needsConfirmation: true, // odd label for a Grade X exam; confirm the year
      org: "cbse",
      extras: ["School Topper", "50% School Merit Scholarship"],
    },
    honours: [
      "Current School Topper in Grade 11 Commerce.",
      "Awarded the Scholar Badge every year from 2021 onwards, the school's highest academic recognition, without a single exception across six consecutive years.",
      "Elected to the Student Council's Environment Committee in 2025 and re-elected in 2026.",
      "Received a letter of recommendation from the Principal.",
    ],
  },

  // ── Experience and fellowships (resume order) ──
  experience: [
    {
      title: "SRCC FIC Finance Research Fellowship",
      organisation: "Shri Ram College of Commerce — Finance and Investment Cell (FIC)",
      org: "srcc",
      period: "Date not stated",
      points: [
        "Selected from 2,000 candidates into a cohort of 100.",
        "Attended finance sessions on topics including derivatives, fixed income markets, financial engineering and valuations.",
        "Visited the SRCC campus as part of the fellowship.",
      ],
    },
    {
      title: "Intern",
      organisation: "Fortis Adayu Hospital",
      org: "fortis",
      period: "May – June 2026",
      points: ["Researched psychology and how it intersects with areas of personal interest, particularly finance."],
    },
    {
      title: "Student Intern",
      organisation: "Mahak Plastic Industries & RD Polypack",
      period: "March – April 2026",
      points: [
        "Completed a one-month structured immersion in an industrial manufacturing environment, observing end-to-end operations across production, logistics and management.",
        "Independently authored a detailed factory visit report and conducted an industry-wide statistical analysis, producing original, data-backed research.",
      ],
    },
    {
      title: "NGO Internship",
      organisation: "We Care Foundation",
      org: "weCare",
      period: "2025",
      points: ["Educated 50+ students across 2025, providing lessons in Mathematics, English, finance and civic sense."],
    },
  ] as Role[],

  // ── Leadership and positions of responsibility ──
  leadership: [
    {
      title: "Green Captain",
      organisation: "My School for Earth, by the University of Melbourne",
      org: "melbourne",
      period: "2026",
      points: [
        "Led his school as Green Captain for this environmental platform, recruiting 100+ students and spearheading 5+ environmental initiatives including cleanup drives, recycling and awareness campaigns.",
      ],
      // Not stated whether the programme is run by the University or a platform it supports.
      // Do not imply any affiliation with the University of Melbourne.
    },
    {
      title: "Environment Committee (elected)",
      organisation: "Student Council, Lotus Valley International School",
      org: "lotusValley",
      period: "Elected 2025, re-elected 2026",
      points: ["Elected to the Student Council's Environment Committee in 2025 and re-elected in 2026."],
    },
    {
      title: "Chairperson, ECOSOC",
      organisation: "Lotus Valley's MUN Club",
      org: "lotusValley",
      period: "Date not stated",
      points: ["Chairperson, ECOSOC, at Lotus Valley's MUN Club."],
      needsConfirmation: true,
      confirmationNote: "Resume says only \"Chairperson, ECOSOC\" under Lotus Valley's MUN Club. Date not stated.",
    },
    {
      title: "Student Coordinator, commerce competitions",
      organisation: "Rasmanjari Interschool Competition 2026",
      org: "lotusValley",
      period: "2026",
      // Minimal factual version. The source text is a rough draft.
      points: [
        "Rasmanjari is described as his school's flagship interschool competition, with 30+ schools and 700+ participants.",
        "He was student coordinator for the commerce competitions and also compered.",
      ],
      needsConfirmation: true,
      confirmationNote:
        "The resume text is an unpolished draft (\"My schools flagship competition with 30+ schools 700+ participants i was the student coordinator for commerce competitions wasd dthe first point of support and planning for those competitions and all did compering\"). Only the certain parts are kept here. Ahaan should rewrite and confirm, including whether Rasmanjari is a Lotus Valley event.",
    },
  ] as Role[],

  // ── Model UN, parliamentary debate and public speaking ──
  mun: {
    summary: {
      conferences: "20+",
      awards: "19+",
      line: "20+ prestigious conferences · 19+ awards · Demonstrated proficiency in International Relations and debate",
      note: "The resume's own summary line. The awards table below lists 16 rows; what \"19+\" counts is to be confirmed.",
    },
    executiveBoard: [
      { conference: "IITD MUN 2026", location: "IIT Delhi", org: "iitDelhi", role: "Rapporteur, promoted to Vice Chair", committee: "WHO", year: 2026 },
      { conference: "AIKYAM MUN 2026", role: "Vice Chairperson", committee: "UNESCO", year: 2026 },
      { conference: "Lotus Valley's MUN Club", role: "Chairperson", committee: "ECOSOC", year: null as number | null },
    ],
    parliamentary: [
      { name: "PRS Student Parliament 2026", org: "prs", result: "Qualified for North India Regionals", year: 2026 },
      { name: "National Youth Parliament Scheme", body: "Ministry of Parliamentary Affairs", result: null as string | null, year: 2025 },
    ],
    /** All 16 rows, in resume order. Lotus Sansad and DAV Sansad are parliamentary events, not MUNs. */
    awards: [
      { conference: "SHISMUN", committee: "AAIB", award: "Best Delegate", level: "Best Delegate", year: 2026 },
      { conference: "Eurivox MUN", committee: "UNGA", award: "Best Delegate", level: "Best Delegate", year: 2026 },
      { conference: "SHISMUN", conferenceFull: "Scottish High International School", committee: "CCC", committeeFull: "Crisis Committee", award: "Best Delegate", level: "Best Delegate", year: 2025 },
      { conference: "GUMUN", conferenceFull: "Gurugram University MUN", committee: "FIA", award: "Best Delegate", level: "Best Delegate", year: 2025 },
      { conference: "Online Youth Summit", committee: "UNSC", award: "Best Delegate", level: "Best Delegate", year: 2025 },
      { conference: "LVISMUN", committee: "UNGA", award: "High Commendation", level: "High Commendation", year: 2026 },
      { conference: "PRASHTA MUN", committee: "UNGA", award: "Best Delegate", level: "Best Delegate", year: 2024 },
      { conference: "ASBBS MUN", committee: "UNHRC", award: "High Commendation", level: "High Commendation", year: 2024 },
      { conference: "AIKYAM MUN", committee: "AIPPM", award: "High Commendation", level: "High Commendation", year: 2023 },
      { conference: "Lotus MUN", committee: "UNGA", award: "High Commendation", level: "High Commendation", year: 2023 },
      { conference: "Lotus Sansad", committee: "Rajya Sabha", award: "Runner Up", level: "Runner Up", year: 2025 },
      { conference: "Aurelia DPSIMUN", committee: "FIA", award: "Special Mention", level: "Special Mention", year: 2025 },
      { conference: "DAV Sansad", committee: "AIPPM", award: "Special Mention", level: "Special Mention", year: 2024 },
      { conference: "BBIMUN", conferenceFull: "Blue Bells International MUN", committee: "UNSC", award: "Honourable Mention", level: "Honourable Mention", year: 2025 },
      { conference: "BBIMUN", conferenceFull: "Blue Bells International MUN", committee: "UNODC", award: "Honourable Mention", level: "Honourable Mention", year: 2024 },
      { conference: "SHISMUN", committee: "FIA", award: "Verbal Mention", level: "Verbal Mention", year: 2024 },
    ] as MunAward[],
    /** Which skills line the resume attaches to this section. */
    proficiency: "Demonstrated proficiency in International Relations and debate",
  },

  // ── Competitions (finance, quiz, academic, pitch) ──
  competitions: [
    {
      name: "National Finance Olympiad",
      year: "2025",
      domain: "finance",
      org: "nfo",
      results: [
        "Round 1: All India Rank 10.",
        "Round 2 (Nationals): All India Rank 54 out of 10,000+ participants; Certificate of National Excellence.",
      ],
    },
    {
      name: "SRCC Finance Olympiad",
      year: "2025",
      domain: "finance",
      org: "srcc",
      results: ["All India Rank 46."],
    },
    {
      name: "SHISFEST — Vision To Venture",
      year: "2026",
      domain: "pitch",
      results: ["First Position."],
    },
    {
      name: "Wharton Global High School Investment Competition",
      year: "Ongoing",
      ongoing: true,
      domain: "finance",
      org: "wharton",
      results: ["Currently participating."],
      details: {
        team: ph("Team — to be written by Ahaan."),
        role: ph("Role — to be written by Ahaan."),
        approach: ph("Strategy and approach — to be written by Ahaan."),
        status: ph("Current stage and status — to be written by Ahaan."),
      },
    },
    {
      name: "GIC GITAM Pitch Competition",
      year: "Ongoing",
      ongoing: true,
      domain: "pitch",
      org: "gitam",
      results: ["Currently participating."],
      details: {
        details: ph("Competition details — to be written by Ahaan."),
      },
      note: "\"GIC\" is not expanded in the resume.",
    },
    {
      name: "SHRITEQ Tech Quiz",
      year: "2026",
      domain: "quiz",
      results: ["4th place in the finals, out of 45 teams.", "Hosted by Rajiv Makhni."],
      note: "Whether 45 is the overall or finals field is not stated. The host is named as a fact, not an endorsement.",
    },
    {
      name: "SOF International English Olympiad",
      year: "2018 – 2024",
      domain: "academic",
      org: "sof",
      results: ["6 awards across multiple years, demonstrating sustained excellence in English (97+ percentile each year)."],
    },
    {
      name: "SOF International Mathematics & General Knowledge Olympiads",
      year: "Year not stated",
      domain: "academic",
      org: "sof",
      results: ["95+ percentile with Distinction awards."],
    },
    {
      name: "HCL JigSaw 5",
      year: "Year not stated",
      domain: "quiz",
      org: "hcl",
      results: ["89 percentile."],
    },
    {
      name: "Quiz to Conquer, by Fateh Education (Kamani Auditorium)",
      year: "Year not stated",
      domain: "quiz",
      org: "fateh",
      results: ["Reached the semi-finals."],
    },
  ] as Competition[],

  /** Participation only. The resume's phrase "with distinctions" is not attached to any single item. */
  otherCompetitions: [
    "Monash University Change It Challenge",
    "Indian Army Quiz",
    "SRCC English Olympiad",
    "Experience Japan Essay Writing",
    "Vishwaroop Quiz",
    "National Paryavaran Competition",
    "American Math Olympiad",
    "Singapore Math Challenge",
    "DPSI CAS Summit",
    "RPS Pivot Quiz",
  ],
  otherCompetitionsNote:
    "The resume adds \"and other national-level competitions, with distinctions\". It does not say which entries earned distinctions, so none is claimed here.",

  // ── Courses and certifications ──
  courses: [
    {
      title: "Fundamentals of Aerospace",
      provider: "IIT Madras Certification",
      org: "iitMadras",
      year: 2025,
      detail:
        "Completed an 8-week course on introductory aerospace concepts, earning a Completion Certificate and a Certificate for Exemplary Performance in the take-home project.",
    },
    {
      title: "Introduction to Law",
      provider: "IIT Madras Certification",
      org: "iitMadras",
      year: 2026,
      detail:
        "Completed an 8-week course on introductory legal concepts, earning a Completion Certificate and a Certificate for Exemplary Performance in the take-home project.",
    },
    {
      title: "Lotus Young Leaders Summit — \"Harnessing Your Inner Power\"",
      provider: "Workshop led by Shefali Singh, CEO, Wellness Essentials",
      org: "lotusValley",
      year: 2025,
      detail:
        "Selected to attend a leadership development summit; participated in a session on mindset, personal power and performance.",
    },
  ],

  // ── Projects ──
  projects: [
    {
      id: "artha",
      name: "Artha",
      year: "Year not stated",
      /** Client message: he built this finance website as a portfolio project. */
      url: "https://artha-finance.netlify.app",
      /** Taken from the live site's own title and meta description, attributed. */
      siteDescriptor: {
        title: "Artha — Finance workbench",
        text: "A finance workbench for learning, researching stocks and building portfolios. India first, global second.",
        attribution: "From the Artha website's own title and meta description. The site says \"Made by Ahaan Gupta\".",
        sections: ["Markets", "Portfolio", "Valuation", "Plan", "Learn"],
      },
      description: ph("Artha, in Ahaan's own words — to be written by Ahaan."),
    },
    {
      id: "wharton",
      name: "Wharton Global High School Investment Competition",
      year: "Ongoing",
      ongoing: true,
      org: "wharton",
      // Client message confirms participation. Details are placeholders.
      description: ph("Competition details (team, role, approach, status) — to be written by Ahaan."),
    },
  ],

  // ── Skills (as listed on the resume) ──
  skills: ["Public Speaking & Debate", "Leadership & Coordination", "Research & Drafting", "Digital Tools"],

  // ── Interests ──
  // Interests are interests, not qualifications. Evidence lists related resume
  // facts only. An empty list means the resume has no related fact.
  interests: [
    {
      id: "finance",
      name: "Finance and economics",
      statedIn: ["resume", "client message"],
      evidence: [
        { text: "Resume profile: \"Interested in the fields of civil aviation and finance.\"", source: "resume" },
        { text: "SRCC FIC Finance Research Fellowship (selected from 2,000 candidates into a cohort of 100).", source: "resume" },
        { text: "National Finance Olympiad 2025: All India Rank 54 (Nationals) out of 10,000+ participants.", source: "resume" },
        { text: "SRCC Finance Olympiad 2025: All India Rank 46.", source: "resume" },
        { text: "SHISFEST, Vision To Venture 2026: First Position.", source: "resume" },
        { text: "Taking part in the Wharton Global High School Investment Competition (ongoing).", source: "client message" },
        { text: "Built Artha, a finance website, as a portfolio project.", source: "client message" },
      ],
      description: ph("Finance and economics — a line in Ahaan's own words."),
    },
    {
      id: "aviation",
      name: "Aviation",
      statedIn: ["resume", "client message"],
      evidence: [
        { text: "Resume profile: \"Interested in the fields of civil aviation and finance.\"", source: "resume" },
        { text: "IIT Madras Certification, Fundamentals of Aerospace (2025): completion certificate and Certificate for Exemplary Performance in the take-home project.", source: "resume" },
      ],
      description: ph("Aviation — a line in Ahaan's own words."),
    },
    {
      id: "law",
      name: "Law",
      statedIn: ["client message"],
      evidence: [
        { text: "IIT Madras Certification, Introduction to Law (2026): completion certificate and Certificate for Exemplary Performance in the take-home project.", source: "resume" },
      ],
      description: ph("Law — a line in Ahaan's own words."),
    },
    {
      id: "quizzing",
      name: "Quizzing and general knowledge",
      statedIn: ["client message"],
      evidence: [
        { text: "SHRITEQ Tech Quiz 2026: 4th place in the finals, out of 45 teams.", source: "resume" },
        { text: "Quiz to Conquer by Fateh Education: reached the semi-finals.", source: "resume" },
        { text: "SOF International General Knowledge Olympiad: 95+ percentile with Distinction awards (combined with Mathematics).", source: "resume" },
        { text: "Also participated in the Indian Army Quiz, Vishwaroop Quiz and RPS Pivot Quiz.", source: "resume" },
      ],
      description: ph("Quizzing and general knowledge — a line in Ahaan's own words."),
    },
    {
      id: "motorsport",
      name: "Formula 1 and motorsport",
      statedIn: ["resume", "client message"], // resume lists Formula 1 under Interests
      evidence: [],
      statedLine: "Listed under Interests on the resume.",
      description: ph("Formula 1 and motorsport — a line in Ahaan's own words."),
    },
    {
      id: "mun",
      name: "Model UN, international relations and geopolitics",
      statedIn: ["client message"],
      evidence: [
        { text: "20+ prestigious conferences · 19+ awards (resume summary).", source: "resume" },
        { text: "16 delegate awards listed, including 6 Best Delegate.", source: "resume" },
        { text: "Executive Board roles: IITD MUN 2026 (Rapporteur, promoted to Vice Chair, WHO), AIKYAM MUN 2026 (Vice Chairperson, UNESCO), Lotus Valley's MUN Club (Chairperson, ECOSOC).", source: "resume" },
        { text: "PRS Student Parliament 2026: qualified for North India Regionals.", source: "resume" },
        { text: "National Youth Parliament Scheme, Ministry of Parliamentary Affairs (2025).", source: "resume" },
      ],
      description: ph("Model UN, international relations and geopolitics — a line in Ahaan's own words."),
    },
    {
      id: "reading",
      name: "Reading",
      statedIn: ["resume", "client message"],
      evidence: [
        { text: "Avid reader: over 400 books read across fiction, non-fiction and philosophy.", source: "resume" },
      ],
      description: ph("Reading — a line in Ahaan's own words."),
    },
    {
      id: "tennis",
      name: "Tennis",
      statedIn: ["resume", "client message"],
      evidence: [],
      statedLine: "Listed under Interests on the resume.",
      description: ph("Tennis — a line in Ahaan's own words."),
    },
  ] as Interest[],

  // ── Social links (none supplied) ──
  social: [
    { id: "linkedin", label: "LinkedIn", url: null as string | null, placeholder: true },
    { id: "github", label: "GitHub", url: null as string | null, placeholder: true },
    { id: "instagram", label: "Instagram", url: null as string | null, placeholder: true },
  ],
  socialNote: ph("Social links — to be supplied by Ahaan. Leave a link empty to hide it."),

  // ── Contact ──
  contact: {
    email: "thisisahaan@gmail.com",
    resumeFile: "/Ahaan-Gupta-Resume.pdf",
    referencesLine: "References available on request.",
    prompt: ph("Contact invitation — to be written by Ahaan."),
  },

  // ── Achievement timeline ──
  // Dated facts only, 2013 → 2026. Undated items (SRCC FIC fellowship, MUN Club
  // chairpersonship, HCL JigSaw 5, Quiz to Conquer, SOF Maths/GK) and "ongoing"
  // items are left out on purpose. The Grade X result is also left out because
  // its year is unconfirmed.
  timeline: [
    { year: 2013, yearLabel: "2013", title: "Joins Lotus Valley International School", detail: "Begins at Lotus Valley International School, Gurugram, where he is now in Grade 11 (Commerce).", category: "school", org: "lotusValley" },
    { year: 2018, yearLabel: "2018 – 2024", title: "SOF International English Olympiad", detail: "6 awards across multiple years, 97+ percentile each year.", category: "academic", org: "sof", span: { from: 2018, to: 2024, style: "rule" } },
    { year: 2021, yearLabel: "2021 onwards", title: "Scholar Badge", detail: "Awarded the school's highest academic recognition every year from 2021 onwards, across six consecutive years.", category: "academic", org: "lotusValley", span: { from: 2021, to: 2026, style: "rings" } },
    { year: 2023, title: "First MUN awards", detail: "High Commendation: AIKYAM MUN (AIPPM) and Lotus MUN (UNGA).", category: "mun" },
    { year: 2024, title: "Five delegate awards", detail: "Best Delegate at PRASHTA MUN (UNGA). High Commendation at ASBBS MUN (UNHRC). Special Mention at DAV Sansad (AIPPM). Honourable Mention at BBIMUN (UNODC). Verbal Mention at SHISMUN (FIA).", category: "mun" },
    { year: 2025, title: "Six delegate awards", detail: "Best Delegate at SHISMUN (CCC), GUMUN (FIA) and Online Youth Summit (UNSC). Runner Up at Lotus Sansad (Rajya Sabha). Special Mention at Aurelia DPSIMUN (FIA). Honourable Mention at BBIMUN (UNSC).", category: "mun" },
    { year: 2025, title: "National Finance Olympiad", detail: "Round 1: All India Rank 10. Round 2 (Nationals): All India Rank 54 out of 10,000+ participants; Certificate of National Excellence.", category: "finance" },
    { year: 2025, title: "SRCC Finance Olympiad", detail: "All India Rank 46.", category: "finance", org: "srcc" },
    { year: 2025, title: "National Youth Parliament Scheme", detail: "Ministry of Parliamentary Affairs.", category: "parliament" },
    { year: 2025, title: "Student Council: Environment Committee", detail: "Elected to the Student Council's Environment Committee.", category: "leadership", org: "lotusValley" },
    { year: 2025, title: "NGO internship, We Care Foundation", detail: "Educated 50+ students across 2025 in Mathematics, English, finance and civic sense.", category: "internship" },
    { year: 2025, title: "IIT Madras: Fundamentals of Aerospace", detail: "8-week course. Completion Certificate and Certificate for Exemplary Performance in the take-home project.", category: "course", org: "iitMadras" },
    { year: 2025, title: "Lotus Young Leaders Summit", detail: "Selected to attend; workshop \"Harnessing Your Inner Power\".", category: "course", org: "lotusValley" },
    { year: 2026, title: "Three delegate awards", detail: "Best Delegate at SHISMUN (AAIB) and Eurivox MUN (UNGA). High Commendation at LVISMUN (UNGA).", category: "mun" },
    { year: 2026, title: "Executive Board roles", detail: "IITD MUN 2026: Rapporteur, promoted to Vice Chair (WHO). AIKYAM MUN 2026: Vice Chairperson (UNESCO).", category: "mun" },
    { year: 2026, title: "PRS Student Parliament", detail: "Qualified for North India Regionals.", category: "parliament" },
    { year: 2026, title: "SHISFEST: Vision To Venture", detail: "First Position.", category: "pitch" },
    { year: 2026, title: "SHRITEQ Tech Quiz", detail: "4th place in the finals, out of 45 teams.", category: "quiz" },
    { year: 2026, title: "Student Council: re-elected", detail: "Re-elected to the Environment Committee.", category: "leadership", org: "lotusValley" },
    { year: 2026, title: "Green Captain", detail: "My School for Earth. Recruited 100+ students and spearheaded 5+ environmental initiatives.", category: "leadership" },
    { year: 2026, title: "Rasmanjari Interschool Competition", detail: "Student coordinator for the commerce competitions; also compered.", category: "leadership" },
    { year: 2026, title: "Student intern, Mahak Plastic Industries & RD Polypack", detail: "March – April. One-month industrial immersion; authored a factory visit report and an industry-wide statistical analysis.", category: "internship" },
    { year: 2026, title: "Intern, Fortis Adayu Hospital", detail: "May – June. Researched psychology and how it intersects with finance.", category: "internship" },
    { year: 2026, title: "IIT Madras: Introduction to Law", detail: "8-week course. Completion Certificate and Certificate for Exemplary Performance in the take-home project.", category: "course", org: "iitMadras" },
  ] as TimelineEvent[],

  // ── Quiz (Quizzing chapter) ──
  // Six general-knowledge questions, one per subject. Each fact was checked
  // against the source page named here; see content/research/facts.md section 12.
  // To change a question: edit `question`, the four `options`, `answerIndex`
  // (0 = first option, 3 = last), the one-sentence `explanation` and the `source`.
  quiz: {
    questions: [
      {
        id: "q-finance",
        subject: "finance",
        question: "In which year was the Reserve Bank of India established?",
        options: ["1921", "1935", "1947", "1956"],
        answerIndex: 1,
        explanation: "The Reserve Bank of India was established on 1 April 1935 under the Reserve Bank of India Act, 1934.",
        source: { label: "Reserve Bank of India, About Us", url: "https://www.rbi.org.in/Scripts/AboutusDisplay.aspx" },
      },
      {
        id: "q-aviation",
        subject: "aviation",
        question: "In which year did the Wright brothers make the first flights of their powered Flyer?",
        options: ["1896", "1909", "1903", "1914"],
        answerIndex: 2,
        explanation: "The first flights of the Wright Flyer took place on 17 December 1903.",
        source: { label: "US National Park Service, 1903: The First Flight", url: "https://www.nps.gov/wrbr/learn/historyculture/thefirstflight.htm" },
      },
      {
        id: "q-law",
        subject: "law",
        question: "What name is given to the first ten amendments to the Constitution of the United States, ratified in 1791?",
        options: ["The Declaration of Independence", "The Articles of Confederation", "Magna Carta", "The Bill of Rights"],
        answerIndex: 3,
        explanation: "The ten amendments ratified in 1791 became known as the Bill of Rights.",
        source: { label: "US National Archives, Bill of Rights (1791)", url: "https://www.archives.gov/milestone-documents/bill-of-rights" },
      },
      {
        id: "q-motorsport",
        subject: "motorsport",
        question: "Which circuit hosted the first race of the Formula 1 World Championship, in May 1950?",
        options: ["Silverstone", "Monza", "Spa-Francorchamps", "Circuit de Monaco"],
        answerIndex: 0,
        explanation: "The 1950 season opened with the British Grand Prix at Silverstone on 13 May.",
        source: { label: "Formula 1, 1950 British Grand Prix result", url: "https://www.formula1.com/en/results/1950/races/94/great-britain/race-result" },
      },
      {
        id: "q-geopolitics",
        subject: "mun",
        question: "In which city was the Charter of the United Nations signed in 1945?",
        options: ["New York", "London", "San Francisco", "Geneva"],
        answerIndex: 2,
        explanation: "The UN Charter was signed in San Francisco on 26 June 1945.",
        source: { label: "US National Archives, Charter of the United Nations (1945)", url: "https://www.archives.gov/milestone-documents/united-nations-charter" },
      },
      {
        id: "q-reading",
        subject: "reading",
        question: "Who wrote the novel Nineteen Eighty-Four, published in 1949?",
        options: ["Aldous Huxley", "George Orwell", "Evelyn Waugh", "Graham Greene"],
        answerIndex: 1,
        explanation: "Nineteen Eighty-Four, published in 1949, is by George Orwell.",
        source: { label: "The Orwell Foundation, Nineteen Eighty-Four", url: "https://www.orwellfoundation.com/the-orwell-foundation/orwell/books-by-orwell/nineteen-eighty-four/" },
      },
    ] as QuizQuestion[],
  },

  // ── Interface strings ──
  // Every word the interface prints that is not Ahaan's record lives here,
  // grouped by where it appears. Where the design system gives exact wording
  // it is used exactly. Tokens in {braces} (for example {n}) are filled in by
  // the site; leave them in place when editing.
  ui: {
    skipLink: "Skip to content",

    // ── Version 2 interface words ──
    /** Page names, used in the board, the home destinations, the page transition and page titles. */
    pages: {
      home: "Home",
      finance: "Finance",
      modelUn: "Model UN",
      academics: "Academics",
      leadership: "Leadership",
      contact: "Contact",
    },
    /** The board: the persistent navigation. */
    board: {
      label: "Main",
      homeLink: "Ahaan Gupta, home",
      menu: "Menu",
      close: "Close menu",
      resume: "Download resume",
      resumeNote: "PDF",
    },
    home: {
      destinationsLabel: "Sections",
      replay: "Replay the intro",
      /** Short context beside each figure on the home destinations. Restates `stats`; adds no facts. */
      figureNotes: {
        nfo: "National Finance Olympiad 2025",
        delegateAwards: "Delegate awards",
        gradeX: "CBSE Grade X",
        books: "Books read",
      } as Record<string, string>,
    },
    /** Finance page (version 2). Figures restate `stats`, `competitions` and `experience`; nothing new. */
    finance: {
      fieldHeading: "The field",
      fieldIntro: "Each point is one participant. Scroll, swipe or choose a result.",
      stepsLabel: "Results",
      previous: "Previous result",
      next: "Next result",
      /** The four results, in the order the field plays them. `scale` states how the points are drawn. */
      steps: {
        nfo: {
          figure: "AIR 54",
          pool: "10,000+",
          scale: "10,000+ participants, drawn as 10,000",
          scalePhone: "10,000+ participants, drawn as 1,000: one point for every 10",
        },
        fellowship: {
          figure: "100 of 2,000",
          scale: "2,000 candidates, drawn as 2,000; the 100 selected stay lit",
          scalePhone: "2,000 candidates, drawn as 200: one point for every 10",
        },
        srcc: { figure: "AIR 46", scale: "Field size not stated, so only the rank is drawn" },
        shisfest: { figure: "1st", scale: "Field size not stated, so only the position is drawn" },
      },
      /** Pointer readout over the field. */
      readoutRank: "{n}{suffix} of {total}",
      readoutPlace: "{n}{suffix}",
      readoutBin: "{from} to {to} of {total}",
      rankTop: "1",
      inProgressHeading: "In progress",
      recordHeading: "Finance and pitch competitions",
    },
    /** Model UN page (version 2). */
    modelUn: {
      /** Computed from `mun.awards`: {n} rows, {best} of them Best Delegate. */
      headline: "{n} delegate awards, {best} Best Delegate",
      chamberLabel: "The chamber: one placard for each award, Executive Board role and parliamentary programme",
      hint: "Drag to look around. Hover or tap a placard.",
      hintPlan: "Tap a seat.",
      filtersLabel: "Filter the placards",
      all: "All",
      byYear: "By year",
      byAward: "By award",
      shown: "{n} of {total} lit",
      floor: "Delegate awards",
      dais: "Executive Board",
      bench: "Parliamentary programmes",
      close: "Close",
      docketHeading: "The record",
    },
    nav: {
      chaptersLabel: "Chapters",
      contents: "Contents",
      close: "Close",
      resume: "Resume",
      backToTop: "Back to top",
      downloadResume: "Download resume (PDF)",
    },

    /** The twelve chapters, in page order. `style` is how the title is set: roman for the record, italic for interests. */
    chapters: [
      { id: "about", title: "About", style: "roman" },
      { id: "academics", title: "Academic profile", note: "2013 – present", style: "roman" },
      { id: "timeline", title: "Timeline", note: "2013 – 2026", style: "roman" },
      { id: "mun", title: "Model UN and public speaking", note: "2023 – 2026", style: "roman" },
      { id: "leadership", title: "Leadership and experience", note: "2025 – 2026", style: "roman" },
      { id: "competitions", title: "Competitions and projects", note: "2018 – ongoing", style: "roman" },
      { id: "aviation", title: "Aviation", style: "italic" },
      { id: "motorsport", title: "Motorsport", style: "italic" },
      { id: "law", title: "Law", style: "italic" },
      { id: "quizzing", title: "Quizzing", style: "italic" },
      { id: "reading", title: "Reading", style: "italic" },
      { id: "contact", title: "Contact", style: "roman" },
    ] as { id: string; title: string; note?: string; style: "roman" | "italic" }[],

    /** Shown in place of any `ph()` text. The prompt text itself is never printed. */
    placeholder: {
      label: "In Ahaan's words, to come",
      slots: {
        biography: "Biography and personal statement",
        geopolitics: "Model UN and geopolitics",
        finance: "Finance and economics",
        artha: "Artha",
        wharton: "Team, role, approach and status",
        gitam: "Competition details",
        aviation: "Aviation",
        motorsport: "Formula 1 and motorsport",
        quizzing: "Quizzing and general knowledge",
        reading: "Reading",
        tennis: "Tennis",
      },
    },

    about: {
      profileNote: "Profile, as written on the resume",
      skillsHeading: "Skills listed on the resume",
    },

    academics: {
      coursesHeading: "Courses and certifications",
      columns: { year: "Year", course: "Course", provider: "Provider", detail: "Detail" },
      /** Version 2: the tape (set piece). Values are read from `education`, `stats` and `timeline`. */
      tapeHeading: "The tape",
      tapeHint: "Scroll to climb. Drag the tape and it springs back.",
      tapeKeys: "Arrow keys nudge the tape.",
      /** Read by assistive technology in place of the drawn instrument. */
      tapeLabel: "Instrument tape settled on {figure}, {exam}. A bug marks the {floor} floor: {floorLabel}. Six marks for the Scholar Badge, {from} to {to}.",
      schoolHeading: "School record",
      honoursHeading: "Honours",
      sinceLabel: "At the school",
      competitionsHeading: "Academic and quiz competitions",
      olympiadsHeading: "Olympiads",
      quizResultsHeading: "Quiz results",
      quizHeading: "One question at a time",
      quizIntro: "Answer with a click or the keys A to D to see the explanation and its source.",
      sourceLabel: "Source",
      quizFinish: "See the result",
      moreCompetitions: "More competitions",
    },

    mun: {
      geopoliticsHeading: "Geopolitics",
      executiveBoardHeading: "Executive Board",
      awardsHeading: "Delegate awards",
      parliamentaryHeading: "Parliamentary programmes",
      columns: {
        conference: "Conference",
        role: "Role",
        committee: "Committee",
        award: "Award",
        year: "Year",
        programme: "Programme",
        bodyOrResult: "Body or result",
      },
      /** Tally strip: one text button per year; choosing a year filters the record. */
      tally: {
        groupLabel: "Awards by year",
        runningTotal: "{n} in all",
      },
      sort: {
        groupLabel: "Sort by",
        year: "Year",
        award: "Award",
        committee: "Committee",
        ascending: "ascending",
        descending: "descending",
        /** Group rows when the record is sorted: year -> "2026, 3 awards"; award and committee -> "Best Delegate, 6". */
        groupRowByYear: "{group}, {n} awards",
        groupRowByOther: "{group}, {n}",
        /** Count beside a group row's value (review 1, fix 9). */
        groupCountOne: "1 award",
        groupCountMany: "{n} awards",
      },
      placard: {
        rollLabel: "Committees",
        countOne: "1 award in the record",
        countMany: "{n} awards in the record",
        boardRole: "Executive Board: {role}",
      },
    },

    leadership: {
      positionsHeading: "Positions of responsibility",
      experienceHeading: "Experience and fellowships",
      columns: { period: "Period", role: "Role", points: "Details" },
      /** Version 2: the stints chart (set piece). Every dated entry of `timeline`, on lanes. */
      stintsHeading: "Stints",
      stintsIntro: "Every dated entry, 2013 to 2026, drawn at the precision the resume states. Drag the playhead, tap a bar or use the arrow keys.",
      stintsIntroPhone: "Every dated entry, 2013 to 2026. Swipe along the years and tap a bar.",
      lanes: {
        school: "School",
        courses: "Courses",
        mun: "Model UN and parliament",
        competitions: "Competitions",
        leadership: "Leadership",
        work: "Work and service",
      },
      legendYear: "Year stated",
      legendMonth: "Months stated",
      legendPresent: "To present",
      playheadLabel: "Timeline: choose an entry",
      earlier: "Earlier entry",
      later: "Later entry",
      entryCounter: "{n} of {total}",
      undatedHeading: "Not dated on the resume",
      ongoingHeading: "Ongoing",
      workHeading: "Work and service",
    },

    competitions: {
      financeHeading: "Finance",
      inProgressHeading: "In progress",
      ongoing: "Ongoing",
      furtherHeading: "Further competitions",
      alsoTookPart: "Also took part in",
      columns: { competition: "Competition", year: "Year", result: "Result" },
      /** Finance results table, in the order the design system names. `year` "Date not stated" is not printed. */
      financeRows: [
        { id: "nfo-round-1", figure: "AIR 10", name: "National Finance Olympiad", stage: "Round 1", year: "2025", results: ["All India Rank 10"], org: "nfo" },
        { id: "nfo-nationals", figure: "AIR 54", name: "National Finance Olympiad", stage: "Nationals", year: "2025", results: ["All India Rank 54 out of 10,000+ participants", "Certificate of National Excellence"], org: "nfo" },
        { id: "srcc-olympiad", figure: "AIR 46", name: "SRCC Finance Olympiad", year: "2025", results: ["All India Rank 46"], org: "srcc" },
        { id: "srcc-fic", figure: "100 of 2,000", name: "SRCC FIC Finance Research Fellowship", year: "Date not stated", results: ["Selected from 2,000 candidates into a cohort of 100"], org: "srcc" },
      ],
      /** Figure 3 (two fields). Only these four values are plotted. */
      financeFigure: {
        upper: { value: "54", note: "All India Rank 54, nationals", field: "10,000+ participants", caption: "National Finance Olympiad 2025" },
        lower: { value: "100", note: "cohort of 100", field: "2,000 candidates", caption: "SRCC FIC Finance Research Fellowship" },
        /** Pointer readout. Ordinal suffix by last digit rule is the component's job; suffixes live here. */
        readout: { place: "{n}{suffix} of {total}", snapUpper: "54th of 10,000+", snapLower: "100 of 2,000" },
        ordinalSuffixes: { one: "st", two: "nd", few: "rd", other: "th" },
      },
      artha: {
        heading: "Artha",
        descriptorNote: "From the Artha site's own description",
        visit: "Visit Artha",
        desktopAlt: "Home page of the Artha finance website, desktop view",
        mobileAlt: "Home page of the Artha finance website, mobile view",
      },
    },

    /** Figure labels. Compass marks and sector names are scales, not data. */
    figures: {
      globe: { desktop: ["60°N", "30°N", "0°", "30°S", "60°S"], phone: ["30°N", "0°", "30°S"] },
      route: {
        headingTape: ["N", "03", "06", "E", "12", "15", "S", "21", "24", "W", "30", "33"],
        headingTapePhone: ["N", "E", "S", "W"],
      },
      circuit: { sectors: ["Sector 1", "Sector 2", "Sector 3"] },
    },

    aviation: { evidenceHeading: "From the resume" },
    motorsport: {},
    law: {
      documentTitle: "Introduction to Law",
      documentSubtitle: "IIT Madras Certification, 2026", // from `courses`
      sideNote: "Source: resume",
    },

    quizzing: {
      evidenceHeading: "From the resume",
      questionCounter: "Question {n} of {total}",
      yourAnswer: "Your answer",
      correctAnswer: "Correct answer",
      next: "Next question",
      result: "{total} questions, {n} correct",
      startAgain: "Start again",
      /** Read out through the polite live region after a choice. */
      announce: "Your answer: {chosen}. Correct answer: {correct}.",
      optionLetters: ["A", "B", "C", "D"],
      /** The seven nodes of the constellation, in line order. `interest` links a node to quiz subjects. */
      nodes: [
        { id: "general", label: "General knowledge", interest: "quizzing" },
        { id: "finance", label: "Finance", interest: "finance" },
        { id: "aviation", label: "Aviation", interest: "aviation" },
        { id: "law", label: "Law", interest: "law" },
        { id: "motorsport", label: "Motorsport", interest: "motorsport" },
        { id: "geopolitics", label: "Geopolitics", interest: "mun" },
        { id: "reading", label: "Reading", interest: "reading" },
      ],
    },

    reading: { tennisHeading: "Tennis" },

    timeline: {
      /** Filters, one at a time. `categories` lists which event categories each one shows. */
      filters: [
        { id: "all", label: "All", categories: null as TimelineCategory[] | null },
        { id: "academics", label: "Academics", categories: ["school", "academic", "course"] as TimelineCategory[] },
        { id: "mun", label: "MUN and debate", categories: ["mun", "parliament"] as TimelineCategory[] },
        { id: "competitions", label: "Competitions", categories: ["finance", "quiz", "pitch"] as TimelineCategory[] },
        { id: "leadership", label: "Leadership and work", categories: ["leadership", "internship"] as TimelineCategory[] },
      ],
      filtersLabel: "Filter the timeline",
      inProgressHeading: "In progress",
      ongoing: "Ongoing",
    },

    contact: {
      copyEmail: "Copy email address",
      copied: "Copied",
      /** Version 2 contact page. */
      emailLabel: "Email",
      lensHint: "Move over the portrait to see the photograph. Click to redraw it.",
      lensHintTouch: "Drag across the portrait to see the photograph.",
      interestsHeading: "Interests",
      /** {value} and {n} come from `stats` (books). */
      booksDrawn: "{value} books, drawn as {n} spines",
    },

    footer: {
      left: "Ahaan Gupta, Gurugram",
      buildYear: 2026,
      centre: "Logos belong to their owners and show where an event took place.",
      backToTop: "Back to top",
      typeLine: "Set in Instrument Serif and Geist.",
    },
  },
};

export type Site = typeof site;
export default site;
