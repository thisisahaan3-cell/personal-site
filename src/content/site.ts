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
  | "parliament";

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

export type Stat = {
  value: string; // exact, with qualifiers: "20+", "99.4%"
  label: string;
  note?: string; // extra context or caveat shown small
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
  description: Editable;
};

export type TimelineEvent = {
  year: number;
  /** Shown instead of `year` when the fact spans a range. */
  yearLabel?: string;
  title: string;
  detail: string;
  category: TimelineCategory;
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
  lotusValley: { name: "Lotus Valley International School, Gurugram" },
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
  wharton: { name: "Wharton Global Youth Program" },
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
    portrait: "/portrait.webp", // set by the frontend when the portrait is processed
  },

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
    { value: "99.4%", label: "CBSE Grade X Secondary Examinations", note: "Resume dates this \"2025–26\"; year to be confirmed." },
    { value: "96%+", label: "Consistent across all academic years" },
    { value: "20+", label: "Prestigious MUN and debate conferences" },
    { value: "19+", label: "Awards (resume's own summary line)", note: "The awards table lists 16 delegate awards; what the 19+ counts is to be confirmed." },
    { value: "16", label: "Delegate awards listed in the table", note: "6 Best Delegate" },
    { value: "AIR 54", label: "National Finance Olympiad 2025, Nationals", note: "Out of 10,000+ participants. Round 1: AIR 10." },
    { value: "2,000 → 100", label: "SRCC FIC Finance Research Fellowship", note: "Selected from 2,000 candidates into a cohort of 100." },
    { value: "400+", label: "Books read", note: "Across fiction, non-fiction and philosophy." },
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
    { year: 2013, yearLabel: "2013", title: "Joins Lotus Valley International School", detail: "Begins at Lotus Valley International School, Gurugram, where he is now in Grade 11 (Commerce).", category: "school" },
    { year: 2018, yearLabel: "2018 – 2024", title: "SOF International English Olympiad", detail: "6 awards across multiple years, 97+ percentile each year.", category: "academic" },
    { year: 2021, yearLabel: "2021 onwards", title: "Scholar Badge", detail: "Awarded the school's highest academic recognition every year from 2021 onwards, across six consecutive years.", category: "academic" },
    { year: 2023, title: "First MUN awards", detail: "High Commendation: AIKYAM MUN (AIPPM) and Lotus MUN (UNGA).", category: "mun" },
    { year: 2024, title: "Five delegate awards", detail: "Best Delegate at PRASHTA MUN (UNGA). High Commendation at ASBBS MUN (UNHRC). Special Mention at DAV Sansad (AIPPM). Honourable Mention at BBIMUN (UNODC). Verbal Mention at SHISMUN (FIA).", category: "mun" },
    { year: 2025, title: "Six delegate awards", detail: "Best Delegate at SHISMUN (CCC), GUMUN (FIA) and Online Youth Summit (UNSC). Runner Up at Lotus Sansad (Rajya Sabha). Special Mention at Aurelia DPSIMUN (FIA). Honourable Mention at BBIMUN (UNSC).", category: "mun" },
    { year: 2025, title: "National Finance Olympiad", detail: "Round 1: All India Rank 10. Round 2 (Nationals): All India Rank 54 out of 10,000+ participants; Certificate of National Excellence.", category: "finance" },
    { year: 2025, title: "SRCC Finance Olympiad", detail: "All India Rank 46.", category: "finance" },
    { year: 2025, title: "National Youth Parliament Scheme", detail: "Ministry of Parliamentary Affairs.", category: "parliament" },
    { year: 2025, title: "Student Council: Environment Committee", detail: "Elected to the Student Council's Environment Committee.", category: "leadership" },
    { year: 2025, title: "NGO internship, We Care Foundation", detail: "Educated 50+ students across 2025 in Mathematics, English, finance and civic sense.", category: "internship" },
    { year: 2025, title: "IIT Madras: Fundamentals of Aerospace", detail: "8-week course. Completion Certificate and Certificate for Exemplary Performance in the take-home project.", category: "course" },
    { year: 2025, title: "Lotus Young Leaders Summit", detail: "Selected to attend; workshop \"Harnessing Your Inner Power\".", category: "course" },
    { year: 2026, title: "Three delegate awards", detail: "Best Delegate at SHISMUN (AAIB) and Eurivox MUN (UNGA). High Commendation at LVISMUN (UNGA).", category: "mun" },
    { year: 2026, title: "Executive Board roles", detail: "IITD MUN 2026: Rapporteur, promoted to Vice Chair (WHO). AIKYAM MUN 2026: Vice Chairperson (UNESCO).", category: "mun" },
    { year: 2026, title: "PRS Student Parliament", detail: "Qualified for North India Regionals.", category: "parliament" },
    { year: 2026, title: "SHISFEST: Vision To Venture", detail: "First Position.", category: "academic" },
    { year: 2026, title: "SHRITEQ Tech Quiz", detail: "4th place in the finals, out of 45 teams.", category: "quiz" },
    { year: 2026, title: "Student Council: re-elected", detail: "Re-elected to the Environment Committee.", category: "leadership" },
    { year: 2026, title: "Green Captain", detail: "My School for Earth. Recruited 100+ students and spearheaded 5+ environmental initiatives.", category: "leadership" },
    { year: 2026, title: "Rasmanjari Interschool Competition", detail: "Student coordinator for the commerce competitions; also compered.", category: "leadership" },
    { year: 2026, title: "Student intern, Mahak Plastic Industries & RD Polypack", detail: "March – April. One-month industrial immersion; authored a factory visit report and an industry-wide statistical analysis.", category: "internship" },
    { year: 2026, title: "Intern, Fortis Adayu Hospital", detail: "May – June. Researched psychology and how it intersects with finance.", category: "internship" },
    { year: 2026, title: "IIT Madras: Introduction to Law", detail: "8-week course. Completion Certificate and Certificate for Exemplary Performance in the take-home project.", category: "course" },
  ] as TimelineEvent[],
};

export type Site = typeof site;
export default site;
