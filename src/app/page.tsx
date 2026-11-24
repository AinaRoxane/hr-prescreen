'use client';
import { useState } from 'react';

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

  return (
    <main className='mx-auto max-w-3xl space-y-4 p-6'>
      <h1 className='text-2xl font-bold'>Pré-qualification RH</h1>
      <p className='text-sm text-gray-600'>Données fictives uniquement. Ne collez pas de vrais CV.</p>

      <div>
        <label htmlFor='job-ad' className='text-xs font-medium'>Offre d&apos;emploi</label>
        <textarea id='job-ad' data-testid='job-ad' className='h-40 w-full rounded border p-2' placeholder="Offre d'emploi" value={jobAd} onChange={(e) => setJobAd(e.target.value)} />
      </div>
      <div>
        <label htmlFor='cv' className='text-xs font-medium'>CV du candidat</label>
        <textarea id='cv' data-testid='cv' className='h-40 w-full rounded border p-2' placeholder='CV du candidat' value={cv} onChange={(e) => setCv(e.target.value)} />
      </div>

      <button onClick={analyze} disabled={loading} className='rounded bg-black px-4 py-2 text-white disabled:opacity-50'>
        {loading ? 'Analyse...' : 'Analyser'}
      </button>

      {error && <p role='alert' data-testid='error' className='text-red-600'>{error}</p>}

      {result && (
        <section className='space-y-3 rounded border p-4'>
          {saved !== null && (
            <p data-testid='saved' className='text-xs'>
              {saved ? 'Résultat enregistré.' : 'Résultat non enregistré (base de données indisponible).'}
            </p>
          )}
          <p className='text-xl font-semibold'>Score: <span data-testid='score'>{result.score}/100</span></p>
          <p>{result.summary}</p>
          <div><h2 className='font-semibold'>Points forts</h2><ul className='list-disc pl-5'>{result.strengths.map((s) => <li key={s}>{s}</li>)}</ul></div>
          <div><h2 className='font-semibold'>Écarts</h2><ul className='list-disc pl-5'>{result.gaps.map((s) => <li key={s}>{s}</li>)}</ul></div>
          <div><h2 className='font-semibold'>Questions d&apos;entretien</h2><ul className='list-disc pl-5'>{result.questions.map((s) => <li key={s}>{s}</li>)}</ul></div>
        </section>
      )}
    </main>
  );
}
