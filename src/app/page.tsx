'use client';
import { useState } from 'react';
import BigSquare from '@/components/BigSquare';

type Result = {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  questions: string[];
};

export default function Home() {
  const [jobAd, setJobAd] = useState('');
  const [cv, setCv] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(null);
    try {
      const res = await fetch('/api/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobAd, cv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur inconnue');
      setResult(data.result);
      setSaved(data.saved ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setSaved(null);
    setError(null);
  }

  const scoreColor = result
    ? result.score >= 75
      ? 'text-green-500'
      : result.score >= 50
        ? 'text-blue-600'
        : 'text-orange-500'
    : '';
  const barColor = result
    ? result.score >= 75
      ? 'bg-green-500'
      : result.score >= 50
        ? 'bg-blue-600'
        : 'bg-orange-500'
    : '';

  return (
    <main className="min-h-screen font-sans flex flex-col">

      {/* ── HEADER ROW ─────────────────────────────────── */}
      <header>
        <div className="mx-auto w-full max-w-7xl px-6 py-5 flex items-center justify-between">
          <a
            href="https://www.roxaina.me"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-xl font-display font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            roxaina.me
          </a>
        </div>
      </header>

      {/* ── BODY ROW ───────────────────────────────────── */}
      <div className="mx-auto w-full max-w-7xl px-6 py-2 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch w-full">

          {/* LEFT COL — 4/12 */}
          <aside className="lg:col-span-4 flex flex-col justify-between gap-12">
            {/* top-part */}
            <div>
              <h1 className="text-[6rem] lg:text-[8rem] mt-2 font-display font-bold leading-[0.8] tracking-tighter text-blue-600">
                RH
              </h1>
              <h2 className="text-xl lg:text-2xl font-display font-medium text-gray-900 mt-4">
                Pré-qualification
              </h2>
              <p className="text-sm text-gray-500 mt-4 leading-relaxed max-w-sm">
                Comparez une offre d'emploi et un CV, scorez le candidat et enregistrez le résultat sans jamais stocker le texte du CV. Données fictives uniquement.
              </p>
            </div>
            {/* bottom-part */}
            <div className="flex">
              <div className="w-48 lg:w-64">
                <BigSquare />
              </div>
            </div>
          </aside>

          {/* RIGHT COL — 8/12 */}
          <section className="lg:col-span-8 flex flex-col">
            {!result ? (
              /* ── FORM VIEW (before click) ───────────────── */
              <div className="flex flex-col flex-grow min-h-[540px] lg:min-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 flex-grow">
                  <div className="flex flex-col w-full">
                    <label
                      htmlFor="job-ad"
                      className="text-sm font-display font-semibold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wider"
                    >
                      <span className="text-gray-300 font-light text-xl">/</span> Offre d'emploi
                    </label>
                    <textarea
                      id="job-ad"
                      data-testid="job-ad"
                      className="flex-grow w-full resize-none rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 shadow-sm"
                      placeholder="Collez l'offre d'emploi ici..."
                      value={jobAd}
                      onChange={(e) => setJobAd(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col w-full">
                    <label
                      htmlFor="cv"
                      className="text-sm font-display font-semibold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wider"
                    >
                      <span className="text-gray-300 font-light text-xl">/</span> Mon CV
                    </label>
                    <textarea
                      id="cv"
                      data-testid="cv"
                      className="flex-grow w-full resize-none rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 shadow-sm"
                      placeholder="Collez le CV du candidat ici..."
                      value={cv}
                      onChange={(e) => setCv(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col items-end mt-6">
                  {error && (
                    <p
                      role="alert"
                      data-testid="error"
                      className="text-red-500 text-sm font-medium mb-4 bg-red-50 px-3 py-1.5 rounded-md"
                    >
                      {error}
                    </p>
                  )}
                  <button
                    onClick={analyze}
                    disabled={loading || !jobAd || !cv}
                    className="group inline-flex items-center justify-center min-w-[150px] gap-2 bg-black text-white px-8 py-3.5 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {loading ? (
                      <>
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Analyse...
                      </>
                    ) : (
                      <>
                        Analyser
                        <svg
                          className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* ── RESULTS VIEW (after click) ────────────── */
              <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Result header row */}
                <div className="flex flex-wrap justify-between items-end gap-4">
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
                  >
                    <svg
                      className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Modifier
                  </button>
                </div>

                {/* Score + Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                  <div className="lg:col-span-5 border border-gray-200 bg-white rounded-2xl p-8 shadow-sm">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">
                      Score global
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span
                        data-testid="score"
                        className={`text-[5.5rem] font-display font-bold leading-none tracking-tighter ${scoreColor}`}
                      >
                        {result.score}
                      </span>
                      <span className="text-2xl text-gray-300 font-display font-medium">/100</span>
                    </div>
                    <div className="mt-6 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                        style={{ width: `${result.score}%` }}
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-7 flex items-center border border-gray-200 bg-white rounded-2xl p-8 shadow-sm">
                    <p className="text-lg lg:text-xl text-gray-900 leading-relaxed font-medium">
                      "{result.summary}"
                    </p>
                  </div>
                </div>

                {/* Strengths + Gaps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:p-8 shadow-sm">
                    <h3 className="text-lg font-display font-bold text-gray-900 mb-5 flex items-center gap-2">
                      <span className="text-gray-300 font-light">/</span> Points forts
                    </h3>
                    <ul className="space-y-3">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="flex gap-3 items-start">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span className="text-gray-600 text-sm leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:p-8 shadow-sm">
                    <h3 className="text-lg font-display font-bold text-gray-900 mb-5 flex items-center gap-2">
                      <span className="text-gray-300 font-light">/</span> Écarts
                    </h3>
                    <ul className="space-y-3">
                      {result.gaps.map((s, i) => (
                        <li key={i} className="flex gap-3 items-start">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500 border border-orange-100">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </span>
                          <span className="text-gray-600 text-sm leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Questions */}
                <div>
                  <h3 className="text-lg font-display font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <span className="text-gray-300 font-light">/</span> Questions d'entretien
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.questions.map((q, i) => (
                      <div
                        key={i}
                        className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-200 hover:shadow transition-all"
                      >
                        <p className="font-medium text-gray-900 text-sm leading-relaxed flex gap-3">
                          <span className="shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-md bg-blue-50 text-blue-600 font-display font-bold text-[11px]">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span>{q}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ── FOOTER ROW ─────────────────────────────────── */}
      <footer>
        <div className="mx-auto w-full max-w-7xl px-6 py-6 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
          <span>© Roxane Aina — Tous droits réservés</span>
        </div>
      </footer>
    </main>
  );
}