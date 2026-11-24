import { NextResponse } from 'next/server';
import { ScreeningInputSchema } from '@/lib/schema';
import { screenCandidate } from '@/lib/ai';
import { allow } from '@/lib/rateLimit';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!allow(ip)) {
    return NextResponse.json({ error: 'Trop de requêtes, réessayez dans une minute.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const input = ScreeningInputSchema.safeParse(body);
  if (!input.success) {
    return NextResponse.json(
      { error: 'Entrée invalide: 50 à 8000 caractères pour l\'offre et pour le CV.' },
      { status: 400 },
    );
  }

  try {
    const result = await screenCandidate(input.data.jobAd, input.data.cv);
    const { data, error } = await supabaseAdmin()
      .from('screenings')
      .insert({ score: result.score, result })
      .select('id')
      .single();
    const saved = !error;
    if (error) console.error('db insert failed:', error.message);
    return NextResponse.json({ id: data?.id ?? null, saved, result });
  } catch (e) {
    console.error('screening failed:', e instanceof Error ? e.message : 'unknown');
    return NextResponse.json({ error: 'L\'analyse a échoué, réessayez.' }, { status: 502 });
  }
}
