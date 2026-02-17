import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';

export async function addWatermark(file, text = 'CONFIDENTIAL') {
  const doc = await PDFDocument.load(await file.arrayBuffer());
  const font = await doc.embedFont(StandardFonts.HelveticaBold);

  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: width * 0.1,
      y: height * 0.5,
      size: Math.min(width, height) / 10,
      font,
      rotate: degrees(35),
      color: rgb(0.75, 0.1, 0.1),
      opacity: 0.2
    });
  });

  return {
    blob: new Blob([await doc.save()], { type: 'application/pdf' }),
    fileName: 'watermarked.pdf',
    summary: 'Applied watermark to all pages'
  };
}

export async function updateMetadata(file, options = {}) {
  const doc = await PDFDocument.load(await file.arrayBuffer());
  if (options.title) doc.setTitle(options.title);
  if (options.author) doc.setAuthor(options.author);
  if (options.subject) doc.setSubject(options.subject);
  if (options.keywords) doc.setKeywords(options.keywords.split(',').map((k) => k.trim()));

  return {
    blob: new Blob([await doc.save()], { type: 'application/pdf' }),
    fileName: 'metadata-updated.pdf',
    summary: 'Updated document metadata'
  };
}

export async function flattenPdf(file) {
  const doc = await PDFDocument.load(await file.arrayBuffer());
  const form = doc.getForm();
  form.flatten();

  return {
    blob: new Blob([await doc.save()], { type: 'application/pdf' }),
    fileName: 'flattened.pdf',
    summary: 'Flattened PDF form fields'
  };
}

export async function addPasswordProtection() {
  throw new Error('pdf-lib does not currently support PDF encryption/password setting in-browser.');
}

export async function removePasswordProtection() {
  throw new Error('Removing PDF passwords in-browser requires a parser with decryption support.');
}
