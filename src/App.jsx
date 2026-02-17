import React from 'react';
import Sidebar from './components/Sidebar';
import UploadZone from './components/UploadZone';
import PreviewPanel from './components/PreviewPanel';
import ToolOptions from './components/ToolOptions';
import ProgressBar from './components/ProgressBar';
import DownloadButton from './components/DownloadButton';
import usePdfWorker from './hooks/usePdfWorker';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { Badge } from './components/ui/badge';
import {
  htmlToPdf,
  imagesToPdf,
  pdfToImages,
  pdfToText,
  pdfToWord,
  pdfToExcel,
  pdfToPowerPoint,
  saveResult
} from './tools/convert';
import { imageToText, ocrPdfToText, scannedPdfToSearchable } from './tools/ocr';
import {
  compressPdf,
  deletePages,
  extractPages,
  mergePdfs,
  reorderPages,
  rotatePdf,
  splitPdf
} from './tools/organize';
import {
  addPasswordProtection,
  addWatermark,
  flattenPdf,
  removePasswordProtection,
  updateMetadata
} from './tools/security';
import {
  addHeaderFooter,
  addPageNumbers,
  cropPages,
  fillPdfForms,
  redactPdf,
  repairPdf,
  signPdf
} from './tools/advanced';

const MAX_WARN_MB = 200;
const TOOL_OPTIONS = [
  { id: 'pdf-to-word', label: 'PDF to Word (.docx)' },
  { id: 'pdf-to-excel', label: 'PDF to Excel (.xlsx)' },
  { id: 'pdf-to-ppt', label: 'PDF to PowerPoint (.pptx)' },
  { id: 'pdf-to-images', label: 'PDF to JPG / PNG' },
  { id: 'pdf-to-text', label: 'PDF to Text' },
  { id: 'files-to-pdf', label: 'Office / Images to PDF' },
  { id: 'html-to-pdf', label: 'HTML to PDF' },
  { id: 'ocr-pdf', label: 'OCR PDF' },
  { id: 'image-to-text', label: 'Image to Text' },
  { id: 'scanned-to-searchable', label: 'Scanned to Searchable PDF' },
  { id: 'merge', label: 'Merge PDFs' },
  { id: 'split', label: 'Split PDF' },
  { id: 'compress', label: 'Compress PDF' },
  { id: 'rotate', label: 'Rotate Pages' },
  { id: 'reorder', label: 'Reorder Pages' },
  { id: 'delete', label: 'Delete Pages' },
  { id: 'extract', label: 'Extract Pages' },
  { id: 'add-password', label: 'Add Password Protection' },
  { id: 'remove-password', label: 'Remove Password' },
  { id: 'watermark', label: 'Add Watermark' },
  { id: 'metadata', label: 'Edit Metadata' },
  { id: 'flatten', label: 'Flatten PDF' },
  { id: 'sign', label: 'Sign PDF' },
  { id: 'fill-forms', label: 'Fill Forms' },
  { id: 'redact', label: 'Redact' },
  { id: 'page-numbers', label: 'Add Page Numbers' },
  { id: 'header-footer', label: 'Add Header / Footer' },
  { id: 'crop', label: 'Crop Pages' },
  { id: 'repair', label: 'Repair PDF' }
];

function makeDownloadable(result) {
  return {
    ...result,
    download: () => saveResult(result)
  };
}

