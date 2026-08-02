# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Owner checklist (Source2BD)

**Daily**
- Open `/admin` → check today's usage, new accounts, recent searches.
- Watch for any account burning the full 30 searches every day.

**Limits**
- Every signed-in account gets **30 live lookups per day** (text + photo share one pot), reset at midnight Dhaka time.
- Cached results are free and never count.
- Reset someone's day from `/admin` → Reset quota.

**Pricing**
- Markup lives in `src/lib/products/pricing.ts` (`SOURCE_MARKUP`). Both the BDT price and the shown market price carry it.

**Keys**
- `ELIM_API_KEY` (1688/Taobao), `PARSE_API_KEY` (Alibaba/Amazon), `LOVABLE_API_KEY` (translation). Update them in Project Settings → Secrets.

**Health**
- `GET /api/public/health` returns `{ ok: true }`. Use it for uptime monitoring.

**SEO**
- Guides live in `src/lib/content/guides.ts`; adding one automatically adds it to `/guides` and `sitemap.xml`.
- `/auth`, `/account`, `/admin` are set to `noindex`.

**Contacts**
- WhatsApp 8801752457930 · Phone 01752-457930 · Chawkbazar, Dhaka · Sat–Thu 10:00–20:00 · legal goods only.
