# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: screen.spec.ts >> shows an error when the API fails
- Location: e2e/screen.spec.ts:27:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('alert')
Expected: visible
Error: strict mode violation: getByRole('alert') resolved to 2 elements:
    1) <p role="alert" class="text-red-600">L'analyse a échoué, réessayez.</p> aka getByText('L\'analyse a échoué, réessayez.')
    2) <div role="alert" aria-live="assertive" id="__next-route-announcer__"></div> aka locator('[id="__next-route-announcer__"]')

Call log:
  - Expect "toBeVisible" getByRole('alert') with timeout 5000ms
  - waiting for getByRole('alert')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - heading "Pré-qualification RH" [level=1] [ref=e3]
    - paragraph [ref=e4]: Données fictives uniquement. Ne collez pas de vrais CV.
    - textbox "Offre d'emploi" [ref=e5]: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    - textbox "CV du candidat" [ref=e6]: yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
    - button "Analyser" [ref=e7]
    - alert [ref=e8]: L'analyse a échoué, réessayez.
  - generic [ref=e13] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e14]
    - generic [ref=e18]:
      - button "Open Next.js Dev Tools" [ref=e19]: Cache disabled
      - button "Collapse Cache disabled badge" [ref=e20]
  - alert [ref=e23]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('shows the screening result', async ({ page }) => {
  4  |   await page.route('**/api/screen', (route) =>
  5  |     route.fulfill({
  6  |       json: {
  7  |         id: null,
  8  |         result: {
  9  |           score: 78,
  10 |           summary: 'Bon profil.',
  11 |           strengths: ['Spring Boot'],
  12 |           gaps: ['Kubernetes'],
  13 |           questions: ['Parlez-nous de Mijery ID.'],
  14 |         },
  15 |       },
  16 |     }),
  17 |   );
  18 | 
  19 |   await page.goto('/');
  20 |   await page.getByTestId('job-ad').fill('x'.repeat(60));
  21 |   await page.getByTestId('cv').fill('y'.repeat(60));
  22 |   await page.getByRole('button', { name: 'Analyser' }).click();
  23 | 
  24 |   await expect(page.getByTestId('score')).toHaveText('78/100');
  25 | });
  26 | 
  27 | test('shows an error when the API fails', async ({ page }) => {
  28 |   await page.route('**/api/screen', (route) =>
  29 |     route.fulfill({ status: 502, json: { error: 'L\'analyse a échoué, réessayez.' } }),
  30 |   );
  31 | 
  32 |   await page.goto('/');
  33 |   await page.getByTestId('job-ad').fill('x'.repeat(60));
  34 |   await page.getByTestId('cv').fill('y'.repeat(60));
  35 |   await page.getByRole('button', { name: 'Analyser' }).click();
  36 | 
> 37 |   await expect(page.getByRole('alert')).toBeVisible();
     |                                         ^ Error: expect(locator).toBeVisible() failed
  38 | });
  39 | 
```