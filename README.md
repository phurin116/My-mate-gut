# My Mate Gut

A platform that connects Bangkok university students with verified, beginner-friendly startup internships.

This is a working prototype that runs in **demo mode**: there is no backend, all data is sample data, and everything is stored in the browser's localStorage. No passwords or credentials are collected.

## Run it

```bash
npm install
npm run dev      # local development
npm run build    # type-check and build to dist/
npm run preview  # serve the production build
```

The build uses hash routing and a relative base path, so `dist/` can be hosted on any static host without rewrite rules.

## Put it online as "my-mate-gut"

The repository includes `netlify.toml`, so Netlify can build and host it with no extra settings.

1. Sign in at https://app.netlify.com with your GitHub account.
2. Choose **Add new site → Import an existing project → GitHub**, then pick `My-mate-gut`.
3. Set the branch to deploy (`main` after this work is merged, or `claude/vibrant-gates-6z9s64`) and click **Deploy**.
4. Open **Site configuration → Change site name** and enter `my-mate-gut`. The site is then at `https://my-mate-gut.netlify.app` if that name is free.

Every push to that branch redeploys the site automatically.

## Demo accounts

Open **Sign in** and pick one:

| Account | What you can do |
| --- | --- |
| Student | Recommendations with reasons, search, save, compare, apply, track applications, review a completed internship |
| Startup | Post and edit listings, review applicants, schedule interviews, make offers, confirm completion |
| University career office | Placement outcome report with CSV export |
| Verification team | Check companies and listings against the checklist, handle reports |

"Reset demo data" in the top bar restores the original sample data.

## Project structure

```
src/
  domain/      Types, taxonomies, matching rules, date and validation helpers (no React)
  data/        Seed data, localStorage store, selectors and actions (the future API boundary)
  i18n/        All interface text. English only for now, structured so Thai can be added
  components/  Shared UI: design-system components, cards, trust badges, timeline, layout
  pages/       One file per screen, grouped by role
  styles/      system.css (tokens and components) and app.css (layout and pages)
```

## How things work

- **Matching** is rule-based and transparent (`src/domain/matching.ts`). The percentage is points earned divided by points available across the criteria a student has filled in, and every criterion is shown to the student.
- **Verification** badges are always derived from a verification record (`src/data/selectors.ts`). A listing shows as verified only when both the listing and its company are verified. Editing a listing sends it back to pending.
- **Reviews** can only be created for an application the startup has marked as completed. No reviews are seeded.
- **Adding a backend**: replace `src/data/store.ts` and the function bodies in `src/data/actions.ts` with API calls. Components do not touch storage directly.
- **Adding Thai**: create `src/i18n/th/` with the same shape as `src/i18n/en/` and register it in `src/i18n/index.ts`.
