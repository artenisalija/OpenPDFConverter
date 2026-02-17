import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import * as XLSX from 'xlsx';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function extractPdfPageText(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(' ').trim();
    pages.push(text || '[No text detected on this page]');
  }

  return pages;
}

export async function pdfToText(file) {
  const pages = await extractPdfPageText(file);
  let text = '';

  pages.forEach((pageText, index) => {
    text += `\n\n--- Page ${index + 1} ---\n${pageText}`;
  });

  const blob = new Blob([text.trim()], { type: 'text/plain;charset=utf-8' });
  return {
    blob,
    fileName: `${file.name.replace(/\.pdf$/i, '')}.txt`,
    summary: 'Extracted text from PDF'
  };
}

export async function pdfToWord(file) {
  const pages = await extractPdfPageText(file);

  const paragraphs = [];
  pages.forEach((pageText, index) => {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: `Page ${index + 1}`, bold: true })]
      })
    );

    pageText.split(/\n+/).forEach((line) => {
      if (line.trim()) paragraphs.push(new Paragraph(line.trim()));
    });

    paragraphs.push(new Paragraph(''));
  });

  const doc = new Document({
    sections: [{ children: paragraphs }]
  });

  const blob = await Packer.toBlob(doc);
  return {
    blob,
    fileName: `${file.name.replace(/\.pdf$/i, '')}.docx`,
    summary: `Created DOCX from ${pages.length} PDF page(s)`
  };
}

export async function pdfToExcel(file) {
  const pages = await extractPdfPageText(file);
  const wb = XLSX.utils.book_new();

  pages.forEach((pageText, index) => {
    const rows = pageText
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, rowIndex) => [rowIndex + 1, line]);

    const data = [['Line', 'Text'], ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, `Page${index + 1}`.slice(0, 31));
  });

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return {
    blob: new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }),
    fileName: `${file.name.replace(/\.pdf$/i, '')}.xlsx`,
    summary: `Created XLSX with ${pages.length} worksheet(s)`
  };
}

export async function pdfToPowerPoint(file) {
  const pages = await extractPdfPageText(file);
  const zip = new JSZip();

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${pages
    .map(
      (_, i) =>
        `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
    )
    .join('\n  ')}
</Types>`
  );

  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`
  );

  zip.file(
    'docProps/app.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Open PDF Converter</Application>
</Properties>`
  );

  zip.file(
    'docProps/core.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Converted from PDF</dc:title>
  <dc:creator>Open PDF Converter</dc:creator>
</cp:coreProperties>`
  );

  zip.file(
    'ppt/presentation.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldIdLst>
    ${pages.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 1}"/>`).join('\n    ')}
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000" type="screen4x3"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`
  );

  zip.file(
    'ppt/_rels/presentation.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${pages
    .map(
      (_, i) =>
        `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`
    )
    .join('\n  ')}
</Relationships>`
  );

  pages.forEach((pageText, index) => {
    const safeText = escapeXml(pageText.slice(0, 8000));
    zip.file(
      `ppt/slides/slide${index + 1}.xml`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title 1"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="457200" y="274320"/>
            <a:ext cx="8229600" cy="5486400"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="2000"/>
              <a:t>${safeText}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>`
    );
  });

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  });

  return {
    blob,
    fileName: `${file.name.replace(/\.pdf$/i, '')}.pptx`,
    summary: `Created PPTX with ${pages.length} slide(s)`
  };
}

export async function pdfToImages(file, format = 'png') {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const zip = new JSZip();

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

    const dataUrl = canvas.toDataURL(`image/${format}`);
    const base64 = dataUrl.split(',')[1];
    zip.file(`page-${i}.${format}`, base64, { base64: true });
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  return {
    blob,
    fileName: `${file.name.replace(/\.pdf$/i, '')}-${format}-pages.zip`,
    summary: `Rendered ${pdf.numPages} page(s) as images`
  };
}

export async function imagesToPdf(files) {
  if (!files.length) throw new Error('No image files selected for PDF conversion.');
  const doc = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const image = file.type.includes('png') ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);

    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }

  const blob = new Blob([await doc.save()], { type: 'application/pdf' });
  return {
    blob,
    fileName: 'images-to-pdf.pdf',
    summary: `Combined ${files.length} image(s) into PDF`
  };
}

export async function htmlToPdf(htmlString) {
  const doc = new jsPDF();
  await doc.html(htmlString, { x: 10, y: 10, width: 180 });
  const blob = doc.output('blob');
  return {
    blob,
    fileName: 'html-to-pdf.pdf',
    summary: 'Generated PDF from HTML'
  };
}

export function saveResult(result) {
  saveAs(result.blob, result.fileName);
}
