import { test, expect } from '@playwright/test';

test('shows the screening result', async ({ page }) => {
  await page.route('**/api/screen', (route) =>
    route.fulfill({
      json: {
        id: null,
        result: {
          score: 78,
          summary: 'Bon profil.',
          strengths: ['Spring Boot'],
          gaps: ['Kubernetes'],
          questions: ['Parlez-nous de Mijery ID.'],
        },
      },
    }),
  );

  await page.goto('/');
  await page.getByTestId('job-ad').fill('x'.repeat(60));
  await page.getByTestId('cv').fill('y'.repeat(60));
  await page.getByRole('button', { name: 'Analyser' }).click();

  await expect(page.getByTestId('score')).toHaveText('78/100');
});

test('shows an error when the API fails', async ({ page }) => {
  await page.route('**/api/screen', (route) =>
    route.fulfill({ status: 502, json: { error: 'L\'analyse a échoué, réessayez.' } }),
  );

  await page.goto('/');
  await page.getByTestId('job-ad').fill('x'.repeat(60));
  await page.getByTestId('cv').fill('y'.repeat(60));
  await page.getByRole('button', { name: 'Analyser' }).click();

  await expect(page.getByTestId('error')).toBeVisible();
});
