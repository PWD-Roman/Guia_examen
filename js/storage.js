/* LocalStorage persistence: answers, quiz results, flashcard boxes,
   bookmarks, interviews, settings and the daily streak. */
(function () {
  const SH = window.SH;
  const KEY = 'se-study-hub:v1';
  const HISTORY_CAP = 3000;

  const defaults = () => ({
    version: 1,
    answers: {},      // qid -> { last: bool, attempts, correct, ts }
    history: [],      // { qid, topic, sub, type, correct, ts, mode }
    quizzes: [],      // { ts, mode, total, correct, durationSec, topics: [], byTopic: {} }
    flashcards: {},   // cardId -> { box: 1..5, due: ts, reviews }
    bookmarks: [],    // glossary term ids
    interviews: [],   // { ts, track, score, verdict, items: [] }
    activity: {},     // dayKey -> count of study actions
    tools: {},        // workspace state, e.g. last Boolean expression
    settings: { theme: 'dark', singleLetterVars: true },
    streak: { last: null, count: 0 },
  });

  let data;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    const base = defaults();
    data = Object.assign(base, saved, { settings: Object.assign(base.settings, saved.settings) });
  } catch (e) {
    data = defaults();
  }

  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      SH.toast && SH.toast('Could not save progress (storage full or blocked).', 'bad');
    }
  };

  const touchActivity = () => {
    const today = SH.dayKey();
    data.activity[today] = (data.activity[today] || 0) + 1;
    if (data.streak.last !== today) {
      const yesterday = SH.dayKey(Date.now() - 86400000);
      data.streak.count = data.streak.last === yesterday ? data.streak.count + 1 : 1;
      data.streak.last = today;
    }
  };

  SH.store = {
    KEY,
    get data() { return data; },
    save,

    recordAnswer(q, correct, mode = 'practice') {
      const a = data.answers[q.id] || { attempts: 0, correct: 0 };
      a.attempts += 1;
      if (correct) a.correct += 1;
      a.last = !!correct;
      a.ts = Date.now();
      data.answers[q.id] = a;
      data.history.push({ qid: q.id, topic: q.topic, sub: q.sub, type: q.type, correct: !!correct, ts: a.ts, mode });
      if (data.history.length > HISTORY_CAP) data.history.splice(0, data.history.length - HISTORY_CAP);
      touchActivity();
      save();
    },

    recordQuiz(result) {
      data.quizzes.push(Object.assign({ ts: Date.now() }, result));
      if (data.quizzes.length > 200) data.quizzes.shift();
      save();
    },

    /* Leitner boxes: 1 = review every session ... 5 = mastered (16 days). */
    INTERVALS: [0, 0, 1, 3, 7, 16],
    reviewCard(cardId, rating) {
      const c = data.flashcards[cardId] || { box: 1, reviews: 0 };
      if (rating === 'again') c.box = 1;
      else if (rating === 'good') c.box = Math.min(5, c.box + 1);
      else if (rating === 'easy') c.box = Math.min(5, c.box + 2);
      c.reviews += 1;
      c.due = Date.now() + SH.store.INTERVALS[c.box] * 86400000;
      data.flashcards[cardId] = c;
      touchActivity();
      save();
    },
    cardState(cardId) { return data.flashcards[cardId] || { box: 0, due: 0, reviews: 0 }; },
    isDue(cardId) {
      const c = data.flashcards[cardId];
      return !c || c.due <= Date.now();
    },

    toggleBookmark(id) {
      const i = data.bookmarks.indexOf(id);
      if (i >= 0) data.bookmarks.splice(i, 1);
      else data.bookmarks.push(id);
      save();
      return i < 0;
    },
    isBookmarked(id) { return data.bookmarks.includes(id); },

    recordInterview(result) {
      data.interviews.push(Object.assign({ ts: Date.now() }, result));
      touchActivity();
      save();
    },

    setSetting(k, v) { data.settings[k] = v; save(); },

    exportJSON() { return JSON.stringify(data, null, 2); },
    importJSON(text) {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object' || !parsed.version) throw new Error('Not a SE Study Hub backup file.');
      const base = defaults();
      data = Object.assign(base, parsed, { settings: Object.assign(base.settings, parsed.settings) });
      save();
    },
    reset() { data = defaults(); save(); },
  };
})();
