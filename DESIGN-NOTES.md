# Reference design implementation

Reference reviewed: https://www.rioproperty.co.za/ — 8 September 2026.

Reviewed Home, Meet the team, Done Deals, Services and Contact, including hero composition, menu, content sections, gallery/list controls, service accordions and contact/footer treatment. Aydins content and existing project images are retained. This is an implementation of the reference design, not a certified pixel-for-pixel match: different copy, imagery, item counts and brand assets change the composition.

## Changes

- Locally hosted Blauer Nue and Rubik fonts; reference palette and typography.
- Full-height image heroes, square cards, white editorial sections, purple navigation/contact sections and dark footer.
- Shared entry/exit curtain across all five routes, bounded image/font wait, CSS fail-open fallback, back/forward recovery and reduced-motion support.
- Menu keyboard focus handling, Escape support, semantic hidden labels, real service links, gallery/list switching and accordion ARIA states.
- A high-resolution responsive hero fallback paired with a scroll-driven 121-frame sequence. Reduced-motion and small-screen visitors receive the still.
- The current local hero sequence is sampled from `headvids.mp4` at 3840 × 2160 / 24 fps. `scripts/extract-hero-frames.py` creates 121 naturally downsampled 2560 × 1440 WebP frames without artificial sharpening or upscaling.

## Media

The optional `public/assets/videos/heaven-camera-4k.mp4` export is 3840 × 2160, H.264, 24 fps and 10 seconds long. It is a smooth camera push-in rendered from the supplied 5504 × 3072 image, not generative video or real drone footage. The website reproduces that camera move directly on a responsive image to preserve sharpness while avoiding video buffering. Generated video files are ignored because they are not part of the deployed site.

The reproducible export script is `scripts/create-hero-video.py`; run it with a source image path when an optional video is needed. The site keeps the optimized responsive still and the 121-frame scroll sequence under `public/assets/`.

## Verification and boundaries

- `npm run build` passes for all nine configured HTML entry points.
- Desktop and 390px mobile browser checks; navigation transition, gallery/list switch, service accordion and checkbox interaction checked.
- Local asset audit: no missing referenced assets or duplicate IDs.
- 4K video metadata and midpoint decode checked.
- The static project has no form delivery backend. Forms validate required fields and open a populated email draft; they do not claim an enquiry has been delivered.
- Existing contact numbers, team details, partner logos and commercial claims were inherited from the project; they have not been independently verified.
