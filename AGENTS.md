# Session Summary - June 23, 2026

## Goal
Customize a running Paperless-ngx Docker deployment with brand logo/colors and QR code generation on documents.

## Constraints & Preferences
- Paperless-ngx v3.0.0 (cloned from latest) running in Docker, Windows host
- Forked to `MahdiEttayi/paperless-ngx-Altered`
- Brand assets: SVG logo (blue badge #0A66C2 / #084B9A) and DESIGN.md (primary #005696, secondary #0091D5, button #0070E0)
- QR integration: generate QR on documents (PDF stamping + frontend display), no scanning

## Progress

### Done
- Forked upstream paperless-ngx repo to `https://github.com/MahdiEttayi/paperless-ngx-Altered`
- Cloned fork locally to `C:\Users\Admin\paperless-ngx-custom\paperless-ngx-Altered`
- Created `.env` with dev and QR settings
- Docker backing services running (PostgreSQL, Redis, Gotenberg, Tika via `docker/compose/docker-compose.postgres-tika.yml`)
- Frontend deps installed (`pnpm install` done, build verified)
- Design doc written to `docs/superpowers/specs/2026-06-23-paperless-ngx-customization-design.md`
- Implementation plan written to `docs/superpowers/plans/2026-06-23-paperless-ngx-customization.md`
- Brand logo SVGs saved to all 5 asset variants in `src-ui/src/assets/`
- `theme.scss` primary color updated from green (128, 57%) to brand blue (206, 100%, 29% light / 35% dark)
- Navbar inline SVG in `app-frame.component.html` replaced with brand badge icon (using `currentColor` + `var(--bs-body-bg)`)
- `environment.ts` appTitle changed to "CoopPaperless"
- `src/documents/plugins/qr_code.py` created with `stamp_qr_on_pdf()` using PyMuPDF (fitz) and qrcode
- `src/documents/consumer.py` modified to call `stamp_qr_on_pdf()` after document save (line ~733)
- `pyproject.toml` updated with `PyMuPDF~=1.25.0` and `qrcode[pil]~=7.4` dependencies
- QR config settings (`PAPERLESS_QR_ENABLED`, `PAPERLESS_QR_BASE_URL`, `PAPERLESS_QR_POSITION`) added to `paperless/settings/__init__.py` (lines 893-897)
- `qrcode` npm package installed in `src-ui/`
- Created `src-ui/src/app/components/document-detail/qr-code/` Angular component (`.ts`, `.html`, `.scss`)
- Added `pngx-qr-code` button to document detail header toolbar (between download and actions)
- Frontend build passes with QR component integrated

### In Progress
- (none currently)

### Blocked
- (none)

## Key Decisions
- QR stamping placed directly in `consumer.py` after `document.save()` rather than using a Django post_save signal or `document_consumption_finished` signal
- Used PyMuPDF (`fitz`) for QR insertion onto PDF (no rasterization, incremental save)
- Used `incremental=True` in PyMuPDF save for fast, non-destructive QR stamping
- No separate ConsumerPlugin class needed; direct function call from consumer.py
- Logo variants all use the same user SVG (badge icon only; app title text handled separately via HTML)

## Next Steps
- Install Python dependencies (qrcode, PyMuPDF) in dev environment for testing
- Build custom Docker image
- Push all commits to GitHub fork

## Relevant Files
- `C:\Users\Admin\paperless-ngx-custom\paperless-ngx-Altered\`: Repo root
- `src-ui/src/theme.scss`: Primary/theme color variables
- `src-ui/src/assets/logo*.svg`: 5 brand logo variants
- `src-ui/src/environments/environment.ts`: App title
- `src-ui/src/app/components/app-frame/app-frame.component.html`: Navbar inline SVG icon
- `src/documents/consumer.py`: QR stamping call added after document.save()
- `src/documents/plugins/qr_code.py`: `stamp_qr_on_pdf()` and `_stamp_qr_on_pdf_file()` functions (new file)
- `pyproject.toml`: Python dependency list
- `paperless/settings/__init__.py`: QR config env vars (lines 893-897)
- `.env`: Dev environment variables (QR settings already present)
- `docs/superpowers/specs/2026-06-23-paperless-ngx-customization-design.md`: Design doc
- `docs/superpowers/plans/2026-06-23-paperless-ngx-customization.md`: Implementation plan
- `C:\Users\Admin\Downloads\DESIGN.md`: User's brand design system
- `src-ui/src/app/components/document-detail/qr-code/`: Angular QR code component (new)
