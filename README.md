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

Set `NEXT_POSTHOG_APIKEY` and `NEXT_PUBLIC_POSTHOG_HOST` in `.env.local` from the documentation project's PostHog settings. The existing deployment secret `NEXT_POSTHOG_APIKEY` is reused for browser analytics through `next.config.mts`; it is a public ingestion key, not a personal API key. Docker builds default the ingestion host to US Cloud and accept a `NEXT_PUBLIC_POSTHOG_HOST` build argument to override it. Configuration changes require rebuilding the browser bundle. Capture is opted out by default outside production, and session recording and general autocapture are disabled.

The documentation project is **Univer SDK (133116)**. It is separate from the main website's **Univer (75032)** project. Referrers identify arrivals from the website, but a cross-project user funnel cannot be inferred from these events alone.

| Event | Use |
| --- | --- |
| `$pageview` | Rank documentation and blog visits and unique visitors; inspect session paths. |
| `$pageleave` / next `$pageview` | Inspect the previous page's duration and scroll depth. The SDK reads the documentation scroll container, with the document root as a fallback for blogs and mobile layouts. |
| `docs_link_click` | Inspect `from_path`, `to_path`, `to_host`, `to_anchor`, link location, and internal, anchor, or outbound intent. |
| `docs_search_open` | Count openings of the shared site search. |
| `docs_search` | Inspect completed search requests, result count, success/error status, and request duration. Aborted requests are excluded. |
| `docs_search_result_click` | Join to a request by `search_id`; inspect result position, destination, pointer/keyboard selection, and time from request start to selection. |

Browser events include `site=documentation`, `schema_version=1`, `reporting_side=frontend`, `locale`, `page_path`, `content_path`, `content_section`, and `content_type` (`documentation`, `blog`, or `other`). `content_path` removes the locale prefix so translated pages can be grouped together. Native session and pageview IDs remain available. Pageviews also retain `from_path` and `from_content_path` when the SDK has a previous page in the current document.

For content rankings, filter `$pageview` to `$host=docs.univer.ai` and the desired `content_type`, then break down by `content_path` and optionally `locale`. For navigation, use native Paths or compare the source and destination of link clicks with subsequent pageviews. A click records intent, not a completed navigation. Search text, article text, and URL query strings are not added by the custom events. Search requests and selections share a random ID rather than the query text.

Duration is elapsed time, not active reading time; scroll depth and search-result selection are behavior signals, not proof that a question was answered. Existing `on_rate_docs` feedback remains separate and retains its existing identity. New visit events use the browser SDK's anonymous visitor/session identity, not the shared `anonymous` feedback identifier. Historical visits before deployment cannot be reconstructed.

Run `pnpm test:analytics` to verify URL normalization, locale grouping, previous-page attribution, and delegated link tracking.

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
