# Progress

Read this first when resuming after a restart or a usage-limit reset. Keep it current.

## Client decisions (15 Nov 2026)

- Netlify: approved. Create a NEW project (not artha-finance, suhanuaanu or resolvd) and deploy once QA passes.
- Contact: email only (thisisahaan@gmail.com). No phone number anywhere. Resume download is a redacted copy.
- Direction: present three directions, then build the creative director's recommendation without waiting.
- Agent Teams: keep off. Subagents only.
- When the usage limit runs out: stop and save. An hourly scheduled task ("Resume portfolio build") restarts the work. Disable it once the site is deployed.

## Phases

- [x] 0. Setup: Next.js 16 + TS + Tailwind v4, Motion, GSAP, Lenis, Lucide, Playwright 1.63.0, skills, SessionStart hook, CLAUDE.md, five subagent files
- [x] 0b. Verified each subagent runs (15 Nov): creative-director and visual-explorer on claude-fable-5-2, frontend-engineer on claude-opus-5-5, content-researcher and qa-reviewer on claude-sonnet-5-5 (from each run's `modelUsage`)
- [ ] 1. Content: `src/content/site.ts`, `content/research/facts.md` (content-researcher)
- [ ] 2. Three creative directions in `design/directions.md` (creative-director) with reference boards (visual-explorer)
- [ ] 3. Approved design system in `design/design-system.md` (creative-director)
- [ ] 4. Assets: portrait, logos with provenance in `content/research/assets.md`, redacted resume PDF in `public/`
- [ ] 5. Build the site (frontend-engineer)
- [ ] 6. Independent QA rounds (qa-reviewer), creative-director review, fixes, repeat
- [ ] 7. Deploy to Netlify, report the URL, disable the hourly scheduled task

## Notes for whoever resumes

- Invoking subagents: the Agent tool only sees `.claude/agents/` if the directory existed when the session process started. In the first session it did not, so agents were run headlessly with `scripts/agent.sh <agent> <prompt-file> <out.json>` (prints the report, the session id and the model that served it; `RESUME=<session-id>` continues an agent's conversation). After a restart, try the Agent tool with `subagent_type` first; use the script if the agent type is not found. Never edit `scripts/agent.sh` while a run is in progress.
- Run agents that build (`npm run build`) one at a time; they share `.next/` and `out/`.
- The site is a static export (`output: "export"` in next.config.ts; `cacheComponents` was removed because it cannot be combined with export). `npm run build` writes `out/`; `npm run start` serves it on :3000 with `serve`. Netlify publishes `out/` (see netlify.toml).
- Assets ready: `public/images/portrait.webp|jpg` (797x1060, border cropped; keep it under about 420 CSS px wide so it stays sharp), `public/images/artha-home.webp` (2880x1800) and `artha-home-mobile.webp`, `public/Ahaan-Gupta-Resume.pdf` (phone number redacted and verified absent).
- The GitHub repository is PUBLIC. Never commit `source-material/resume-original.pdf`.
- Open items for the client (do not block on them): the Rasmanjari paragraph in the resume is a rough draft with typos (it is also in the downloadable PDF); "19+ awards" versus 16 rows in the table; biography, interest descriptions, Wharton/GITAM details and social links are placeholders.
