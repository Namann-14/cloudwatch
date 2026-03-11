import UploadForm from '@/components/UploadForm';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm select-none">
            R
          </div>
          <span className="font-semibold text-foreground text-lg tracking-tight">
            CloudWatch
          </span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-medium">
            Sales Insight Automator
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-14 pb-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
          Turn Raw Data Into{' '}
          <span className="text-primary">Executive Insights</span>
        </h1>
        <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
          Upload your quarterly sales CSV or Excel file. Our AI will parse it,
          craft a professional narrative, and deliver it straight to your inbox.
        </p>
      </section>

      {/* Steps */}
      <section className="max-w-4xl mx-auto w-full px-4 sm:px-6 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { step: '01', title: 'Upload', body: 'Drag & drop a .csv or .xlsx file up to 5 MB.' },
            { step: '02', title: 'Analyse', body: 'Gemini AI reads your data and writes an executive brief.' },
            { step: '03', title: 'Deliver', body: 'The polished summary lands in your inbox instantly.' },
          ].map(({ step, title, body }) => (
            <div
              key={step}
              className="bg-card border border-border rounded-xl p-5"
            >
              <span className="text-primary font-mono text-xs font-bold">{step}</span>
              <h3 className="mt-1 font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-muted-foreground text-sm">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main form */}
      <section className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pb-20">
        <UploadForm />
      </section>

      <footer className="border-t border-border py-5 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} CloudWatch — Sales Insight Automator
      </footer>
    </main>
  );
}
