# CV Studio

A browser-based CV editor with live preview and true vector PDF export. Built with vanilla HTML/CSS/JS on the frontend and Express + Puppeteer on the backend.

## Features

- Live CV preview as you type
- ATS-friendly PDF export via Puppeteer (true vector, not a screenshot)
- JSON import/export to save and restore your CV data
- Auto-save to localStorage — restores your last session automatically
- Drag-and-drop section reordering
- Show/hide individual CV sections
- Adjustable page margins with presets (Compact / Standard / Spacious)
- Page overflow indicator with fill percentage
- Confirm modal for destructive actions
- Server online/offline status badge
- Keyboard shortcuts: `Cmd+S` / `Ctrl+S` to export JSON, `Cmd+P` / `Ctrl+P` to export PDF

## CV Sections

| Section | Description |
|---------|-------------|
| Profile Summary | Free-text summary with character counter |
| Education | Degree, institution, grade (CGPA/GPA/%), year range, "Currently pursuing" toggle |
| Experience | Job title, company, date range, bullet points, "Currently working" toggle |
| Skills | Grouped skill categories with comma-separated items |
| Projects | Name, tech stack, description, optional live link |
| Certifications & Awards | Name, issuer, platform, year |
| Custom | Free-form bullet list for any additional section |

All sections support add, edit, delete, reorder (drag), and show/hide.

## Requirements

- [Node.js](https://nodejs.org/) v18+

## Setup

```bash
cd CV
npm install
```

> First install downloads a bundled Chromium (~170MB) for Puppeteer.

## Run

```bash
node server.js
```

Then open http://localhost:3000 in your browser.

If port 3000 is already in use:

```bash
lsof -ti :3000 | xargs kill -9
node server.js
```

## Project Structure

```
CV/
├── files/
│   └── cv_editor.html   # Frontend — editor UI + live preview + all JS logic
├── server.js            # Express + Puppeteer backend
├── package.json         # Dependencies: express, puppeteer
├── package-lock.json
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server status check |
| POST | `/api/export-pdf` | Accepts `{ cvData, html }`, returns PDF binary |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla HTML, CSS, JavaScript (no frameworks) |
| Fonts | Google Fonts — DM Serif Display, DM Mono, Outfit |
| Backend | Node.js, Express |
| PDF Engine | Puppeteer (headless Chromium) |
| Storage | Browser localStorage (auto-save) |

## Data Model

CV data is stored as a JSON object with the following top-level fields:

```json
{
  "name": "...",
  "roles": ["...", "..."],
  "location": "...",
  "phone": "...",
  "email": "...",
  "linkedin": "...",
  "github": "...",
  "portfolio": "...",
  "marginTop": 480,
  "marginBottom": 720,
  "marginLeft": 720,
  "marginRight": 720,
  "sectionOrder": ["summary", "education", "experience", "skills", "projects", "certifications"],
  "sections": { ... }
}
```

Margin values are in DXA units (1 inch = 1440 DXA). Export/import this JSON to back up or transfer your CV data.
