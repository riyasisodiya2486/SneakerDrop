# SneakerDrop

An independently curated sneaker release showcase built around a warm editorial palette, restrained typography, considered product photography, and a real Supabase-backed catalogue and waitlist.

> **Project status:** the local application is configured for Supabase. A public catalogue read verified three published products; `supabase/seed.sql` contains 15 products but its 12 additions have not been verified in the live database. Lint, TypeScript, tests, and the production build pass locally. No deployment is verified. This workspace has no Git metadata, and the saved Vercel CLI token is invalid.

## Build plan and requirements checklist

1. [x] Audit the repository and establish a design direction. The starting directory was empty and was not a Git repository.
2. [x] Create the responsive storefront shell, navigation, editorial homepage, product catalogue, detail view, and release waitlist entry points.
3. [x] Define PostgreSQL schema, seed data, access policies, administrator allowlisting, and a duplicate-safe waitlist function.
4. [x] Connect public product routes to Supabase and handle missing configuration, empty collections, and query failures.
5. [x] Add server-validated product-specific waitlist submissions and explicit consent.
6. [x] Add Supabase Auth login and server-side allowlist checks for admin pages and mutations.
7. [x] Add product create/edit/delete, availability/publication/waitlist controls, stats, and paginated waitlist review.
8. [x] Add responsive layouts, keyboard focus styles, image fallbacks, form feedback, and reduced-motion handling.
9. [x] Run type checking, linting, validation tests, and the production build. All pass in the current local workspace.
10. [x] Document environment setup, database provisioning, local startup, and deployment steps.

## Design direction

SneakerDrop treats releases as an independent editorial selection. Bone and ink form the base, a restrained lime marker indicates a live release, and serif italics provide contrast against compact labels and direct product information. The homepage moves from a typographic campaign cover into a staggered catalogue, a dark brand note, a featured release, and a product-specific email signup. It does not implement cart or checkout.

Product and campaign photography uses external image URLs. The configured Unsplash and Pinterest CDN URLs and Next.js image optimizer were verified to return images in the local environment. Follow each source's license terms and replace images with brand-owned or otherwise licensed assets before a commercial launch. The image component shows a designed fallback if a remote image fails.

## Features and routes

- `/` — campaign homepage, database-backed featured products, and per-product release updates.
- `/shop` — published catalogue with availability and category URL filters.
- `/products/[slug]` — database-backed product details and product-specific waitlist.
- `/admin/login` — Supabase email/password login, with an allowlist check.
- `/admin` — live product counts, product CRUD, and the newest waitlist submissions with paging.
- `POST /api/waitlist` — validated, consented, duplicate-safe product waitlist submission.
- `POST`, `PATCH`, `DELETE /api/admin/products` — privileged product mutations; each checks the authenticated user and allowlist, then relies on database RLS as a second authorization layer.
- `/api/admin/login`, `/api/admin/logout` — auth session operations.

## Screenshots

- Homepage desktop screenshot: pending capture.
- Catalogue mobile screenshot: pending capture.
- Admin dashboard screenshot: pending capture with an authorized account.

## Technology and structure

- Next.js App Router, React, TypeScript strict mode, Tailwind CSS 4, Supabase SSR/Auth/PostgreSQL, Zod, and Lucide icons.
- Motion uses CSS transitions/keyframes and a small Intersection Observer client utility. No animation package is added: the effects are limited to the hero, viewport reveals, and control feedback, and all reveal content remains visible without JavaScript or under reduced-motion preferences.
- Public product pages use server-side Supabase queries under the anonymous key and database RLS. Authenticated admin operations use the user's session; there is no service-role key in this application.
- `src/app` contains routes, API handlers, and global styles. `src/components` contains the shared public and admin interfaces. `src/lib` contains Supabase clients, authorization, data access, types, and validation. `supabase/migrations` and `supabase/seed.sql` are the reproducible database setup.

## Database setup and security

Apply `supabase/migrations/202610290001_initial_schema.sql` in the Supabase SQL Editor or with the Supabase CLI, then run `supabase/seed.sql`. The seed contains 15 distinct products and skips existing slugs so rerunning it will not overwrite catalog edits. To apply current image changes to existing database rows, run `supabase/update_product_images.sql` in the SQL Editor.

