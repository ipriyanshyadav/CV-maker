const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'files'), { etag: false, lastModified: false, setHeaders: res => res.setHeader('Cache-Control', 'no-store') }));

app.get('/', (req, res) => { res.setHeader('Cache-Control', 'no-store'); res.sendFile(path.join(__dirname, 'files', 'cv_editor.html')); });
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/export-pdf', async (req, res) => {
  const { html, cvData } = req.body;
  let browser;
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <style>
        :root { --cv-accent: #1A56B0; }
        @page { margin: 0; size: 8.5in 11in; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        .cv { font-family: Arial, sans-serif; color: #222; font-size: 10pt; }
        .cv-header { text-align: center; }
        .cv-name { font-size: 28pt; font-weight: bold; color: #1A56B0; line-height: 1.1; margin-bottom: 4px; }
        .cv-tagline { font-size: 11pt; color: #555; margin-bottom: 4px; }
        .cv-contact { font-size: 9.5pt; color: #555; }
        .cv-contact a { color: #1A56B0; text-decoration: underline; }
        .cv-pipe { color: #bbb; margin: 0 4px; }
        .cv-section-header { font-size: 11pt; font-weight: bold; color: #1A56B0; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1.5px solid #1A56B0; padding-bottom: 3px; margin-bottom: 6px; }
        .cv-edu-row { font-size: 10pt; }
        .cv-edu-degree { font-weight: bold; }
        .cv-edu-inst { color: #1A56B0; font-weight: bold; }
        .cv-edu-meta { color: #555; }
        .cv-job-header { font-size: 10pt; margin-bottom: 3px; }
        .cv-job-title { font-weight: bold; }
        .cv-job-company { color: #1A56B0; font-weight: bold; }
        .cv-job-dates { color: #555; font-style: italic; }
        .cv-bullets { list-style: none; padding: 0; margin: 0; }
        .cv-bullets li { padding-left: 18px; position: relative; font-size: 10pt; color: #222; margin-bottom: 3px; line-height: 1.45; }
        .cv-bullets li::before { content: "•"; position: absolute; left: 5px; color: #444; }
        .cv-skill-row { font-size: 10pt; margin-bottom: 3px; line-height: 1.45; }
        .cv-skill-label { color: #1A56B0; font-weight: bold; }
        .cv-skill-items { color: #333; }
        .cv-proj-header { font-size: 10pt; margin-bottom: 2px; }
        .cv-proj-name { font-weight: bold; }
        .cv-proj-tech { color: #555; font-style: italic; }
        .cv-proj-link a { color: #1A56B0; text-decoration: underline; font-size: 10pt; }
        .cv-proj-desc { font-size: 10pt; color: #333; line-height: 1.45; }
        .cv-cert-item { font-size: 10pt; padding-left: 18px; position: relative; margin-bottom: 3px; line-height: 1.45; }
        .cv-cert-item::before { content: "•"; position: absolute; left: 5px; }
      </style>
    </head><body>${html}</body></html>`;

    await page.setContent(fullHtml, { waitUntil: 'networkidle2' });

    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    console.log('[PDF] type:', typeof pdf, '| constructor:', pdf?.constructor?.name, '| length:', pdf?.length);
    console.log('[PDF] first bytes:', Buffer.isBuffer(pdf) ? pdf.slice(0,5).toString() : String(pdf).slice(0,5));

    const buf = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);
    const name = (cvData?.name || 'CV').replace(/\s+/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${name}_CV.pdf"`);
    res.setHeader('Content-Length', buf.length);
    res.end(buf);
  } catch (err) {
    console.error('[PDF]', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`CV Studio running at http://localhost:${PORT}`));
