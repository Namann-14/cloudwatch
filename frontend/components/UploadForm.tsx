'use client';

import { useState, useRef, DragEvent, ChangeEvent, FormEvent } from 'react';

type Status = 'idle' | 'processing' | 'success' | 'error';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function FileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-10 h-10 text-indigo-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-10 h-10 text-slate-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin w-5 h-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
      />
    </svg>
  );
}

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED = ['.csv', '.xlsx'];

  function validateFile(f: File): string | null {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!ext || !ACCEPTED.includes(`.${ext}`)) {
      return 'Only .csv and .xlsx files are accepted.';
    }
    if (f.size > 5 * 1024 * 1024) {
      return 'File must be under 5 MB.';
    }
    return null;
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
    if (!dropped) return;
    const err = validateFile(dropped);
    if (err) {
      setStatus('error');
      setMessage(err);
      return;
    }
    setFile(dropped);
    setStatus('idle');
    setMessage('');
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const err = validateFile(selected);
    if (err) {
      setStatus('error');
      setMessage(err);
      return;
    }
    setFile(selected);
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
      setMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  }

  const isProcessing = status === 'processing';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
      <h2 className="text-xl font-semibold text-slate-100 mb-6">
        Generate AI Sales Summary
      </h2>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Drop Zone */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Sales Data File
          </label>

          {file ? (
            /* File selected preview */
            <div className="flex items-center gap-4 border border-indigo-700 bg-indigo-950/40 rounded-xl p-4">
              <FileIcon />
              <div className="flex-1 min-w-0">
                <p className="text-slate-100 font-medium truncate">{file.name}</p>
                <p className="text-slate-400 text-sm">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-slate-500 hover:text-red-400 transition-colors text-xs font-medium shrink-0"
                aria-label="Remove file"
              >
                Remove
              </button>
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
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              className={`
                flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-10 cursor-pointer
                transition-colors duration-200 select-none
                ${isDragging
                  ? 'border-indigo-500 bg-indigo-950/50'
                  : 'border-slate-700 bg-slate-800/40 hover:border-indigo-600 hover:bg-slate-800/70'
                }
              `}
            >
              <UploadIcon />
              <div className="text-center">
                <p className="text-slate-300 font-medium">
                  Drag &amp; drop your file here
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  or <span className="text-indigo-400 underline">browse</span> to select
                </p>
                <p className="text-slate-600 text-xs mt-2">
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

        {/* Email input */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Recipient Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="executive@company.com"
            disabled={isProcessing}
            autoComplete="email"
            className="
              w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3
              text-slate-100 placeholder-slate-500 text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition
            "
          />
        </div>

        {/* Status feedback */}
        {(status === 'error' || status === 'success') && message && (
          <div
            className={`
              flex items-start gap-3 rounded-xl p-4 text-sm
              ${status === 'success'
                ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                : 'bg-red-950/60 border border-red-800 text-red-300'
              }
            `}
            role="alert"
          >
            <span className="mt-0.5 text-base leading-none">
              {status === 'success' ? '✓' : '✕'}
            </span>
            <span>{message}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="
            w-full flex items-center justify-center gap-2
            bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700
            disabled:opacity-60 disabled:cursor-not-allowed
            text-white font-semibold rounded-xl px-6 py-3.5
            transition-colors duration-200 shadow-lg shadow-indigo-900/30
          "
        >
          {isProcessing ? (
            <>
              <Spinner />
              <span>Analysing &amp; sending email…</span>
            </>
          ) : (
            <span>Generate &amp; Send Summary</span>
          )}
        </button>
      </form>

      {/* AI Summary preview */}
      {status === 'success' && summary && (
        <div className="mt-8 border-t border-slate-800 pt-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
            AI-Generated Summary Preview
          </h3>
          <div className="bg-slate-800/60 rounded-xl p-5 text-slate-300 text-sm leading-7 whitespace-pre-wrap">
            {summary}
          </div>
        </div>
      )}
    </div>
  );
}
