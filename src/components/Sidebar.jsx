import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const sections = [
  {
    title: 'Convert',
    items: [
      { id: 'pdf-to-word', label: 'PDF to Word (.docx)' },
      { id: 'pdf-to-excel', label: 'PDF to Excel (.xlsx)' },
      { id: 'pdf-to-ppt', label: 'PDF to PowerPoint (.pptx)' },
      { id: 'pdf-to-images', label: 'PDF to JPG / PNG' },
      { id: 'pdf-to-text', label: 'PDF to Text' },
      { id: 'files-to-pdf', label: 'Office / Images to PDF' },
      { id: 'html-to-pdf', label: 'HTML to PDF' }
    ]
  },
  {
    title: 'OCR',
    items: [
      { id: 'ocr-pdf', label: 'OCR PDF' },
      { id: 'image-to-text', label: 'Image to Text' },
      { id: 'scanned-to-searchable', label: 'Scanned to Searchable PDF' }
    ]
  },
  {
    title: 'Edit & Organize',
    items: [
      { id: 'merge', label: 'Merge PDFs' },
      { id: 'split', label: 'Split PDF' },
      { id: 'compress', label: 'Compress PDF' },
      { id: 'rotate', label: 'Rotate Pages' },
      { id: 'reorder', label: 'Reorder Pages' },
      { id: 'delete', label: 'Delete Pages' },
      { id: 'extract', label: 'Extract Pages' }
    ]
  },
  {
    title: 'Security',
    items: [
      { id: 'add-password', label: 'Add Password Protection' },
      { id: 'remove-password', label: 'Remove Password' },
      { id: 'watermark', label: 'Add Watermark' },
      { id: 'metadata', label: 'Edit Metadata' },
      { id: 'flatten', label: 'Flatten PDF' }
    ]
  },
  {
    title: 'Advanced',
    items: [
      { id: 'sign', label: 'Sign PDF' },
      { id: 'fill-forms', label: 'Fill Forms' },
      { id: 'redact', label: 'Redact' },
      { id: 'page-numbers', label: 'Add Page Numbers' },
      { id: 'header-footer', label: 'Add Header / Footer' },
      { id: 'crop', label: 'Crop Pages' },
      { id: 'repair', label: 'Repair PDF' }
    ]
  }
];

export default function Sidebar({ value, onChange, className, onSelect }) {
  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-y-auto max-h-[calc(100vh-13rem)] lg:max-h-[75vh]">
        {sections.map((section) => (
          <div key={section.title} className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{section.title}</p>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => (
                <Button
                  key={item.id}
                  variant={value === item.id ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => {
                    onChange(item.id);
                    if (onSelect) onSelect(item.id);
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
