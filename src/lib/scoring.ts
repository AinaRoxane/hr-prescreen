import type { Requirement } from './schema';

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

export function verify(reqs: Requirement[], cv: string): Requirement[] {
    const text = norm(cv);
    return reqs.map((r) => {
        if (r.status === 'missing') return r;
        const ok = r.evidence.length >= 8 && text.includes(norm(r.evidence));
        return ok ? r : { ...r, status: 'missing' as const, evidence: '' };
    });
}

const POINTS = { confirmed: 1, partial: 0.5, training: 0.4, missing: 0 } as const;

export function computeScore(reqs: Requirement[]): number {
    const weight = (r: Requirement) => (r.essential ? 3 : 1);
    const total = reqs.reduce((s, r) => s + weight(r), 0);
    const got = reqs.reduce((s, r) => s + weight(r) * POINTS[r.status], 0);
    let score = Math.round((got / total) * 100);
    const essential = reqs.filter((r) => r.essential);
    if (essential.some((r) => r.status === 'missing')) score = Math.min(score, 69);
    else if (essential.some((r) => r.status === 'training' || r.status === 'partial')) {
        score = Math.min(score, 75);
    }
    if (essential.length === 0) score = Math.min(score, 85);
    return score;
}

export function deriveLists(reqs: Requirement[]) {
    return {
        strengths: reqs.filter((r) => r.status === 'confirmed').map((r) => `${r.requirement} (CV: "${r.evidence}")`),
        gaps: reqs.filter((r) => r.status !== 'confirmed').map((r) => `${r.requirement}: ${r.status}`),
    };
}