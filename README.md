# AuthentiScribe: AI Integrity & Writing Suite

AuthentiScribe is an advanced, production-ready, full-stack linguistic intelligence workspace. It provides educators, researchers, and professional writers with sophisticated tools to audit document authenticity, analyze writing patterns, rephrase text for natural flow, and automatically generate formal citations.

## 🌟 Key Features

### 🔍 Plagiarism & AI Detection Suite
- **Multi-Engine Audit**: Scans text or uploaded documents to determine the probability of synthetic AI generation and plagiarism markers.
- **Linguistic Integrity Trend Map**: Powered by interactive **Recharts** visualization, it maps stylometric flow, burstiness, and probability distributions sentence-by-sentence.
- **Interactive Highlight Viewer**: Highlights AI, plagiarized, and human-written sentences in real-time. Clicking any flagged sentence opens the Originality Bench for immediate remediation.

### ✍️ Humanizer & Writing Module
- **Context-Aware Rephrasing**: Seamlessly transforms stiff or machine-flagged prose into natural, engaging, and human-like writing while preserving the original semantic intent.
- **Recomposer Presets**: Offers custom adjustment profiles (e.g., Casual, Academic, Creative, Professional) to fine-tune vocabulary depth and syntax length.
- **AI-Powered Sidekick**: Integrates a server-side writing assistant that provides targeted suggestions and structure adjustments.

### 📁 Advanced File Engineering
- **Direct PDF & Document Loading**: Securely uploads, extracts text, and processes major file formats including `.pdf` and `.docx`.
- **Local PDF Previewer**: Built-in full-screen high-fidelity interactive document preview engine utilizing sandboxed canvas-blob conversion.
- **Seamless Exporting**: Download detailed linguistic integrity reports or clean processed text with a single click.

### 🎨 Human-Centered User Experience
- **Durable Styling**: Outfitted with a professional **Slate** design language, spacious negative space, and custom typography pairings.
- **Dual-Theme Engine**: Full support for light and dark modes with persistent local preference syncing.
- **Clipboards Integrations**: One-tap native clipboard actions allow users to instantly copy processed documents or suggested citations.

---

## 🛠️ Technology Stack

- **Frontend**: [React 18](https://react.dev/) + [Vite](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling & Animations**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **Charts & Mapping**: [Recharts](https://recharts.org/)
- **Backend & API**: [Express](https://expressjs.com/) with native TypeScript rendering
- **Linguistic Intelligence**: Integrated with the [@google/genai](https://www.npmjs.com/package/@google/genai) developer model suite

---

## 🚀 Local Setup & Installation

Follow these steps to run the application locally on your machine:

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) and **npm** installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file at the root of your directory and supply your secret keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Boot Development Server
Run the unified full-stack dev runner:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the suite.

### 5. Build for Production
Compiles client-side static assets and bundles the Node.js server for maximum cold-start efficiency:
```bash
npm run build
npm start
```

---

## ⚖️ License
Distributed under the **Apache-2.0** license. See `LICENSE` for more information.
