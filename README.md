# SE Study Hub

An interactive single-page study app for a **comprehensive Software Engineering final exam** and **technical interviews**. It is written in plain HTML, CSS and JavaScript, with no build step and no dependencies. Progress is saved in your browser's LocalStorage.

## Run it locally

### Option 1: open the file (simplest)

Double-click `index.html`, or open it from your browser with *File → Open*. Everything works from `file://`.

### Option 2: serve it over HTTP (recommended)

Some browsers restrict Web Workers and LocalStorage on `file://` pages. A local server avoids those problems:

```bash
cd "estudio para examen final de carrera"

# Python 3 (preinstalled on most Linux/macOS systems)
python3 -m http.server 8000

# or Node.js
npx serve .

# or Deno
deno run --allow-net --allow-read jsr:@std/http/file-server
```

Then open <http://localhost:8000>.

> Fonts load from Google Fonts when you are online. Offline, the app falls back to system fonts and everything else keeps working.

## Features

| Module | What it does |
|---|---|
| **Dashboard** | Overall mastery ring, exam-readiness bar, stats, advisor tips and a card per topic with progress bars. |
| **Quiz Engine** | 114 questions across 8 topics: multiple choice, scenario-based ("Given this DB bottleneck, which index…?") and code-output prediction (Python, JS, Java, C++, SQL). Three modes: **Practice** (instant feedback with per-option explanations), **Exam** (timed, graded at the end, with a review) and **Weak spots** (prioritizes questions you missed). Keyboard shortcuts: `1`–`4` / `A`–`D` to answer, `Enter` to continue. |
| **Flashcards** | 48 cards with Leitner-box spaced repetition (Again / Good / Easy). `Space` flips, `1`/`2`/`3` rate. |
| **Boolean Solver** | Parses AND/OR/NOT/XOR/NAND/NOR/XNOR/→/↔ in several notations (`A'B + AB'`, `!(A & B)`, `p -> q`, `A xor B`). Shows the tokens, the parse with precedence, a truth table revealed **column by column**, a per-row evaluation trace, Σm/ΠM canonical forms, **Quine–McCluskey** minimal SOP/POS, a **K-map** (2–4 variables), an **equivalence checker** and a fill-in-the-table **practice mode**. |
| **Algorithm Simulator** | Step-by-step visualizations of bubble, selection, insertion, merge and quick sort, plus linear and binary search, with highlighted pseudocode, comparison/swap counters, play/pause/scrub and speed. Includes an interactive **stack & queue** and tracing exercises ("predict the array after pass 2", "final stack state"). |
| **Reference & Cheat Sheets** | 13 cheat sheets (Big-O, sorting, HTTP codes, OSI/TCP-IP, SQL, normalization/ACID/isolation, Boolean laws, SOLID & patterns, OWASP Top 10 2021 vs 2025, ISO/IEC 25010, ML metrics, language syntax comparison, system design) and a 67-term encyclopedia you can search and **bookmark**. Press `/` anywhere for the quick-reference drawer. |
| **Interview Simulator** | Tracks: *Theory & System Design*, *Coding Challenge* or a *Full Loop*, each with a countdown timer. Theory answers are checked against key points (auto-detected, then you adjust them) and compared with a model answer. Coding problems (8 LeetCode easy/medium) run in JavaScript against hidden tests inside a sandboxed Web Worker with a 3 s timeout, and offer step-by-step hints (−10% each). The session ends with an evaluation score and a verdict from *No Hire* to *Strong Hire*. |
| **Analytics & Advisor** | Score and mastery per category, a subtopic drill-down, 14-day activity, accuracy by question type, quiz and interview history, and rule-based personalized recommendations, e.g. *"Your score in Databases is 36%. Review Indexing and SQL before taking another mock test."* Also has export, import and reset for your data. |

### How scores are calculated

- **Score per category** is the accuracy over your **last 40 answers** in that topic, so it reflects your current level rather than old mistakes.
- **Mastery** is the number of questions whose latest answer was correct, plus flashcards in Leitner box 3 or higher, divided by all items in the topic.
- **Exam readiness** blends mastery (40%), average topic score weighted by coverage (40%) and topic coverage (20%).
- The **advisor** flags topics under 60% (naming their weakest subtopics), topics between 60% and 75%, topics you haven't started, due flashcards, low interview scores and strong areas.

The "AI" advisor is rule-based and runs entirely in the browser; no data leaves your machine.

## Project structure

```
index.html              App shell (sidebar, top bar, drawer) and script loading order
css/styles.css          Design tokens, dark (default) and light themes, responsive layout
js/util.js              Helpers: escaping, mini-markdown, syntax highlighter, toasts, tooltips
js/storage.js           LocalStorage persistence (answers, quizzes, flashcards, bookmarks, interviews)
js/advisor.js           Statistics and recommendation rules
js/boolean-engine.js    Tokenizer, recursive-descent parser, evaluator, Quine–McCluskey
js/app.js               Hash router, theme toggle, keyboard shortcuts
js/data/                Content: topics, questions, flashcards, glossary, cheat sheets, interview bank
js/views/               One file per screen (dashboard, quiz, flashcards, boolean, simulator, reference, interview, analytics)
```

The scripts are classic `<script>` files that share one global namespace (`window.SH`) instead of ES modules. That is what lets the app run straight from `file://`, without a bundler and without module CORS errors.

## Adding your own content

Content lives in plain JS arrays in `js/data/`. To add a question, append an object to `js/data/questions.js`:

```js
{
  id: 'db-15', topic: 'db', sub: 'Indexing', type: 'mcq', difficulty: 2,
  q: 'Which index type is best for full-text search?',
  options: ['B-tree', 'Hash', 'Inverted index (GIN / full-text)', 'Bitmap'],
  answer: 2,
  explain: 'Inverted indexes map each term to the documents that contain it.',
}
```

- `type`: `mcq`, `scenario` or `output`. For `output`, give `code`, `lang`, `accept: [...]` and `answer` instead of `options`.
- `sub` must be one of the topic's `subs` in `js/data/topics.js`, so analytics can group it.
- `rationale: [...]` (optional) gives a per-option explanation in the same order as `options`.

Flashcards, glossary terms, cheat sheets, interview questions and coding challenges follow the same pattern in their own files.

## Data & privacy

All progress is stored under the LocalStorage key `se-study-hub:v1`, in this browser only. Use **Analytics → Export progress** to back it up or move it to another browser, and **Import backup** to restore it. Clearing site data or using a private window starts you fresh.

## Browser support

Recent Chrome, Edge, Firefox and Safari. The layout adapts down to phone width; the sidebar becomes a menu (☰) on small screens.
