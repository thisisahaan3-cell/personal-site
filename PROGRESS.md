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
- [ ] 0b. Verify each subagent actually runs and record which model ran
- [ ] 1. Content: `src/content/site.ts`, `content/research/facts.md` (content-researcher)
- [ ] 2. Three creative directions in `design/directions.md` (creative-director) with reference boards (visual-explorer)
- [ ] 3. Approved design system in `design/design-system.md` (creative-director)
- [ ] 4. Assets: portrait, logos with provenance in `content/research/assets.md`, redacted resume PDF in `public/`
- [ ] 5. Build the site (frontend-engineer)
- [ ] 6. Independent QA rounds (qa-reviewer), creative-director review, fixes, repeat
- [ ] 7. Deploy to Netlify, report the URL, disable the hourly scheduled task

## Notes for whoever resumes

(none yet)
