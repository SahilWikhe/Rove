# CI and security

Rove is currently a public presentation site. It has no accounts, booking API,
payments, uploads, database, or Server Actions. These checks protect that scope;
adding any of those features requires a new security review and additional tests.

## What runs automatically

`.github/workflows/ci.yml` runs on PRs targeting `main`, updates to those PRs,
pushes to `main`, merge queues, manual dispatch, and a weekly schedule. The weekly
run catches newly disclosed dependency issues even when nobody changes the code.
Documentation changes run the same checks so a required status is never missing.

| Check                           | Coverage                                                                                                                                                | Failure behavior                                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Quality and dependency security | TypeScript, lint, formatting, actionlint workflow validation, security-policy/workflow/CodeQL-gate unit tests, full dependency audit                    | Blocks on test errors or moderate/high/critical advisories, including development dependencies                                                   |
| Vercel build and browser tests  | Production build, isolated packaged function, HTML/RSC/404 handling, assets, public artifact exposure, Chromium desktop/Android and WebKit iPhone tests | Blocks on any build or test failure; saves failure screenshots/traces and the HTML report for seven days                                         |
| Sites compatibility build       | Existing Cloudflare/Sites build                                                                                                                         | Blocks on build failure                                                                                                                          |
| Secret scan                     | Gitleaks default rules plus Vercel token detection across complete Git history                                                                          | Blocks on detected secrets; output is redacted                                                                                                   |
| CodeQL security analysis        | Extended JavaScript/TypeScript security queries                                                                                                         | Blocks on failed analysis, missing reports, or any high/critical finding (SARIF security score ≥7); findings also appear in GitHub code scanning |
| CI required                     | All five jobs above                                                                                                                                     | Fails if any job fails, is cancelled, or is skipped                                                                                              |

PR jobs do not deploy and do not receive a Vercel token or other application
secrets. Actions are pinned to full commit SHAs. Checkout does not persist Git
credentials. Workflow permissions default to read-only; only CodeQL receives
permission to upload security results. There is no `pull_request_target` workflow.
Gitleaks and actionlint downloads have pinned versions and SHA-256 checksums. Jobs have timeouts,
and superseded branch runs are cancelled.

Dependabot checks for routine version updates monthly and combines them into one
npm PR and one GitHub Actions PR, with at most one open routine PR per ecosystem.
React packages remain together in the npm batch. Nothing is automatically merged.
Security-update groups are separate: when Dependabot security updates are enabled
in repository settings, they are not delayed by the monthly version-update schedule
or its open-PR cap. The weekly CI dependency audit remains in place independently.

## Browser coverage

All 12 browser scenarios run in three browser/device profiles:

- Server-rendered content hydrates without page exceptions or failed assets;
  navigation anchors resolve and the page does not overflow horizontally.
- Mobile navigation opens, closes on Escape, restores focus, and closes after
  selecting a destination.
- Native scrolling traverses Plan, Ride, and Return and works in reverse.
- Reduced motion stops the hero and preserves keyboard/tab navigation.
- Hero animation progresses when visible and pauses when offscreen.
- The real analytics SDK inserts one script under the enforced CSP. CI serves a
  harmless script fixture rather than sending fake production page views.
- Essential content remains usable without JavaScript.
- Automated axe WCAG A/AA checks run with motion reduced.
- Each HTML response has a fresh CSP nonce, correctly nonced inline framework
  scripts, security headers, and no shared HTML caching. Forged request headers
  cannot choose the nonce.
- POST/PUT/PATCH/DELETE and action-shaped requests are rejected; GET/HEAD work.
- Sensitive file paths and unknown routes return 404 rather than source content.
- A real browser blocks injected unnonced scripts and external fetches.

Playwright runs the packaged production function through a loopback-only HTTP
adapter. This verifies the app, not Vercel's CDN, firewall, or analytics backend.
The adapter is test infrastructure and is not deployed.

## Live deployment checks

The production origin is `https://www.roveride.co`. The separate production smoke workflow runs after a successful GitHub production
deployment status, or manually. It checks the public Vercel homepage, security
headers, and analytics JavaScript. It retries the script GET for activation delays
and never submits analytics events. It uses the trusted `main` branch and a fixed
production origin, not URLs or shell commands supplied by PR authors.

