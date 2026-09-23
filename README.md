# link.mattao.net

Personal link hub for `https://link.mattao.net`.

The site is a static Jekyll website deployed to Cloudflare Workers. It presents links grouped by category, with a responsive Bento layout, a compact list view, local SVG/PNG icons, a Formula 1 schedule widget and persistent Light/Dark theme controls.

## Stack

- Jekyll 4.3
- Liquid templates
- SCSS compiled by Jekyll
- Vanilla JavaScript
- Cloudflare Workers Assets
- GitHub Actions for synchronizing `main` to `deploy`

No frontend framework or build system is required.

## Project Structure

```text
_config.yml                 Jekyll configuration
_data/links.yaml            Link and category source of truth
_data/profile.yml           Personal identity and description
_includes/head.html          HTML head and initial theme/layout state
_includes/link-card.html     Generated link card
_includes/link-icon.html     Local icon loader and fallback
_includes/f1-widget.html     Formula 1 widget markup
_layouts/default.html        Main page layout and controls
_sass/_variables.scss        Theme tokens and design variables
_sass/_base.scss             Global layout and background
_sass/_components.scss       Cards, panels, controls and responsive rules
assets/css/main.scss         SCSS entry point
assets/icons/                Local link and utility icons
assets/images/               Backgrounds, logo and imagery
assets/js/site.js            Theme, Grid/List and shortlink copy behavior
assets/js/f1.js              Formula 1 calendar and session behavior
wrangler.jsonc               Cloudflare asset configuration
```

## Link Data

All link content is defined in `_data/links.yaml`. Do not duplicate links in Liquid or JavaScript.

```yaml
links:
  - category: Social
    items:
      - name: YouTube
        slug: youtube
        icon: youtube.svg

  - category: Tools
    items:
      - name: Example Tool
        slug: example
        icon: example.svg
```

Fields:

- `category`: category label shown in the Bento panel
- `items`: links belonging to the category
- `name`: visible link name
- `slug`: relative shortlink path, such as `/youtube`
- `url`: optional direct URL for links that should bypass `link.mattao.net`; use either `slug` or `url`
- `icon`: filename loaded from `assets/icons/`

Adding a category only requires adding another category block to the YAML file. The page creates its panel automatically. If a category has no name, the template falls back to `Tools`.

The final redirect destinations are not stored in this repository. Redirects for `/<slug>` are managed separately in Cloudflare.

Direct links can be added manually without a slug:

```yaml
- category: Tools
  items:
    - name: Google
      url: https://www.google.com
      icon: google.svg
```

The Telegram Worker continues to manage only redirect links. Its `/link` command reads the current YAML before inserting new entries, so manually added direct links are preserved.

## Icons

Icons are local assets. The value in YAML must contain only the filename:

```yaml
icon: github.svg
```

The loader searches `assets/icons/`. If the icon is omitted or cannot be loaded, it uses:

```text
assets/icons/default.svg
```

## Interface Features

### Theme

The default theme is Dark. The manual theme switch stores its value in `localStorage` using the `theme` key:

```text
dark
light
```

The initial theme is applied in `_includes/head.html` before the stylesheet loads to avoid a flash of the wrong theme. The Light theme has its own background image and color tokens.

### Grid and List Views

The layout toggle stores its value in `localStorage` using the `layout` key:

```text
grid
list
```

Both views use the same Liquid-generated markup. CSS changes the presentation through the root `data-layout` attribute.

### Copy Shortlink

Each link card has a separate Copy action. The copied URL is built from the current origin and the generated slug, for example:

```text
https://link.mattao.net/github
```

The action never exposes or uses the final redirect destination.

### Formula 1 Widget

The F1 widget is defined in `_includes/f1-widget.html` and populated by `assets/js/f1.js`.

It reads structured session and meeting data from OpenF1, selects the next upcoming race, groups sessions by Italian weekday and converts all times to:

```text
Europe/Rome
```

The widget retries rate-limited requests and falls back gracefully when the calendar is unavailable. It does not contain hardcoded race data.

## Local Development

Install Ruby, Bundler and the project gems, then run:

```bash
bundle install
bundle exec jekyll serve
```

The local site is normally available at:

```text
http://127.0.0.1:4000
```

For a production-style build:

```bash
bundle exec jekyll build
```

Generated files are written to `_site/`, which is ignored by Git.

## Deployment

The intended deployment flow is:

```text
push main
  -> GitHub Actions updates deploy
  -> Cloudflare builds with bundle exec jekyll build
  -> Cloudflare runs npx wrangler@4.128.0 deploy
  -> Cloudflare publishes _site
```

Cloudflare settings:

```text
Production branch: deploy
Build command:     bundle exec jekyll build
Deploy command:    npx wrangler@4.128.0 deploy
Output directory:  _site
```

The workflow in `.github/workflows/deploy.yml` only synchronizes `main` to `deploy`. It does not run Jekyll, Wrangler or a direct Cloudflare deployment.

## Validation

Before committing changes:

```bash
git diff --check
bundle exec jekyll build
```

Also verify that every explicitly referenced local icon exists under `assets/icons/` and that the intended links and slugs remain present in `_data/links.yaml`.

Do not commit `_site/`, `.jekyll-cache/`, `Gemfile.lock` or `node_modules/`.
