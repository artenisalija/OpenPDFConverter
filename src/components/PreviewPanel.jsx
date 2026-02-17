import React from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export default function PreviewPanel({ file }) {
  const [thumbs, setThumbs] = React.useState([]);

  React.useEffect(() => {
    let cancelled = false;

    async function buildThumbs() {
      setThumbs([]);
      if (!file || file.type !== 'application/pdf') return;

      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const maxPages = Number(process.env.REACT_APP_MAX_PREVIEW_PAGES || 8);
      const cap = Math.min(pdf.numPages, maxPages);
      const next = [];

      for (let i = 1; i <= cap; i += 1) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.28 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        next.push({ page: i, dataUrl: canvas.toDataURL('image/png') });
      }

      if (!cancelled) setThumbs(next);
    }

    buildThumbs().catch(() => setThumbs([]));

    return () => {
      cancelled = true;
    };
  }, [file]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent>
        {!file && <p className="text-sm text-muted-foreground">Upload a file to preview pages.</p>}
        {file && file.type !== 'application/pdf' && (
          <p className="text-sm text-muted-foreground">Preview is available for PDFs.</p>
        )}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {thumbs.map((thumb) => (
            <div key={thumb.page}>
              <img src={thumb.dataUrl} alt={`Page ${thumb.page}`} className="w-full rounded-md border" />
              <p className="mt-1 text-xs text-muted-foreground">Page {thumb.page}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
