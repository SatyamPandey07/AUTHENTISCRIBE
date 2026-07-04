# AuthentiScribe: AI Integrity & Linguistic Intelligence Workspace

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React%2018-blue?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Backend-Express.js-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini](https://img.shields.io/badge/AI--Engine-Gemini%203.5%20Flash-F38B2B?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

**AuthentiScribe** is an advanced, production-ready, full-stack linguistic intelligence workspace. Designed for educators, researchers, and professional writers, it provides a unified hub to audit document originality, analyze writing patterns, rephrase synthetically-flagged text into natural prose, and automatically format formal references and citations.

---

## Product Requirements Document (PRD)

> **About this Document:** This Product Requirements Document defines the core specifications, target personas, functional requirements, and roadmap for the AuthentiScribe writing workspace. It acts as the product blueprint to align the React/TypeScript/Express stack with Google's Gemini-driven linguistic intelligence suite.

<details>
<summary><b>🔍 Click to expand the full Product Requirements Document (PRD)</b></summary>

### Document Metadata
| Field | Value |
| :--- | :--- |
| **Document Title** | AuthentiScribe Product Requirements Document |
| **Version** | 1.0 |
| **Status** | Draft |
| **Date** | July 4, 2026 |
| **Author** | Product Team |
| **Repository** | [github.com/SatyamPandey07/AUTHENTISCRIBE](https://github.com/SatyamPandey07/AUTHENTISCRIBE) |
| **License** | Apache-2.0 |

---

### 1. Overview
AuthentiScribe is a full-stack writing workspace built for people who need to check whether text is original, and if it's not, actually fix it. It's aimed at educators, researchers, and professional writers who currently juggle separate tools for plagiarism checking, AI detection, rewriting, and citations. This product tries to put all of that in one place.

Under the hood, it's a React and TypeScript frontend talking to an Express backend, with Google's Gemini API doing the heavy lifting for text analysis, rewriting, and structured output.

---

### 2. Problem Statement
Since generative AI tools became mainstream, checking whether a piece of writing is genuinely human has turned into a real headache for a lot of people. The tools that exist today solve pieces of the problem but not the whole thing. You run a plagiarism check in one app, an AI detector in another, then copy the flagged paragraph into a third tool to rewrite it, and maybe a fourth to get the citation format right. None of these tools talk to each other.

That back and forth is where AuthentiScribe is trying to help. Instead of detecting a problem and leaving the user to go fix it elsewhere, it keeps detection and remediation in the same screen so a flagged sentence can be reviewed, rewritten, and checked again without switching tabs.

---

### 3. Goals & Objectives
*   **Bring AI detection, plagiarism analysis, rewriting, and citation formatting together** in one workspace instead of several disconnected tools.
*   **Show the reasoning behind a flag, not just a score.** Perplexity, burstiness, and sentence-level classification should be visible, not hidden behind a single number.
*   **Make it possible to act on a flag right away** through the Originality Bench and the Humanizer, rather than just reporting the issue and stopping there.
*   **Work with the files people already have.** Native PDF and DOCX support matters more than a text-paste-only tool.
*   **Keep it free and open source (Apache-2.0)** so individuals and smaller institutions can self-host it without a licensing cost.

---

### 4. Who This Is For
*   **Educators:** They need to check student work for AI-generated content and plagiarism, and they need evidence they can actually point to, not just a percentage.
*   **Researchers and academic writers:** They want to catch AI-pattern language in a draft before submission, and get citations formatted correctly without hunting through a style guide.
*   **Professional and content writers:** They often start with an AI-assisted draft and need to turn it into something that reads naturally and matches their voice, while also cleaning up grammar.
*   **Students:** They want to understand where their own writing might get flagged and reduce that risk before they turn something in.

---

### 5. Scope

#### 5.1 What's Included
*   AI-generation and plagiarism detection for both pasted text and uploaded files (PDF, DOCX)
*   Sentence-level charts showing perplexity, burstiness, and how each sentence is classified
*   A highlight viewer that color-codes human, AI-generated, and plagiarized text
*   A humanizer with adjustable rewrite intensity and style presets
*   Grammar checking, summarization, and translation tools
*   Reference finding and citation formatting in APA, MLA, and Chicago styles
*   Session history and export of cleaned documents or reports

#### 5.2 What's Not Included (for now)
*   User accounts, authentication, or billing for a hosted SaaS version
*   Persistent server-side storage of documents beyond the current session
*   Native mobile apps for iOS or Android
*   Real-time collaboration between multiple users on the same document
*   Direct integrations with LMS platforms like Canvas or Google Classroom

---

### 6. Features
These are grouped the way they already exist in the product, roughly by workspace tab.

#### 6.1 Plagiarism & AI Detection Suite
| Feature | Description | Priority |
| :--- | :--- | :--- |
| **Multi-engine analysis** | Audits pasted text or uploaded documents and estimates AI-generation likelihood alongside plagiarism probability. | High |
| **Linguistic integrity charting** | Sentence-by-sentence charts (built with Recharts) plotting perplexity, burstiness, and category classification. | High |
| **Interactive highlight viewer** | Color-codes human, AI-generated, and plagiarized text as you read. Clicking a flagged sentence opens the Originality Bench. | High |

#### 6.2 Humanizer & Writing Module
| Feature | Description | Priority |
| :--- | :--- | :--- |
| **Context-aware rephrasing** | Rewrites rigid, machine-sounding language into more natural prose while keeping the original meaning intact. | High |
| **Adjustable profiles** | Choose rewrite intensity (Low, Medium, High) and a style preset such as Academic, Business, Casual, or Narrative. | Medium |
| **Interactive suggestions** | Offers a few different humanized versions of a sentence or paragraph so the user can pick the one that fits best. | Medium |

#### 6.3 File Handling
| Feature | Description | Priority |
| :--- | :--- | :--- |
| **Direct PDF processing** | PDFs are base64-encoded and sent straight to the Gemini API, which parses them natively. | High |
| **DOCX extraction** | Word files are parsed server-side using mammoth.js. | High |
| **Embedded document preview** | A split-screen canvas layout lets you inspect the uploaded PDF locally while working. | Medium |

#### 6.4 Editorial Toolkit
| Feature | Description | Priority |
| :--- | :--- | :--- |
| **AI proofreader & translator** | Checks structure and style, and translates content into other languages. | Medium |
| **Reference finder & citation assistant** | Finds likely source material and formats citations in APA, MLA, or Chicago style. | Medium |
| **History & export** | Lets you revisit earlier documents from a local session panel, and export cleaned text or a full report. | Low |

---

### 7. Non-Functional Requirements
*   Analysis should come back within a few seconds for a typical document. This depends partly on how fast the Gemini API responds, which is outside our direct control.
*   Gemini's responses need to follow a strict JSON schema so the frontend can render results without guessing at the shape of the data.
*   API keys stay server-side, stored as environment variables, and are never sent to the browser.
*   The interface should support both dark and light themes and hold up on different screen sizes.
*   The whole thing should run as a single Node.js app that anyone can install and self-host with one build and start command.
*   Documents are processed per session only. Nothing gets saved permanently on the server unless a future version adds that.

---

### 8. Technical Architecture

#### 8.1 Stack
*   **Frontend:** React 18, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **Charts:** Recharts, used for the perplexity and burstiness visualizations
*   **Animation:** Framer Motion
*   **Backend:** Express.js on Node with TypeScript
*   **AI:** Google Gemini API through the official `@google/genai` SDK
*   **Document parsing:** `mammoth.js` for DOCX files

#### 8.2 How Data Moves Through the App
A user either pastes text directly or uploads a file. If it's a DOCX, the server pulls the raw text out using `mammoth.js`. If it's a PDF, the file is base64-encoded and handed to Gemini, which reads it natively without needing a separate extraction step. Either way, the resulting text goes to the analysis endpoint as a JSON payload, Gemini returns a structured response, and the dashboard renders that response as charts and highlighted text. If the user clicks into a flagged sentence and asks for a rewrite, that request goes to a separate endpoint that also calls Gemini, just with a different prompt.

#### 8.3 API Endpoints
*   `POST /api/extract-text`: pulls raw text out of an uploaded DOCX file
*   `POST /api/analyze`: runs the AI-detection and plagiarism analysis through Gemini
*   `POST /api/rephrase-sentence`: generates humanized rewrites for a flagged sentence or paragraph

---

### 9. Core User Flow
1.  User pastes text, or uploads a PDF or DOCX file.
2.  The file gets parsed, either server-side for DOCX or natively by Gemini for PDF.
3.  The analysis engine reviews the text and sends back a structured integrity report.
4.  The dashboard shows sentence-level highlights alongside the stylometric charts.
5.  User clicks a flagged sentence, which opens the Originality Bench.
6.  User picks a rewrite intensity and style, and the Humanizer suggests alternatives.
7.  Once the user is happy with the result, they can add citations through the Reference Finder and export the cleaned document or a full report.

---

### 10. Success Metrics
| Metric | Target | How we'd measure it |
| :--- | :--- | :--- |
| **Detection accuracy** | Low false-positive rate against known human-written samples. | Spot-checking against a control set of verified human writing. |
| **Time to fix a flagged sentence** | Shorter time between a flag appearing and an accepted rewrite. | Timing from highlight click to accepted suggestion within a session. |
| **Adoption** | Steady growth in stars and self-hosted deployments. | GitHub repository analytics. |
| **Completion rate** | A healthy share of uploaded documents reach export or report stage. | Session funnel tracking, once instrumentation exists. |

---

### 11. Assumptions & Constraints
*   Users bring their own Gemini API key. The product itself doesn't sell or resell API access.
*   How well analysis performs, and what it costs, depends on Gemini's availability, rate limits, and pricing at any given time.
*   Right now this is a single-tenant, self-hosted tool. There's no built-in multi-user account system.
*   Document history lives locally in the session. It isn't backed by a central database yet.

---

### 12. Risks & Mitigations
| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **False positives or negatives in AI detection** | High, especially for educators who rely on this as evidence. | Frame results as probabilistic evidence with sentence-level detail, not a final verdict, and encourage a human to make the final call. |
| **Everything depends on one AI provider (Gemini)** | Medium, an outage or pricing change hits core functionality directly. | Build the AI-calling layer so it can support other model providers down the line, not just Gemini. |
| **Large files are slow or expensive to analyze** | Medium, hurts the experience for longer documents. | Chunk long documents automatically, or set a soft length limit with a clear message to the user. |
| **No accounts or persistent storage** | Low to medium, users lose history when they switch sessions or devices. | Call this out clearly as a current limitation, and look at optional persistence in a later release. |

---

### 13. Roadmap
| Phase | What's in it | Target |
| :--- | :--- | :--- |
| **Phase 1: Core (shipped)** | Detection suite, highlight viewer, humanizer, PDF and DOCX ingestion, editorial toolkit, citation assistant. | Complete |
| **Phase 2: Reliability** | Support for more than one AI provider, tighter schema validation, better performance on large files. | Near-term |
| **Phase 3: Persistence** | Optional accounts with server-side history for documents and reports. | Mid-term |
| **Phase 4: Integrations** | LMS integrations, a browser extension, and API access for outside tools. | Long-term |

---

### 14. Appendix
*   **Repository:** `github.com/SatyamPandey07/AUTHENTISCRIBE`
*   **License:** Apache-2.0
*   **Runtime:** Node.js v18 or higher
*   **Setup:** requires a `GEMINI_API_KEY` environment variable; `PORT` is optional and defaults to 3000.

</details>

---

## Key Features

### 🔍 Plagiarism & AI Detection Suite
*   **Multi-Engine Analysis:** Audits text and documents to detect synthetic AI generation markers and plagiarism probabilities.
*   **Linguistic Integrity Charting:** Interactive, sentence-by-sentence stylometric analysis using **Recharts** to plot perplexity, burstiness, and category classification.
*   **Interactive Highlight Viewer:** Color-codes human, AI-generated, and plagiarized components in real time. Clicking flagged text opens the *Originality Bench* for targeted remediation.

### ✍️ Humanizer & Writing Module
*   **Context-Aware Rephrasing:** Preserves original semantic intent while rewriting rigid machine-generated language into fluid prose.
*   **Adjustable Profiles:** Adjust rewrite intensity (Low, Medium, High) and style presets (Academic, Business, Casual, Narrative).
*   **Interactive Suggestions:** Provides multiple humanized choices for single sentences or whole paragraphs.

### 📁 Advanced File Engineering
*   **Direct PDF Processing:** Encodes PDFs to base64 and streams them directly to the Gemini API for native textual parsing and analysis.
*   **DOCX Word Extraction:** Utilizes `mammoth.js` on the server to parse Word documents.
*   **Embedded Document Preview:** Fully interactive split-screen canvas layout to inspect uploaded PDF files locally.

### 💼 Integrated Editorial Toolkit
*   **AI Proofreader & Translator:** Structural auditing, style checks, and high-fidelity language translation.
*   **Reference Finder & Citation Assistant:** Locates academic source structures and formats statements in **APA, MLA, and Chicago** formats.
*   **History & Export Engine:** Re-inspect previous documents from a local session panel, and export cleaned documents or detailed reports.

---

## Visual Walkthrough

### 📊 Scan & Integrity Dashboard
The main dashboard visualizes readability metrics, AI generation probability, and style metrics with a real-time sentence-by-sentence color-coded breakdown.
![Scan Dashboard](assets/dashboard.png)

### ✍️ AI Humanizer Workspace
Paraphrase machine-generated text using context-aware presets (Academic, Narrative, Casual) with adjustable intensities.
![Humanizer Workspace](assets/humanizer.png)

### 🔍 Grammar & Editorial Workbench
Detailed spelling, punctuation, and structural review tool for quick grammar fixes.
![Editorial Workspace](assets/editorial.png)

---

## Architecture & Data Flow

AuthentiScribe processes inputs through a dual-channel text/document ingestion pipeline, utilizing server-side extraction and Gemini structured JSON outputs.

```mermaid
graph TD
    User([User Client]) -->|1. Paste Text or Upload File| UI[React Frontend]
    
    subgraph Files [File Ingestion Channel]
        UI -->|PDF Base64 Stream| API_Analyze
        UI -->|Word File Upload| API_Extract[Express: /api/extract-text]
        API_Extract -->|mammoth.js Extraction| RawText[Raw Text Response]
        RawText --> UI
    end
    
    subgraph Analysis [Linguistic Engine]
        UI -->|JSON Payload| API_Analyze[Express: /api/analyze]
        API_Analyze -->|API Key Authorization| Gemini[Google Gemini 3.5 API]
        Gemini -->|Strict JSON Schema Response| API_Analyze
        API_Analyze -->|Structured Payload| Redux_State[React State / Dashboard]
    end
    
    Redux_State -->|Visualize Stylometric Flow| Recharts[Interactive Charts]
    Redux_State -->|Select Flagged Sentence| Bench[Originality Bench Drawer]
    Bench -->|Rewrite Requests| API_Rephrase[Express: /api/rephrase-sentence]
    API_Rephrase -->|paraphrase| Gemini
```

---

## Technology Stack

*   **Frontend Framework:** React 18 with TypeScript and Vite
*   **Styling:** Tailwind CSS (Fluid layout transitions and adaptive dark/light color palette)
*   **Visualizations:** Recharts (Area charts for perplexity/burstiness trends)
*   **Animations:** Framer Motion (Smooth page swaps and sliding drawers)
*   **Backend Server:** Express.js + Node-TypeScript engine
*   **Integrations:** `@google/genai` (official Google developer SDK) + `mammoth` (Word doc parser)

---

## Setup & Installation

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) and **npm** installed on your system.

### 2. Clone and Install Dependencies
Navigate to the root directory and install all node packages:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file at the root of the project:
```env
# Google Gemini API key used for linguistic analysis
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port (optional, defaults to 3000)
PORT=3000
```
> [!NOTE]
> You can acquire a Gemini API key from the [Google AI Studio Console](https://aistudio.google.com/).

### 4. Running the Development Server
Launch the full-stack development environment (which runs both the Express backend and the Vite frontend proxy on a unified runner):
```bash
npm run dev
```
Open your browser to [http://localhost:3000](http://localhost:3000).

### 5. Production Build & Start
Compile the client static bundle and boot the server in production mode:
```bash
npm run build
npm start
```

---

## Project Directory Structure

```
AUTHENTISCRIBE/
├── assets/                  # Public assets, images, and icons
├── src/
│   ├── App.tsx             # Main dashboard coordinator and tabs
│   ├── main.tsx            # App bootstrap mount
│   ├── index.css           # Global custom typography and theme colors
│   ├── types.ts            # Centralized API and interface types
│   ├── components/         # Workspace tab components
│   │   ├── ScanResultDashboard.tsx   # Integrity score gauges & Recharts visualizer
│   │   ├── OriginalityBench.tsx     # Sliding sentence remediation panel
│   │   ├── HumanizerWorkspace.tsx   # Global text recomposer presets
│   │   ├── FileUploader.tsx         # Drag & Drop file handler
│   │   ├── PDFPreview.tsx           # Inline canvas preview engine
│   │   ├── GrammarChecker.tsx       # Structural spelling and grammar engine
│   │   ├── AIProofreader.tsx        # In-depth style guide auditor
│   │   ├── AISummarizer.tsx         # Context condensator
│   │   ├── AITranslator.tsx         # Language localization module
│   │   ├── ReferenceFinder.tsx      # Source locator
│   │   ├── CitationAssistantModal.tsx # Citation compiler
│   │   ├── HistoryPanel.tsx         # Past analyses cache
│   │   └── Header.tsx               # Navigation and theme switch
│   └── utils/
│       └── helpers.ts       # Text utilities
├── server.ts               # Express application backend & Gemini integration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite asset pipeline config
└── package.json            # Dependencies and unified runners
```

---

## License

Distributed under the **Apache-2.0** License. See `LICENSE` for more information.
