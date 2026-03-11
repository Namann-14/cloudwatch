'use client';

import { useState, useRef, DragEvent, ChangeEvent, FormEvent } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Status = 'idle' | 'processing' | 'success' | 'error';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(f: File): string | null {
  const ext = f.name.split('.').pop()?.toLowerCase();
  if (!ext || !['csv', 'xlsx'].includes(ext)) {
    return 'Only .csv and .xlsx files are accepted.';
  }
  if (f.size > 5 * 1024 * 1024) {
    return 'File size must be under 5 MB.';
  }
  return null;
}

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File) {
    const err = validateFile(f);
    if (err) {
      setStatus('error');
      setMessage(err);
      return;
    }
    setFile(f);
    setStatus('idle');
    setMessage('');
  }

  function removeFile() {
    setFile(null);
    setStatus('idle');
    setMessage('');
    setSummary('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) pickFile(dropped);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) pickFile(selected);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!file) {
      setStatus('error');
      setMessage('Please select a file to upload.');
      return;
    }
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter a recipient email address.');
      return;
    }

    setStatus('processing');
    setMessage('');
    setSummary('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email.trim());

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = (await res.json()) as {
        success: boolean;
        message?: string;
        summary?: string;
        error?: string;
      };

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed. Please try again.');
      }

      setStatus('success');
      setMessage(data.message ?? 'Summary sent successfully!');
      setSummary(data.summary ?? '');
    } catch (err) {
      setStatus('error');
      setMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred.',
      );
    }
  }

  const isProcessing = status === 'processing';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate AI Sales Summary</CardTitle>
        <CardDescription>
          Upload a .csv or .xlsx file and enter a recipient email to receive
          your AI-generated executive brief.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* ── File drop zone ───────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Sales Data File
            </label>

            {file ? (
              /* File selected preview */
              <div className="flex items-center gap-4 border border-primary/40 bg-primary/10 rounded-lg p-4">
                <FileSpreadsheet className="size-8 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatBytes(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  aria-label="Remove file"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <X />
                </Button>
              </div>
            ) : (
              /* Drag & drop zone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === 'Enter' && fileInputRef.current?.click()
                }
                className={[
                  'flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-10 cursor-pointer select-none transition-colors duration-200',
                  isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/60 hover:bg-primary/5',
                ].join(' ')}
              >
                <UploadCloud
                  className={`size-10 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`}
                />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Drag &amp; drop your file here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or{' '}
                    <span className="text-primary underline underline-offset-2">
                      browse
                    </span>{' '}
                    to select
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    Supports .csv and .xlsx — max 5 MB
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="hidden"
              aria-hidden="true"
            />
          </div>

          {/* ── Email input ──────────────────────────────────────────── */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Recipient Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="executive@company.com"
              disabled={isProcessing}
              autoComplete="email"
            />
          </div>

          {/* ── Status feedback ──────────────────────────────────────── */}
          {status === 'error' && message && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {status === 'success' && message && (
            <Alert variant="success">
              <CheckCircle2 />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* ── Submit ──────────────────────────────────────────────── */}
          <Button
            type="submit"
            size="lg"
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" />
                Analysing &amp; sending email…
              </>
            ) : (
              'Generate &amp; Send Summary'
            )}
          </Button>
        </form>

        {/* ── AI summary preview ─────────────────────────────────────── */}
        {status === 'success' && summary && (
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              AI-Generated Summary Preview
            </p>
            <div className="bg-secondary/40 rounded-lg p-5 text-sm text-foreground/90 leading-7 whitespace-pre-wrap">
              {summary}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
