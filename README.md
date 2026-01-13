# Natively Page Selector - Vibe Coding Platform

A website builder with AI-powered code generation and a **page selector/route selector** feature.

## Feature Implementation: Page Selector

### Reference Design
<p align="center">
  <img src="lovable-file-router.png" alt="Page Selector Design" width="300"/>
</p>

### What Was Implemented

A hierarchical dropdown in the preview panel that:
- Displays all HTML pages in the generated website
- Allows navigation between pages (`/`, `/about.html`, `/contact.html`)
- Supports navigation to sections within pages (`#hero`, `#about`, `#features`)

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  ChatPage                                                        │
│    ├── pages state ← pages_updated events                       │
│    └── WebsitePreview                                           │
│          ├── PageSelector (dropdown)                            │
│          │     ├── Pages list                                   │
│          │     └── Sections (hierarchical submenu)              │
│          └── iframe (navigates based on selection)              │
└─────────────────────────────────────────────────────────────────┘
                              ↑
                         WebSocket
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Modal)                             │
├─────────────────────────────────────────────────────────────────┤
│  agent.py                                                        │
│    ├── scan_workspace_pages() → parses HTML files               │
│    ├── dev_server_started event (includes pages)                │
│    └── pages_updated event (after each turn)                    │
└─────────────────────────────────────────────────────────────────┘
```

### Key Files Modified/Created

| File | Description |
|------|-------------|
| `agent.py` | Added `scan_workspace_pages()` function for HTML file detection |
| `appandrunning/app/components/PageSelector.tsx` | Hierarchical dropdown component |
| `appandrunning/app/components/WebsitePreview.tsx` | Integrated page selector with navigation |
| `appandrunning/app/components/ui/dropdown-menu.tsx` | Radix UI dropdown base |
| `appandrunning/app/chat/[id]/page.tsx` | Handles `pages_updated` WebSocket events |

### Technical Approach

**Chosen: Backend File Scanning**

The backend scans the workspace for HTML files and extracts:
- Page titles from `<title>` tags
- Sections with `id` attributes (`<section id="hero">`)
- Anchor links (`href="#about"`)

**Alternatives Considered:**
1. **Frontend iframe parsing** - Less reliable due to CORS/sandbox restrictions
2. **Agent-reported structure** - More complex, requires prompt engineering

---

## Background

A website builder consisting of a web interface where you can prompt descriptions of websites. The request is sent to a Modal backend which spins up a sandbox running Claude Code to generate the website.

## Getting Started

### Setup Backend

1. Install uv: `curl -LsSf https://astral.sh/uv/install.sh | sh`
2. Run `uv sync`
3. Run `uv run modal setup` to connect your Modal account
4. Add your Anthropic API key: `modal secret create anthropic-secret ANTHROPIC_API_KEY=sk-...`
5. Deploy: `uv run modal deploy API.py`
6. Find your backend URL in the Modal dashboard

### Setup Frontend

1. Install pnpm: `npm install -g pnpm`
2. Navigate to frontend: `cd appandrunning`
3. Create `.env.local` with: `NEXT_PUBLIC_API_URL=https://your-modal-url.modal.run`
4. Install dependencies: `pnpm i`
5. Run dev server: `pnpm run dev`
6. Open http://localhost:3000

## How It Works

1. User describes a website they want to build
2. A Modal sandbox spins up and serves HTML
3. Claude AI generates the HTML/CSS/JavaScript
4. The website is displayed live in an iframe
5. **Page selector dropdown shows available pages/sections**
6. User can navigate between pages or iterate with additional prompts

## Live Demo

- **Backend:** https://iamsupun--website-builder-api-web.modal.run
- **Frontend:** Run locally with `pnpm run dev`
