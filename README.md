This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Automated Backups

-   API endpoint: `GET /api/backup` returns the full snapshot used for the scheduled backups. Protect it with the `x-backup-token` header (or `?token=`) matching `BACKUP_TOKEN`. The response bundles projects with the related heuristics and players plus orphaned records (if any) and includes metadata with counts and the generation timestamp. It uses the fast GraphCMS endpoint configured in `NEXT_PUBLIC_GRAPHCMS_API_FAST`.
-   Environment: define `BACKUP_TOKEN` alongside the existing GraphCMS variables. Add it locally in `.env.local` and on the hosting platform (Vercel) so the endpoint can validate incoming requests.
-   GitHub Action: `.github/workflows/backup-email.yml` schedules six executions per day (02:00, 11:00, 14:00, 17:00, 20:00, 23:00 UTC — aligns with 08:00→23:00 BRT). Each run downloads the JSON, compresses it, and emails the ZIP via Gmail SMTP.
-   Required secrets in the repository settings: `BACKUP_ENDPOINT` (public URL of `/api/backup`), `BACKUP_TOKEN`, `MAIL_USERNAME` (Gmail address), `MAIL_PASSWORD` (app password), `MAIL_FROM`, and `MAIL_TO`. Optionally add `MAIL_CC` / `MAIL_BCC` if the action is extended.
-   Gmail specifics: enable 2FA on the account and generate an app password for SMTP. Gmail enforces ~25 MB attachment limits and ~500 emails/day on consumer accounts; the current schedule (six emails with ~500 KB ZIPs) stays well within those limits.
-   Manual run: trigger `Actions → Send Backup Email → Run workflow` to force an immediate backup (useful for verifying new secrets or when regenerating app passwords).
