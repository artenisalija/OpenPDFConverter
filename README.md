# Open PDF Converter

Open PDF Converter is a free, privacy-first, browser-based PDF toolkit.
All file processing runs locally in your browser (client-side only).

## Privacy

Your files are processed locally in your browser and are never uploaded to any server.

## Tech Stack

- React (CRA)
- shadcn/ui-style components + Tailwind CSS
- `pdf-lib` for PDF editing/writing
- `pdfjs-dist` for rendering/text extraction
- `tesseract.js` for OCR
- `docx`, `xlsx`, and generated `.pptx` package output for office exports
- `jszip`, `jspdf`, `file-saver`

## Features

### Convert

- PDF -> Word (`.docx`) (text-based extraction)
- PDF -> Excel (`.xlsx`) (sheet-per-page, line-based extraction)
- PDF -> PowerPoint (`.pptx`) (slide-per-page, text-based extraction)
- PDF -> image pages (PNG inside ZIP)
- PDF -> text (`.txt`)
- Images -> PDF
- HTML -> PDF

### OCR

- OCR PDF -> text
- Image -> text
- Scanned PDF -> searchable PDF (invisible text layer)

### Edit and Organize

- Merge PDFs
- Split PDF (range / every N / single)
- Compress PDF
- Rotate pages
- Reorder pages
- Delete pages
- Extract pages

### Security and Metadata

- Watermark PDF
- Edit metadata
- Flatten form fields
- Password add/remove currently limited by browser-side library support

### Advanced

- Sign PDF (text signature placement)
- Fill PDF forms (matching field names)
- Redact (overlay-based)
- Add page numbers
- Add header/footer
- Crop pages
- Repair malformed PDFs (re-save)

## UI and Responsiveness

- Dark mode only
- Desktop (`lg` and up): left sidebar navigation
- Mobile/tablet (`< lg`): service dropdown in upload section (no sidebar)
- No mobile hamburger menu
- Responsive layout for upload/options/preview blocks

## Local Development

### Requirements

- Node.js 18+
- npm

### Run

```bash
npm install
npm start
```

Open: `http://localhost:3000`

Note for some Windows PowerShell environments with restricted script policy:

```bash
cmd /c npm start
```

### Build

```bash
npm run build
```

## Docker (Optional)

```bash
docker build -t pdf-app .
docker run -p 3000:3000 pdf-app
```

## CI/CD

Workflows included:

- `.github/workflows/pr-checks.yml`: install, test, build on PRs
- `.github/workflows/deploy.yml`: build and deploy to GitHub Pages on push to `main`

## GitHub Pages Setup

1. Set correct `homepage` in `package.json` when deploying to your repo URL.
2. Update workflow `PUBLIC_URL` values to your repo path if needed.
3. Push to `main`.
4. In GitHub Settings -> Pages, serve from `gh-pages` branch root.

## Configuration

See `.env.example`:

- `PORT`
- `REACT_APP_MAX_PREVIEW_PAGES`

## Contributing

1. Create a branch
2. Run tests/build locally
3. Open a PR

## Known Limitations

- Office conversions are best-effort text/layout extraction, not full-fidelity round-trip
- Large files can be slow in-browser
- OCR accuracy depends on scan/image quality
- Full PDF encryption/decryption support is limited client-side

## License

MIT License. See `LICENSE`.
