import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function addPageNumbers(file, start = 1) {
  const doc = await PDFDocument.load(await file.arrayBuffer());
  const font = await doc.embedFont(StandardFonts.Helvetica);

  doc.getPages().forEach((page, index) => {
    const { width } = page.getSize();
    page.drawText(String(Number(start) + index), {
      x: width - 40,
      y: 12,
      size: 10,
      font,
      color: rgb(0.2, 0.2, 0.2)
    });
  });

  return {
    blob: new Blob([await doc.save()], { type: 'application/pdf' }),
    fileName: 'page-numbered.pdf',
    summary: 'Added page numbers'
  };
}

export async function addHeaderFooter(file, header = '', footer = '') {
  const doc = await PDFDocument.load(await file.arrayBuffer());
  const font = await doc.embedFont(StandardFonts.Helvetica);

  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    if (header) page.drawText(header, { x: 20, y: height - 18, size: 10, font });
    if (footer) page.drawText(footer, { x: 20, y: 12, size: 10, font });
    page.drawText('', { x: width - 2, y: 2, size: 1, font });
  });

  return {
    blob: new Blob([await doc.save()], { type: 'application/pdf' }),
    fileName: 'header-footer.pdf',
    summary: 'Added header/footer text'
  };
}

export async function cropPages(file, options = {}) {
  const left = Number(options.left || 0);
  const right = Number(options.right || 0);
  const top = Number(options.top || 0);
  const bottom = Number(options.bottom || 0);

  const doc = await PDFDocument.load(await file.arrayBuffer());
  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    page.setCropBox(left, bottom, Math.max(1, width - left - right), Math.max(1, height - top - bottom));
  });

  return {
    blob: new Blob([await doc.save()], { type: 'application/pdf' }),
    fileName: 'cropped.pdf',
    summary: 'Updated page crop box'
  };
}

export async function fillPdfForms(file, values = {}) {
  const doc = await PDFDocument.load(await file.arrayBuffer());
  const form = doc.getForm();
  const fields = form.getFields();

  fields.forEach((field) => {
    const name = field.getName();
    if (typeof field.setText === 'function' && values[name]) {
      field.setText(values[name]);
    }
  });

  return {
    blob: new Blob([await doc.save()], { type: 'application/pdf' }),
    fileName: 'filled-form.pdf',
    summary: 'Filled matching form fields'
  };
}

export async function signPdf(file, signatureText = 'Signed') {
  const doc = await PDFDocument.load(await file.arrayBuffer());
  const font = await doc.embedFont(StandardFonts.HelveticaOblique);
  const first = doc.getPages()[0];
  first.drawText(signatureText, {
    x: 32,
    y: 32,
    size: 18,
    font,
    color: rgb(0, 0.35, 0.15)
  });

  return {
    blob: new Blob([await doc.save()], { type: 'application/pdf' }),
    fileName: 'signed.pdf',
    summary: 'Placed signature text on first page'
  };
}

export async function redactPdf(file) {
  const doc = await PDFDocument.load(await file.arrayBuffer());
  const page = doc.getPages()[0];
  if (page) page.drawRectangle({ x: 40, y: 420, width: 260, height: 40, color: rgb(0, 0, 0) });

  return {
    blob: new Blob([await doc.save()], { type: 'application/pdf' }),
    fileName: 'redacted.pdf',
    summary: 'Applied rectangle redaction overlay'
  };
}

export async function repairPdf(file) {
  const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  return {
    blob: new Blob([await doc.save()], { type: 'application/pdf' }),
    fileName: 'repaired.pdf',
    summary: 'Re-saved PDF structure to repair minor corruption'
  };
}
