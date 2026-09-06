# Rove

A cinematic black-and-gold landing page for Rove, a prelaunch care transportation concept beginning with recurring dialysis journeys in North Carolina.

## Development

Requires Node.js 22.13+ and pnpm.

```sh
pnpm install
pnpm dev
```

The development server prints its local URL. Production builds use Vinext/Vite and target Cloudflare Workers:

```sh
pnpm build
pnpm start
```

## Deploy to Vercel

Import `SahilWikhe/Rove`, branch `main`, with the **Vite** preset and root
directory `./`. Turn off the dashboard's Build Command, Output Directory, and
Install Command overrides: `vercel.json` supplies the validated settings. The
install/build commands use the pinned pnpm version so Vercel does not fall back
to an older package manager that cannot read the lockfile.

No application environment variables or secrets are required. If
`NITRO_PRESET=vercel` is already set for Production and Preview, it can remain;
the build script sets it automatically.

```sh
pnpm install --frozen-lockfile
pnpm build:vercel
pnpm verify:vercel
```

The Vercel build uses Nitro and produces the Build Output API bundle in
`.vercel/output`, including static assets and a server function. Do not set the
output directory to `.output` or `dist`.

The normal `pnpm dev`, `pnpm build`, and `pnpm start` commands retain the existing
Sites/Cloudflare workflow when `VERCEL` and `NITRO_PRESET` are unset. The Vercel
build activates when `VERCEL=1` or `NITRO_PRESET=vercel`.

## Design and behavior

- A product-led hero runs a 24-second illustrative app story: recurring days light up, a simulated tap opens the ride, the map draws and follows the journey, and arrival reveals the return plan. Notifications emerge from the phone and chapter indicators track the loop. Playback pauses offscreen and in hidden tabs; reduced motion shows a static plan. The phone stacks below the copy on smaller screens.
- A sticky desktop product story: Plan, Ride, and Return. Native page scrolling drives scene changes, and keyboard-accessible tabs can select a scene.
- A compact sticky sequence on mobile: scrolling scrubs through all three app scenes, with tabs as an alternate control.
- Reduced-motion support removes parallax and scroll scrubbing while retaining every scene through the tabs.
- Supporting page motion includes card entrances, a scroll-lit purpose headline, and an expanding gold closing section with a masked title reveal. Reduced-motion preferences keep all text visible without animation.
- A custom gold round-trip graphic blends original artwork into the page with moving SVG signals and subtle light sweeps. Its composition stays anchored without cursor tracking or visible playback controls. It pauses offscreen and in hidden tabs and respects reduced-motion settings. See [artwork details](docs/motion-artwork.md).
- Purpose and audience sections, followed by a North Carolina pilot introduction.
- No booking, billing, tracking service, analytics, or contact collection. All app screens and journey data are illustrative.

## Content

`app/rove-landing.tsx` contains the page and scroll-driven app concept. `app/hero-phone.tsx` and `app/hero-phone.css` contain the autonomous hero preview. `app/globals.css` contains the theme, responsive styles, and page motion. `app/layout.tsx` provides metadata.

Set `pilotContactHref` in `app/site-config.ts` to a verified business email link (`mailto:...`) or scheduling URL to enable the “Talk about a pilot” CTA. Until configured, the CTA returns visitors to the experience and does not collect or transmit any information.

## Assets

`public/rove-journey.webp` is an original AI-generated hero image. `public/icon.svg` and `public/favicon.svg` are the Rove monogram. Apple, Uber, and Robinhood were visual references; their source code, logos, photography, and other brand assets are not included.

## Validation

```sh
pnpm exec tsc --noEmit
pnpm build
```

The Sites deployment manifest is `.openai/hosting.json`. Build output, runtime state, and local environment files are excluded from Git.
