const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173');
  
  await page.waitForSelector('.lucide-activity', { timeout: 10000 }).catch(() => console.log('Timeout waiting for page load'));

  console.log('Clearing runs...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Clear Runs'));
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 1000));

  console.log('Uploading first batch (Baseline)...');
  const fileInput = await page.$('input[type="file"]');
  const deepikaPath = path.resolve('batch-results-2026-08-06-03-Deepika.xlsx');
  await fileInput.uploadFile(deepikaPath);

  await new Promise(r => setTimeout(r, 4000)); // Wait for eval engine to run

  let driftStatus = await page.evaluate(() => {
    const td = Array.from(document.querySelectorAll('td')).find(td => td.textContent === 'Model Drift');
    if (!td) return null;
    return td.nextElementSibling.textContent + " - " + td.nextElementSibling.nextElementSibling.textContent; 
  });
  console.log('--- First Upload ---');
  console.log('Model Drift Card:', driftStatus);

  console.log('Uploading second batch (Same model/version)...');
  await fileInput.uploadFile(deepikaPath);
  await new Promise(r => setTimeout(r, 4000));

  driftStatus = await page.evaluate(() => {
    const td = Array.from(document.querySelectorAll('td')).find(td => td.textContent === 'Model Drift');
    if (!td) return null;
    return td.nextElementSibling.textContent + " - " + td.nextElementSibling.nextElementSibling.textContent;
  });
  console.log('--- Second Upload (Same version) ---');
  console.log('Model Drift Card:', driftStatus);

  await browser.close();
})();
