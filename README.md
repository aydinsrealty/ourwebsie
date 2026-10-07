# Aydins Realty

Multi-page Vite website for Aydins Realty's commercial, hospitality and residential developments across Kerala.

## Project structure

```text
.
├── index.html                 # Home page
├── contact/                   # Contact page
├── done-deals/                # Portfolio index and project detail pages
├── meet-the-team/             # Leadership page
├── services/                  # Services page
├── public/assets/             # Deployed fonts, images and hero frames
├── src/scripts/               # Shared browser behavior and data
├── src/styles/                # Shared CSS layers
├── scripts/                   # Optional media-generation utilities
├── DESIGN-NOTES.md            # Design decisions and verification notes
├── vite.config.js             # Multi-page Vite entry configuration
└── wrangler.toml              # Cloudflare Pages asset deployment
```

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

The optional `scripts/create-hero-video.py` utility creates a local camera-push-in export from a supplied source image. Generated video files are ignored; the deployed site uses the responsive still and the 121-frame scroll sequence already stored in `public/assets/`.
