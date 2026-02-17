import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export default function UploadZone({ files, onFiles, tool, onToolChange, toolOptions }) {
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef(null);

  const handleDrop = React.useCallback(
    (event) => {
      event.preventDefault();
      setDragging(false);
      onFiles(Array.from(event.dataTransfer.files));
    },
    [onFiles]
  );

  return (
    <Card
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={dragging ? 'border-primary' : ''}
    >
      <CardHeader>
        <CardTitle>Upload Files</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm">Drag and drop files here</p>
        <p className="mb-4 mt-1 text-xs text-muted-foreground">or click to choose files</p>
        <div className="mx-auto mb-3 block max-w-md text-left lg:hidden">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Service</label>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={tool}
            onChange={(event) => onToolChange(event.target.value)}
          >
            {toolOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={(event) => onFiles(Array.from(event.target.files || []))}
          className="hidden"
        />
        <Button onClick={() => inputRef.current?.click()}>Browse Files</Button>
        {files.length > 0 && <p className="mt-3 text-sm text-muted-foreground">{files.length} file(s) selected</p>}
      </CardContent>
    </Card>
  );
}