The migration creates:

- `products`: unique slug, non-negative `numeric(10,2)` price, image URL, category, availability, publication, waitlist eligibility, release code, and timestamps.
- `waitlist_entries`: normalized email, product association, consent timestamp, creation timestamp, and a unique `(former_product_id, email)` constraint. A deleted product sets the live FK to null but leaves the former UUID and consented signup record for history. This intentionally preserves waitlist records after a product is deleted.
- `administrator_allowlist`: Supabase user IDs. The user can read only their own allowlist membership; no client can grant itself administrator status.

RLS is enabled on all three tables. The public can select published products and cannot mutate them or read waitlist data. Authenticated administrators receive product CRUD and waitlist read access through `is_sneaker_admin()`, a security-definer helper that checks the private allowlist. Waitlist insert access is not granted to clients. The only public entry point is `join_waitlist()`, which validates consent and email shape, confirms a published and eligible product, normalizes the email, and inserts with conflict handling under the unique constraint. The application also validates inputs server-side and gives duplicate submissions a friendly response.

### Configure an administrator

1. Create a Supabase project and apply the migration and seed.
2. In Supabase Auth, create an administrator user with a strong password. Disable public user registration if it is not needed.
3. Copy that user's UUID from the Auth user list.
4. As the project owner, add the UUID through the SQL Editor: `insert into public.administrator_allowlist (user_id) values ('YOUR-AUTH-USER-UUID');`.
5. Visit `/admin/login` and sign in. A valid Auth account not on the allowlist is rejected and signed out.

Never expose a Supabase service-role/secret key in the browser. The app intentionally requires only the project URL and publishable/anon key.

## Local setup

Requirements: Node.js 22+ and npm.

```powershell
npm install
```

Create `.env.local` in the project root and set the real project values from Supabase Project Settings → API. `.env.example` documents the variable names; Next.js reads `.env.local` during local development and build.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

After applying the migration and seed, run:

```powershell
npm run dev
```

Without a configured Supabase project, public product pages show a setup message and the waitlist reports setup unavailable. No mocked catalogue or fake submission is returned.

## Waitlist behavior and limits

Email is trimmed and lowercased on the server and in the database function. A signup is scoped to a product and requires explicit consent for release updates. Database uniqueness and `ON CONFLICT DO NOTHING` handle concurrent duplicates. Unavailable products can accept signups when `waitlist_open` is true; admins can close signups independently. This project stores signups but does not send email. A shared rate-limit provider is not configured; add a managed rate limiter before exposing the endpoint to high-volume public traffic.

## Checks

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Validation unit tests cover email normalization, malformed waitlist data, consent, slug shape, and non-negative prices. Public catalogue reads and waitlist submissions were verified against Supabase. Successful admin sign-in and CRUD still require an available allowlisted administrator account. No automated browser viewport audit is configured.

## Deployment

1. Confirm the Supabase migration, desired product seed, and administrator allowlist are applied.
2. Connect this workspace to a GitHub repository you control. The current workspace has no Git metadata or configured remote.
3. Authenticate the Vercel CLI with `vercel login` (the saved token currently fails validation), or import the GitHub repository into Vercel.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for Preview and Production. The app also accepts the older `NEXT_PUBLIC_SUPABASE_ANON_KEY` name as a fallback.
5. Deploy, verify the public routes and authorized admin access, then add the verified URL to this document. No deployment has been performed or represented as live.

There is no `vercel.json` requirement for the standard Next.js deployment. No deployment has been performed or represented as live.

## Known limitations and future improvements

- No checkout, payments, cart, email delivery, image upload, or shared rate limiting.
- Product images are externally hosted; use owned/licensed campaign photography for a real brand launch.
- The admin editor accepts HTTPS image URLs from `images.unsplash.com` and `i.pinimg.com`; it does not upload or manage image files.
- Waitlist data is preserved on product deletion, including email and consent timestamp. Add an appropriate retention/deletion process before collecting real customer data.
- The admin workspace currently depends on browser confirmation for product deletion; replace with an accessible custom confirmation dialog if the admin workflow expands.
- Screenshot placeholders are omitted because no screenshots have been captured yet.
