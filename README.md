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

## Design and behavior

- A cinematic, locally stored WebP hero with parallax, staggered title reveals, and scroll-linked lighting.
- A sticky desktop product story: Plan, Ride, and Return. Native page scrolling drives scene changes, and keyboard-accessible tabs can select a scene.
- A compact sticky sequence on mobile: scrolling scrubs through all three app scenes, with tabs as an alternate control.
- Reduced-motion support removes parallax and scroll scrubbing while retaining every scene through the tabs.
- Supporting page motion includes card entrances, a scroll-lit purpose headline, and an expanding gold closing section with a masked title reveal. Reduced-motion preferences keep all text visible without animation.
- Purpose and audience sections, followed by a North Carolina pilot introduction.
- No booking, billing, tracking service, analytics, or contact collection. All app screens and journey data are illustrative.

## Content

`app/rove-landing.tsx` contains the page and app concept. `app/globals.css` contains the theme, responsive styles, and motion. `app/layout.tsx` provides metadata.

Set `pilotContactHref` in `app/site-config.ts` to a verified business email link (`mailto:...`) or scheduling URL to enable the “Talk about a pilot” CTA. Until configured, the CTA returns visitors to the experience and does not collect or transmit any information.

## Assets

`public/rove-journey.webp` is an original AI-generated hero image. `public/icon.svg` and `public/favicon.svg` are the Rove monogram. Apple, Uber, and Robinhood were visual references; their source code, logos, photography, and other brand assets are not included.

## Validation

```sh
pnpm exec tsc --noEmit
pnpm build
```

The Sites deployment manifest is `.openai/hosting.json`. Build output, runtime state, and local environment files are excluded from Git.
