# Marble documentation

Astro Starlight site, deployed as a static site to Cloudflare Pages.

```sh
bun install
bun run dev     # http://localhost:4321, editor at http://localhost:4321/keystatic
bun run build   # static output in dist/
```

## Writing pages

Pages are MDX in `src/content/docs/<section>/`, and screenshots live in `src/assets/<section>/<page>/`.

The sidebar is built from the folders (`src/sidebar.mjs` only lists the sections): pages are sorted by `sidebar.order` in their frontmatter, steps of 100 within a section, so there's room to insert pages. A subfolder becomes a collapsed group, led by its `index.mdx`, whose title labels the group (that page shows as "Overview" with `sidebar.label`). Moving a page changes its URL, so add a redirect from the old one in `public/_redirects`.

These components need no import (see `AutoImport` in `astro.config.mjs`):

- `<Screenshot src="case-manager/configuration/configuration-1.png" caption="…" width="500px" bordered />`: an image from `src/assets/`, zoomable on click.
- `<Aside type="note" title="…">…</Aside>`: a callout (`note`, `tip`, `caution` or `danger`).
- `<Glossary>Rule</Glossary>s`: a term with its definition from `src/data/glossary.json` on hover. Use `term="Rule"` when the text differs from the term.
- `<Tabs>`/`<TabItem label="…">`, `<Columns>` (each child is a column) and `<YouTube id="…" title="…" />`.

## Editing with Keystatic

[Keystatic](https://keystatic.com/) at `/keystatic` edits pages in a browser, with the components above as blocks. It's configured in `keystatic.config.ts`: one collection per section, and a new section needs an entry in `FOLDERS` there (the build fails otherwise).

- **Locally** (`bun run dev`), it reads and writes your working tree directly.
- **In production**, editors sign in with GitHub, create a branch and open a pull request from the editor. The PR gets a preview deployment like any other.

There's no server: `/keystatic` is a static page, and its API (GitHub login) is a Pages Function in `functions/api/keystatic/`.

New pages appear in the sidebar on their own; their **Sidebar › Position** field places them (empty puts them last).

### Setup

1. Create a GitHub App for Keystatic on the `checkmarble` organization, with access to this repository: **Contents** and **Pull requests** read/write, and **Request user authorization (OAuth) during installation**. The callback URL is `https://marble-docs.pages.dev/api/keystatic/github/oauth/callback`. Then install it on this repository.
2. Set `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET` (from the app) and `KEYSTATIC_SECRET` (a random string of 40+ characters) as secrets of the `marble-docs` Pages project.
3. Set the app's slug (the last part of its URL) as the `KEYSTATIC_GITHUB_APP_SLUG` Actions variable of this repository.
4. Protect `main` with required reviews, so edits always go through a branch and a pull request.

Sign-in only works on the origin of the callback URL: GitHub Apps don't accept wildcards, so not from PR previews.
