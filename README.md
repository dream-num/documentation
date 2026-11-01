# Univer Office SDK Documentation

This is the official documentation site for Univer Office SDK, which includes Web SDK, Server SDK, and AI SDK, built with [Next.js](https://nextjs.org/), Fumadocs headless content tooling, and project-owned UI.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 22.18
- [pnpm](https://pnpm.io/) >= 12

## Local Development

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

The site will be available at `http://localhost:3030`.

Build for production:

```bash
pnpm build
```

The Icons preview, MCP endpoint, and downloadable metadata use `public/assets/icons/catalog.json`. To refresh it from a matching `univer-icons` checkout, run `node scripts/sync-icons-catalog.mjs ../univer-icons`. The sync checks that the source and installed package versions match and that every exported icon is covered. Production builds use the committed catalog.

The read-only Icons MCP runs at `/mcp/icons` in the existing Next.js Node server. It exposes `search_icons` and `get_icon` over Streamable HTTP without a model API key or separate process. Its Host/Origin allowlist covers `docs.univer.ai` and loopback hosts; update `app/mcp/icons/route.ts` when deploying under another hostname. With the site running, verify the endpoint using `DOCS_TEST_ORIGIN=http://localhost:3030 node --test app/mcp/icons/__tests__/route.spec.mjs`.

## Showcase

Showcase source, assets, tests and build tooling live in the sibling `../office.univer.ai` Vite project. Run `pnpm dev` there, then set `NEXT_PUBLIC_SHOWCASES_ORIGIN=http://localhost:5180` here. Production example links and embedded previews default to `https://office.univer.ai`. Set `NEXT_PUBLIC_SHOWCASES_ORIGIN` in `.env.local` to override that address for local development.

## Documentation Analytics

PostHog is initialized once in `instrumentation-client.ts`, following the `univer.ai` site's browser SDK setup. It captures initial page loads and pathname changes, including browser back/forward navigation. Changing only a query string or article anchor does not add a pageview.

Set `NEXT_POSTHOG_APIKEY` and `NEXT_PUBLIC_POSTHOG_HOST` in `.env.local` from the documentation project's PostHog settings. The existing deployment secret `NEXT_POSTHOG_APIKEY` is reused for browser analytics through `next.config.mts`; it is a public ingestion key, not a personal API key. Docker builds default the ingestion host to US Cloud and accept a `NEXT_PUBLIC_POSTHOG_HOST` build argument to override it. Configuration changes require rebuilding the browser bundle. Capture is opted out by default outside production. Scroll-depth properties, session recording, and general autocapture are disabled to keep collection focused on essential content visits, searches, outbound navigation, and explicit feedback.

The documentation project is **Univer SDK (133116)**. It is separate from the main website's **Univer (75032)** project. Referrers identify arrivals from the website, but a cross-project user funnel cannot be inferred from these events alone.

| Event | Use |
| --- | --- |
| `$pageview` | Rank documentation and blog visits and unique visitors; inspect session paths. |
| `$pageleave` / next `$pageview` | Retain the SDK's page duration and basic web analytics. Scroll depth is not collected. |
| `docs_link_click` | Inspect outbound destinations and entry points, including source page, target host/path, and navigation location. |
| `docs_search` | Inspect `search_query`, result count, success/error status, and request duration. Aborted requests are excluded. |
| `docs_search_result_click` | Join to a request by `search_id`; inspect `search_query`, result position, destination, pointer/keyboard selection, and time from request start to selection. |
| `on_rate_docs` | Capture a helpful/unhelpful vote immediately from the shared article footer, even when no optional details are supplied. |
| `docs_feedback_detail` | Record an optional problem category and comment, linked to the vote by `feedback_id` and `feedback_revision`. |

Browser events include `site=documentation`, `schema_version=1`, `reporting_side=frontend`, `locale`, `page_path`, `content_path`, `content_section`, and `content_type` (`documentation`, `blog`, or `other`). `content_path` removes the locale prefix so translated pages can be grouped together. Native session and pageview IDs remain available. Pageviews also retain `from_path` and `from_content_path` when the SDK has a previous page in the current document.

For content rankings, filter `$pageview` to `$host=docs.univer.ai` and the desired `content_type`, then break down by `content_path` and optionally `locale`. Use native Paths and pageview source properties for internal navigation. Internal links, article anchors, and opening the search dialog do not emit separate custom events. Outbound link clicks record intent, not completed navigation. Search requests and selections share a random `search_id` and include the trimmed `search_query`, up to the existing 200-character input limit. Article text and URL query strings are not collected.

To identify popular questions, break down successful `docs_search` events by `search_query`; add `result_count=0` to find topics without results. Use `docs_search_result_click` to see which content people choose for each query. Live search can complete several requests as a visitor edits their question, so request counts are not counts of unique questions or visitors; result selections provide a more explicit interest signal.

The compact feedback footer appears below documentation, API reference, and blog articles in all eight languages. Helpful/unhelpful votes complete in one click without opening a form. A suggestion action is always available, including before voting; only an explicit request opens the optional comment form. Negative voters can also select `missing`, `unclear`, `example_error`, or `version_mismatch`. Comments allow up to 2,000 characters and can accompany either rating. The server action validates input, waits for ingestion, and reports failures so the reader can retry. Browser storage remembers each page's feedback when available; blocked or malformed storage does not prevent submission.

Feedback uses the same ingestion project and page metadata as visits, with `reporting_side=server`. The server reads the PostHog visitor cookie and falls back to the supplied browser distinct ID, then to the unique feedback ID if analytics is unavailable. Browser `$session_id` and `$pageview_id` link feedback to the visit when present. Development feedback is not ingested. Changing a vote reuses `feedback_id` with a higher `feedback_revision`: compute helpfulness from the latest vote per feedback ID, and match details to that revision. Supplemental comments are separate events and must not be counted as votes. Suggestions submitted without a rating use only `docs_feedback_detail` with `opinion=unrated`, so they do not enter the helpfulness ratio. For repeated detail edits, use the latest event timestamp. Legacy feedback with `opinion=normal` and the shared `anonymous` identity remains historical comment data; exclude it from the helpfulness ratio.

Duration is elapsed time, not active reading time; search-result selection and a helpful vote do not prove that the reader solved their problem. Historical visits before deployment cannot be reconstructed. Historical scroll properties and search-open/internal-link events may still exist from earlier deployments; this configuration stops collecting them after a new build is deployed.

Run `pnpm test:analytics` to verify URL normalization, locale grouping, previous-page attribution, delegated link tracking, feedback validation, identity correlation, delivery failures, and development opt-out.

## Project Structure

```
├── app/              # Next.js application routes and layouts
├── components/       # React components for the documentation site
├── content/          # Documentation content (MDX)
│   ├── blog/         # Blog posts
│   ├── docs/         # Office SDK overview, getting started, features, and examples (/docs)
│   ├── guides/       # Web SDK: editors, product features, and Icons (/guides)
│   ├── server/       # Server SDK: collaboration and server-side file exchange (/server)
│   ├── ai/           # AI SDK: agent operations, CLI, and Worktree (/ai)
│   └── reference/    # API reference
├── examples/         # Framework integration examples (React, Vue, Angular, Astro)
├── lib/              # Utility libraries
├── public/           # Static assets
└── scripts/          # Build and automation scripts
```

Product import/export feature guides stay in `content/guides/<product>/features`; server conversion, storage, and integration guides live in `content/server/import-export`.

## Contributing

We welcome contributions to the documentation. Please ensure your changes follow the existing style and conventions. Run `pnpm lint` and `pnpm typecheck` before submitting.

Office SDK pages in `content/docs` are maintained in all eight site languages. Keep translated feature catalogs aligned with the English source, including category order, support states, open-source flags, links, and chart previews. Preserve SDK/API identifiers and existing fragment links when translating.

For more information about contributing to Web SDK, see the [main repository](https://github.com/dream-num/univer).

## Deploy Using ECS

The site's built-in editors read the GitHub Actions secret `CLIENT_LICENSE_TEXT` at build time. Configure it in this repository's **Settings → Secrets and variables → Actions**, or in the selected deployment environment. For local development, copy `.env.example` to `.env.local` and set `CLIENT_LICENSE_TEXT` there.

The **⬆️ Deploy** workflow passes the secret through Make and a Docker BuildKit secret mount. Next.js exposes it as `NEXT_PUBLIC_CLIENT_LICENSE_TEXT`, which the editors pass to `UniverLicensePlugin`. This is a client license and is included in browser JavaScript. Updating it requires building and deploying a new image; deploying an existing image does not change its license. Image builds require a non-empty license and rerun the application build to pick up secret changes.

The ECS workflow sends `client_license_text` to `runner-machine`. Its `execute_task_documentation` job must forward that field as `CLIENT_LICENSE_TEXT` in the remote command's environment before calling `make push_image`. The corresponding receiver change must be deployed in `runner-machine` before using this workflow. Embedded Showcase demos run on `office.univer.ai` and use that site's own license configuration.

To deploy the documentation site to ECS through GitHub Actions:

1. Open **Actions** and select **🕶️ Deploy Using ECS**.
2. Select the branch to deploy (for example, `dev`).
3. Set **Environment to deploy** to `staging` or `international`.
4. Select the **ACR registry** region: use `cn-shenzhen` for the `staging` environment, or `us-east-1` for the `international` environment.
5. Enter the required **ECS instance size** (for example, `32c64g`) and click **Run workflow**.

The workflow dispatches the deployment to `runner-machine`; the ECS region is derived from the selected ACR region (`cn-shenzhen` → `shenzhen`, `us-east-1` → `us-virginia`).
