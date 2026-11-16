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
- [x] 1. Content: `src/content/site.ts` (type-checks), `content/research/facts.md`, 7 logos with provenance in `content/research/assets.md`
- [x] 2. Three creative directions in `design/directions.md`: A Almanac, B Placard, C Meridian. Creative director recommends C, Meridian; client pre-authorised building the recommendation. Reference boards done: `design/explorations/01-almanac.html`, `02-placard.html`, `03-meridian.html` with screenshots in `shots/` (sent to the client)
- [x] 3. Approved design system: `design/design-system.md` (Meridian). Quiz questions and `site.ui` strings added to `src/content/site.ts`
- [x] 4. Assets: portrait, logos with provenance, Artha screenshots, redacted resume PDF in `public/` (still wanted: 5–7 verified quiz questions from the content researcher, once the design system says how many)
- [x] 5. Site built by the frontend-engineer (claude-opus-5-5) and pushed in five commits (443c29d..ca5aec7): all chapters, line system, timeline, quiz. Lint and static build pass. Its report lists 10 small deviations for the creative director to rule on
- [x] 6a. QA round 1 FAIL (3 major) → creative-director review (approved with changes) → fix round 1a → QA round 1b PASS (no blocker, no major; `qa/reports/2026-11-16-round-1b.md`)
- [ ] 6b. Fix round 1b: remaining creative-director items 4, 7–16, 18 in `design/reviews/2026-11-16-review-1.md`, plus QA minors N1 (Lotus Valley logo still on the opened Lotus Young Leaders Summit timeline entry) and N2 (at 1024 the placard is wider than the placeholder rules above it). Then QA round 2 and a redeploy
- [x] 7. DEPLOYED 16 Nov ~09:35 UTC: https://ahaan-gupta.netlify.app (project `ahaan-gupta`, siteId `36ccd93d-a2a8-4d47-9a9a-20715e27d896`). Production is public; team login applies to non-production previews only. Live check: 200, no console errors, no overflow, phone number absent, resume PDF served. To redeploy: call the Netlify MCP `deploy-site` with the siteId, then run the printed `npx @netlify/mcp` command with `NODE_USE_ENV_PROXY=1` (Node's fetch ignores the proxy otherwise), after temporarily moving `source-material/resume-original.pdf` out of the repo folder so it is never uploaded. Netlify injects a comment into <head>; `src/app/layout.tsx` strips it before hydration (do not remove that script). The 'Powered by Netlify' badge is Netlify's free-plan badge
- [ ] 8. After round 1b is deployed: disable the hourly scheduled task (trig_016goFaCBE8QyDnd36Sc4opk)

## Log

- 16 Nov 05:15 UTC: third usage limit hit as fix round 1 began (nothing changed). Reset 08:30. Resumed 08:38 with a FRESH frontend-engineer on fix round 1a (review items 1, 2, 3, 5, 6, 17 and phone sort buttons: the two QA majors plus quick items). Plan: narrow QA re-check of the majors → first deploy → round 1b (review items 4, 7–16, 18) → QA round 2 → redeploy. Lesson: resuming an agent with a 400k context is expensive; prefer fresh agents with tight briefs.

- 15 Nov ~23:05 UTC: second usage limit hit just as the engineer started; reset 03:30 UTC 16 Nov; engineer resumed 03:38 and finished the build ~04:17.
- 15 Nov 18:07 UTC: hit the 5-hour usage limit about 50 minutes in (Fable orchestrator plus two Fable agents in parallel is expensive). Resumed 22:38 UTC after the 21:50 reset. Both interrupted agents (creative-director writing `design/design-system.md`; visual-explorer drawing boards, Meridian first, A and B compact) were resumed with SendMessage.
- Budget rule from here: critical path first (design system → frontend build → QA → deploy). Keep briefs tight; avoid running more than two agents at once.

- Notes for the creative director's first screenshot review (from the visual explorer's Meridian board): the finance line returns to the meridian behind the Artha screenshot (needs approval); the hero portrait at 384px stops above the 900px fold; Night hairlines need two extra tokens; motorsport is thin on facts; some Stone sections have large empty areas.

## Notes for whoever resumes

- From about 18:00 UTC on 15 Nov the session's Agent tool DOES see the five project agents (`subagent_type: creative-director` etc.), so delegate natively; `scripts/agent.sh` remains as a fallback.
- Invoking subagents (fallback): the Agent tool only sees `.claude/agents/` if the directory existed when the session process started. In the first session it did not, so agents were run headlessly with `scripts/agent.sh <agent> <prompt-file> <out.json>` (prints the report, the session id and the model that served it; `RESUME=<session-id>` continues an agent's conversation). After a restart, try the Agent tool with `subagent_type` first; use the script if the agent type is not found. Never edit `scripts/agent.sh` while a run is in progress.
- Run agents that build (`npm run build`) one at a time; they share `.next/` and `out/`.
- The site is a static export (`output: "export"` in next.config.ts; `cacheComponents` was removed because it cannot be combined with export). `npm run build` writes `out/`; `npm run start` serves it on :3000 with `serve`. Netlify publishes `out/` (see netlify.toml).
- Assets ready: `public/images/portrait.webp|jpg` (797x1060, border cropped; keep it under about 420 CSS px wide so it stays sharp), `public/images/artha-home.webp` (2880x1800) and `artha-home-mobile.webp`, `public/Ahaan-Gupta-Resume.pdf` (phone number redacted and verified absent).
- The GitHub repository is PUBLIC. Never commit `source-material/resume-original.pdf`.
- Open items for the client (do not block on them): the Rasmanjari paragraph in the resume is a rough draft with typos (it is also in the downloadable PDF); "19+ awards" versus 16 rows in the table; biography, interest descriptions, Wharton/GITAM details and social links are placeholders.
