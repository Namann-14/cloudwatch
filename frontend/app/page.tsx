import UploadForm from '@/components/UploadForm';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            R
          </div>
          <span className="font-semibold text-slate-100 text-lg tracking-tight">
            Rabbitt AI
          </span>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-medium">
            Sales Insight Automator
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-100 leading-tight">
          Turn Raw Data Into{' '}
          <span className="text-indigo-400">Executive Insights</span>
        </h1>
        <p className="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">
          Upload your quarterly Sales CSV or Excel file. Our AI will parse it,
          craft a professional narrative summary, and deliver it straight to
          your inbox.
        </p>
      </section>

      {/* Steps */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '01', title: 'Upload', body: 'Drag & drop a .csv or .xlsx file (up to 5 MB).' },
            { step: '02', title: 'Analyse', body: 'Gemini AI reads your data and generates an executive brief.' },
            { step: '03', title: 'Deliver', body: 'The summary lands in your inbox within seconds.' },
          ].map(({ step, title, body }) => (
            <div
              key={step}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5"
            >
              <span className="text-indigo-500 font-mono text-xs font-bold">{step}</span>
              <h3 className="mt-1 font-semibold text-slate-100">{title}</h3>
              <p className="mt-1 text-slate-400 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pb-20">
        <UploadForm />
      </section>

      <footer className="border-t border-slate-800 py-6 text-center text-slate-600 text-sm">
        © {new Date().getFullYear()} Rabbitt AI — Sales Insight Automator
      </footer>
    </main>
  );
}
