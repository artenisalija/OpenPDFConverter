import { PDFDocument, degrees } from 'pdf-lib';

function parsePages(pageList) {
  return String(pageList || '')
    .split(',')
    .map((n) => Number(n.trim()))
    .filter((n) => Number.isInteger(n) && n > 0)
    .map((n) => n - 1);
}

export async function mergePdfs(files) {
  const out = await PDFDocument.create();

  for (const file of files) {
    const doc = await PDFDocument.load(await file.arrayBuffer());
    const pages = await out.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => out.addPage(page));
  }

  return {
    blob: new Blob([await out.save()], { type: 'application/pdf' }),
    fileName: 'merged.pdf',
    summary: `Merged ${files.length} PDF file(s)`
  };
}

export async function splitPdf(file, splitMode, rangeValue) {
  const doc = await PDFDocument.load(await file.arrayBuffer());
  const count = doc.getPageCount();

  if (splitMode === 'single') {
    const out = await PDFDocument.create();
    const pages = await out.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => out.addPage(page));
    return {
      blob: new Blob([await out.save()], { type: 'application/pdf' }),
      fileName: 'split-all-pages.pdf',
      summary: `Collected all ${count} individual pages`
    };
  }

  if (splitMode === 'every-n') {
    const n = Math.max(1, Number(rangeValue || 1));
    const out = await PDFDocument.create();
    for (let i = 0; i < count; i += n) {
      const [page] = await out.copyPages(doc, [i]);
      out.addPage(page);
    }
    return {
      blob: new Blob([await out.save()], { type: 'application/pdf' }),
      fileName: `split-every-${n}.pdf`,
      summary: `Selected every ${n} page(s)`
    };
  }

  const [startRaw, endRaw] = String(rangeValue || '1-1').split('-');
  const start = Math.max(1, Number(startRaw || 1));
  const end = Math.min(count, Math.max(start, Number(endRaw || start)));

  const out = await PDFDocument.create();
  const indexes = Array.from({ length: end - start + 1 }, (_, i) => start + i - 1);
  const pages = await out.copyPages(doc, indexes);
  pages.forEach((page) => out.addPage(page));

  return {
    blob: new Blob([await out.save()], { type: 'application/pdf' }),
    fileName: `split-${start}-${end}.pdf`,
    summary: `Extracted pages ${start}-${end}`
  };
}

export async function rotatePdf(file, degreesValue = 90) {
  const doc = await PDFDocument.load(await file.arrayBuffer());
  doc.getPages().forEach((page) => {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + Number(degreesValue)) % 360));
  });

  return {
    blob: new Blob([await doc.save()], { type: 'application/pdf' }),
    fileName: 'rotated.pdf',
    summary: `Rotated all pages by ${degreesValue} degrees`
  };
}

export async function deletePages(file, pageList) {
  const doc = await PDFDocument.load(await file.arrayBuffer());
  const pages = parsePages(pageList).sort((a, b) => b - a);

  for (const index of pages) {
    if (index >= 0 && index < doc.getPageCount()) doc.removePage(index);
  }

  return {
    blob: new Blob([await doc.save()], { type: 'application/pdf' }),
    fileName: 'deleted-pages.pdf',
    summary: `Deleted ${pages.length} page(s)`
  };
}

export async function extractPages(file, pageList) {
  const source = await PDFDocument.load(await file.arrayBuffer());
  const out = await PDFDocument.create();
  const indexes = parsePages(pageList).filter((i) => i < source.getPageCount());
  const pages = await out.copyPages(source, indexes);
  pages.forEach((page) => out.addPage(page));

  return {
    blob: new Blob([await out.save()], { type: 'application/pdf' }),
    fileName: 'extracted-pages.pdf',
    summary: `Extracted ${pages.length} page(s)`
  };
}

export async function reorderPages(file, pageList) {
  const source = await PDFDocument.load(await file.arrayBuffer());
  const out = await PDFDocument.create();
  const selected = parsePages(pageList).filter((i) => i < source.getPageCount());
  const remaining = source.getPageIndices().filter((i) => !selected.includes(i));
  const order = [...selected, ...remaining];

  const pages = await out.copyPages(source, order);
  pages.forEach((page) => out.addPage(page));

  return {
    blob: new Blob([await out.save()], { type: 'application/pdf' }),
    fileName: 'reordered.pdf',
    summary: 'Reordered pages'
  };
}

export async function compressPdf(file) {
  const doc = await PDFDocument.load(await file.arrayBuffer());
  const compressed = await doc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    updateFieldAppearances: false
  });

  return {
    blob: new Blob([compressed], { type: 'application/pdf' }),
    fileName: 'compressed.pdf',
    summary: 'Saved PDF with compression-focused settings'
  };
}
