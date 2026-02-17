import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

const splitModes = [
  { value: 'range', label: 'Page Range (e.g. 1-3)' },
  { value: 'every-n', label: 'Every N pages' },
  { value: 'single', label: 'Individual pages' }
];

export default function ToolOptions({ tool, options, onChange }) {
  const set = (key) => (event) => onChange({ ...options, [key]: event.target.value });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tool Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(tool === 'ocr-pdf' || tool === 'image-to-text' || tool === 'scanned-to-searchable') && (
          <div className="space-y-1">
            <Label>OCR Languages</Label>
            <Input value={options.languages || 'eng'} onChange={set('languages')} placeholder="eng+spa" />
          </div>
        )}

        {tool === 'split' && (
          <>
            <div className="space-y-1">
              <Label>Split Mode</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={options.splitMode || 'range'}
                onChange={set('splitMode')}
              >
                {splitModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Range / N</Label>
              <Input value={options.range || '1-2'} onChange={set('range')} />
            </div>
          </>
        )}

        {tool === 'rotate' && (
          <div className="space-y-1">
            <Label>Rotation Degrees</Label>
            <Input type="number" value={options.degrees || 90} onChange={set('degrees')} />
          </div>
        )}

        {(tool === 'delete' || tool === 'extract' || tool === 'reorder') && (
          <div className="space-y-1">
            <Label>Page List</Label>
            <Input value={options.pages || '1,3'} onChange={set('pages')} />
          </div>
        )}

        {tool === 'watermark' && (
          <div className="space-y-1">
            <Label>Watermark Text</Label>
            <Input value={options.text || 'CONFIDENTIAL'} onChange={set('text')} />
          </div>
        )}

        {tool === 'metadata' && (
          <>
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={options.title || ''} onChange={set('title')} />
            </div>
            <div className="space-y-1">
              <Label>Author</Label>
              <Input value={options.author || ''} onChange={set('author')} />
            </div>
            <div className="space-y-1">
              <Label>Subject</Label>
              <Input value={options.subject || ''} onChange={set('subject')} />
            </div>
            <div className="space-y-1">
              <Label>Keywords</Label>
              <Input value={options.keywords || ''} onChange={set('keywords')} />
            </div>
          </>
        )}

        {tool === 'sign' && (
          <div className="space-y-1">
            <Label>Signature Text</Label>
            <Input value={options.signature || 'Signed'} onChange={set('signature')} />
          </div>
        )}

        {tool === 'html-to-pdf' && (
          <div className="space-y-1">
            <Label>HTML</Label>
            <Textarea
              rows={7}
              value={options.html || '<h1>HTML to PDF</h1><p>Edit this HTML.</p>'}
              onChange={set('html')}
            />
          </div>
        )}

        {tool === 'page-numbers' && (
          <div className="space-y-1">
            <Label>Start Number</Label>
            <Input type="number" value={options.start || 1} onChange={set('start')} />
          </div>
        )}

        {tool === 'header-footer' && (
          <>
            <div className="space-y-1">
              <Label>Header</Label>
              <Input value={options.header || ''} onChange={set('header')} />
            </div>
            <div className="space-y-1">
              <Label>Footer</Label>
              <Input value={options.footer || ''} onChange={set('footer')} />
            </div>
          </>
        )}

        {tool === 'crop' && (
          <>
            <div className="space-y-1">
              <Label>Crop Left</Label>
              <Input type="number" value={options.left || 0} onChange={set('left')} />
            </div>
            <div className="space-y-1">
              <Label>Crop Right</Label>
              <Input type="number" value={options.right || 0} onChange={set('right')} />
            </div>
            <div className="space-y-1">
              <Label>Crop Top</Label>
              <Input type="number" value={options.top || 0} onChange={set('top')} />
            </div>
            <div className="space-y-1">
              <Label>Crop Bottom</Label>
              <Input type="number" value={options.bottom || 0} onChange={set('bottom')} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
