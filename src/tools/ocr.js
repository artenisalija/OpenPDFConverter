import { PDFDocument, rgb } from 'pdf-lib';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export async function imageToText(file, languages = 'eng') {
  const worker = await createWorker(languages);
  const { data } = await worker.recognize(file);
  await worker.terminate();

  return {
    blob: new Blob([data.text], { type: 'text/plain;charset=utf-8' }),
    fileName: `${file.name.replace(/\.(png|jpg|jpeg)$/i, '')}-ocr.txt`,
    summary: 'OCR extraction complete'
  };
}

export async function ocrPdfToText(file, languages = 'eng') {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const worker = await createWorker(languages);
  let text = '';

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    const { data } = await worker.recognize(canvas);
    text += `\n\n--- OCR Page ${i} ---\n${data.text}`;
  }

  await worker.terminate();

  return {
    blob: new Blob([text.trim()], { type: 'text/plain;charset=utf-8' }),
    fileName: `${file.name.replace(/\.pdf$/i, '')}-ocr.txt`,
    summary: `OCR complete on ${pdf.numPages} page(s)`
  };
}

export async function scannedPdfToSearchable(file, languages = 'eng') {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const source = await PDFDocument.load(bytes);
  const result = await PDFDocument.create();

  const pdfjsDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
  const worker = await createWorker(languages);

  for (let i = 0; i < source.getPageCount(); i += 1) {
    const [copied] = await result.copyPages(source, [i]);
    result.addPage(copied);

    const page = await pdfjsDoc.getPage(i + 1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    const { data } = await worker.recognize(canvas);

    const added = result.getPage(i);
    const { width, height } = added.getSize();

    added.drawText(data.text.slice(0, 4000), {
      x: 4,
      y: 4,
      size: 1,
      color: rgb(1, 1, 1),
      opacity: 0
    });

    if (width && height) {
      added.drawText('', { x: width - 1, y: height - 1, size: 1 });
    }
  }

  await worker.terminate();

  return {
    blob: new Blob([await result.save()], { type: 'application/pdf' }),
    fileName: `${file.name.replace(/\.pdf$/i, '')}-searchable.pdf`,
    summary: 'Created searchable OCR PDF (invisible text layer)'
  };
}
