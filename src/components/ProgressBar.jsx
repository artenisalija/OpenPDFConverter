import React from 'react';
import { Progress } from './ui/progress';

export default function ProgressBar({ value, label }) {
  if (value <= 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <Progress value={value} />
    </div>
  );
}