export default function App() {
  const workerRef = usePdfWorker();
  const [tool, setTool] = React.useState('merge');
  const [files, setFiles] = React.useState([]);
  const [options, setOptions] = React.useState({ splitMode: 'range', range: '1-2', languages: 'eng' });
  const [progress, setProgress] = React.useState(0);
  const [status, setStatus] = React.useState('');
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState('');

  const first = files[0] || null;

  const onFiles = React.useCallback((nextFiles) => {
    if (!nextFiles.length) return;

    const tooLarge = nextFiles.find((file) => file.size / (1024 * 1024) > MAX_WARN_MB);
    if (tooLarge) {
      setError(`Warning: ${tooLarge.name} is very large and may process slowly in browser.`);
    }

    setFiles(nextFiles);
    setResult(null);
    setProgress(0);
    setStatus('Ready');
  }, []);

  const runTool = React.useCallback(async () => {
    if (!files.length) {
      setError('Please upload at least one file.');
      return;
    }

    const needsPdf = !['files-to-pdf', 'image-to-text', 'html-to-pdf'].includes(tool);
    if (needsPdf && files.some((file) => file.type !== 'application/pdf')) {
      setError('Selected tool expects PDF file(s).');
      return;
    }

    try {
      setResult(null);
      setProgress(10);
      setStatus('Starting...');

      const execute = async () => {
        setProgress(30);
        setStatus('Processing...');

        switch (tool) {
          case 'merge':
            return mergePdfs(files);
          case 'split':
            return splitPdf(first, options.splitMode, options.range);
          case 'compress':
            return compressPdf(first);
          case 'rotate':
            return rotatePdf(first, options.degrees || 90);
          case 'reorder':
            return reorderPages(first, options.pages || '1');
          case 'delete':
            return deletePages(first, options.pages || '1');
          case 'extract':
            return extractPages(first, options.pages || '1');
          case 'watermark':
            return addWatermark(first, options.text || 'CONFIDENTIAL');
          case 'metadata':
            return updateMetadata(first, options);
          case 'flatten':
            return flattenPdf(first);
          case 'add-password':
            return addPasswordProtection();
          case 'remove-password':
            return removePasswordProtection();
          case 'ocr-pdf':
            return ocrPdfToText(first, options.languages || 'eng');
          case 'image-to-text':
            return imageToText(first, options.languages || 'eng');
          case 'scanned-to-searchable':
            return scannedPdfToSearchable(first, options.languages || 'eng');
          case 'pdf-to-text':
            return pdfToText(first);
          case 'pdf-to-images':
            return pdfToImages(first, 'png');
          case 'files-to-pdf':
            return imagesToPdf(files.filter((f) => /image\/(png|jpeg|jpg)/i.test(f.type)));
          case 'html-to-pdf':
            return htmlToPdf(options.html || '<h1>HTML to PDF</h1><p>Edit Tool Options to customize.</p>');
          case 'pdf-to-word':
            return pdfToWord(first);
          case 'pdf-to-excel':
            return pdfToExcel(first);
          case 'pdf-to-ppt':
            return pdfToPowerPoint(first);
          case 'sign':
            return signPdf(first, options.signature || 'Signed');
          case 'fill-forms':
            return fillPdfForms(first, {});
          case 'redact':
            return redactPdf(first);
          case 'page-numbers':
            return addPageNumbers(first, options.start || 1);
          case 'header-footer':
            return addHeaderFooter(first, options.header || '', options.footer || '');
          case 'crop':
            return cropPages(first, options);
          case 'repair':
            return repairPdf(first);
          default:
            throw new Error('Tool is not implemented yet.');
        }
      };

      const output = await workerRef.current.post(execute);
      setProgress(100);
      setStatus('Done');
      setResult(makeDownloadable(output));
    } catch (err) {
      setProgress(0);
      setStatus('Failed');
      setError(err.message || 'Processing failed.');
    }
  }, [files, first, options, tool, workerRef]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/30 pb-8">
      <header className="border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-base font-bold sm:text-xl">Open PDF Converter</h1>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              100% Client-Side
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-9 px-3 text-xs sm:text-sm"
              onClick={() => window.open('https://github.com/yourusername/your-repo-name', '_blank')}
            >
              GitHub
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 px-4 pt-4 sm:px-6 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <Sidebar value={tool} onChange={setTool} />
        </aside>

        <section className="space-y-4 lg:col-span-9">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm">
                Your files are processed locally in your browser and are never uploaded to any server.
              </p>
            </CardContent>
          </Card>

          <UploadZone
            files={files}
            onFiles={onFiles}
            tool={tool}
            onToolChange={setTool}
            toolOptions={TOOL_OPTIONS}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
            <div className="space-y-4">
              <ToolOptions tool={tool} options={options} onChange={setOptions} />
              <Button className="w-full sm:w-auto" onClick={runTool}>
                Run Tool
              </Button>
              <ProgressBar value={progress} label={status} />
              <DownloadButton
                result={result}
                onReset={() => {
                  setFiles([]);
                  setResult(null);
                  setProgress(0);
                  setStatus('Ready');
                }}
              />
            </div>
            <PreviewPanel file={first} />
          </div>
        </section>
      </main>

      {error && (
        <div className="fixed bottom-4 left-2 right-2 z-50 sm:left-auto sm:right-4 sm:w-[min(95vw,420px)]">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <div className="mt-3">
              <Button variant="outline" onClick={() => setError('')}>
                Dismiss
              </Button>
            </div>
          </Alert>
        </div>
      )}
    </div>
  );
}