It observes the currently published production domain, not a specific deployment
artifact. It reports failures; it does not automatically roll back or stop an
already completed deployment. Update `scripts/check-production.mjs` when the
canonical Vercel production domain changes. Protected previews do not need a
bypass token: their application behavior is tested using the local production
bundle in PR CI.

## Repository settings required after these files are pushed

At the time of this review, `main` had no branch protection. Workflow files alone
cannot enforce merge policy or prevent direct production pushes. Once `CI required`
has run, create an active GitHub ruleset targeting `main`:

1. Require a pull request before merging; block force pushes and branch deletion.
2. Require the **CI required** status check, and require the branch to be up to date.
3. Also require CodeQL code scanning results for an additional GitHub-managed gate.
   High/critical findings already fail `CI required` through the SARIF check.
4. Avoid unrestricted bypass actors. Set reviewer requirements to match the team;
   a one-person project cannot approve its own pull requests.
5. Keep secret scanning and push protection enabled (both were already enabled).
   Enable Dependabot security updates in addition to the version-update config.

Vercel's Git integration still creates previews for feature branches and production
deployments from `main`. Requiring checks before changes reach `main` is the release
gate. GitHub CI running in parallel with Vercel does not itself make Vercel wait.
These repository settings must be configured separately; committing workflow files
does not apply them.

## Local verification

Use Node 24 and the pnpm version pinned in `package.json`:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium webkit
pnpm typecheck
pnpm lint
pnpm format:check
pnpm security:audit
pnpm test
pnpm build
```

On Linux, use `pnpm exec playwright install --with-deps chromium webkit` to install
system libraries too. `pnpm test:e2e` alone requires a current `pnpm build:vercel`.
The test server binds only to `127.0.0.1:4173` and is stopped by Playwright.

```sh
scanner="$(bash scripts/install-gitleaks.sh)"
"$scanner" git --redact --no-banner --log-opts="--all"
checker="$(bash scripts/install-actionlint.sh)"
"$checker" -shellcheck="" -pyflakes=""
pnpm test:live
```

The live command only applies after the security changes have been deployed.
CodeQL runs on GitHub, not as part of the local browser tests. Lint covers authored
application/infrastructure/test code and the tab primitive used by the app; unused
generated UI templates are not part of this lint gate. TypeScript still checks the
whole TypeScript project. Raw decorative artwork images have a scoped lint exception.

## Security design and limits

Security request handling lives in `proxy.ts` and is bundled by Vinext into the
application server. Do not rename it to `middleware.ts`: Vercel's Vite integration
also detects that filename as standalone platform routing middleware, whose export
and runtime contract differs from Vinext's. The source-layout regression check
rejects that collision, and browser tests verify that the bundled proxy still
provides the nonce policy and write restrictions.

The middleware generates a cryptographically random 144-bit nonce for each HTML
response, overrides client-supplied CSP headers, and applies a restrictive content
policy. Unnonced inline scripts, external connections, frames embedding this site,
objects, base-URL overrides, and form submissions are restricted. Inline **styles**
remain allowed because the animation and component libraries use them; production
inline **scripts without a nonce** and eval are not allowed. Scripts from this site's own origin
remain allowed so the framework and Vercel Analytics can load normally.

Nonce-based CSP requires dynamic HTML rendering and disables shared HTML caching.
Static JS, CSS, fonts, and images retain their existing asset delivery. This trades
some server work for per-request script authorization. Development-only script and
WebSocket allowances are excluded from production. Third-party preview toolbars or
future embeds may need a deliberate policy update; do not weaken the production
policy to silence unrelated blocked requests.

The site rejects write methods before Server Action decoding. Vercel analytics
intake is excluded from this middleware so its page-view POSTs keep working.
Before adding real forms/APIs, replace this blanket presentation-site restriction
with endpoint-specific validation, authorization, abuse limits, and tests.

Dependency updates address published advisories at review time; audit results
cannot predict undisclosed vulnerabilities. Keep Vercel's platform protections and
HTTPS enabled, protect GitHub/Vercel accounts with MFA, and keep deployment tokens
out of application code, PR jobs, public configuration, and Git. A token shared in
chat should be rotated when no longer needed. Store future automation credentials
only in the relevant secret store with the smallest scope required.

These checks do not promise immunity to attacks or replace a penetration test.
They do not load-test production, prove DDoS resistance, or configure paid firewall
rules. Monitor platform alerts and usage; rate limits should be tailored to real
traffic rather than introduced blindly. Automated accessibility tests also do not
replace manual assistive-technology testing.
