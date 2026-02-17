import React from 'react';
import { Button } from './ui/button';

export default function DownloadButton({ result, onReset }) {
  if (!result) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Button onClick={result.download}>Download {result.fileName}</Button>
      <Button variant="outline" onClick={onReset}>
        Process Another File
      </Button>
      <p className="w-full text-sm text-muted-foreground">Finished: {result.summary}</p>
    </div>
  );
}
