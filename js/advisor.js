/* Statistics + rule-based "AI Study Advisor".
   Scores weigh recent performance: the per-topic score is computed over the
   last RECENT attempts so it reflects improvement rather than old mistakes. */
(function () {
  const SH = window.SH;
  const RECENT = 40;
  const WEAK = 60;
  const STRONG = 85;

  const topicStats = (topicId) => {
    const d = SH.store.data;
    const qs = SH.questions.filter((q) => q.topic === topicId);
    const fcs = SH.flashcards.filter((c) => c.topic === topicId);
    const hist = d.history.filter((h) => h.topic === topicId);
    const recent = hist.slice(-RECENT);
    const latestCorrect = qs.filter((q) => d.answers[q.id] && d.answers[q.id].last).length;
    const answered = qs.filter((q) => d.answers[q.id]).length;
    const flashMastered = fcs.filter((c) => SH.store.cardState(c.id).box >= 3).length;

    const subs = {};
    SH.topic(topicId).subs.forEach((s) => (subs[s] = { attempts: 0, correct: 0 }));
    recent.forEach((h) => {
      if (!subs[h.sub]) subs[h.sub] = { attempts: 0, correct: 0 };
      subs[h.sub].attempts++;
      if (h.correct) subs[h.sub].correct++;
    });

    return {
      id: topicId,
      questions: qs.length,
      cards: fcs.length,
      answered,
      latestCorrect,
      flashMastered,
      attempts: hist.length,
      recentAttempts: recent.length,
      score: recent.length ? SH.pct(recent.filter((h) => h.correct).length, recent.length) : null,
      mastery: SH.pct(latestCorrect + flashMastered, qs.length + fcs.length),
      subs,
    };
  };

  const overall = () => {
    const d = SH.store.data;
    const all = SH.topics.map((t) => topicStats(t.id));
    const totalItems = SH.questions.length + SH.flashcards.length;
    const masteredItems = all.reduce((s, t) => s + t.latestCorrect + t.flashMastered, 0);
    const correct = d.history.filter((h) => h.correct).length;
    const due = SH.flashcards.filter((c) => SH.store.isDue(c.id)).length;
    return {
      topics: all,
      mastery: SH.pct(masteredItems, totalItems),
      attempts: d.history.length,
      accuracy: SH.pct(correct, d.history.length),
      answeredUnique: Object.keys(d.answers).length,
      flashDue: due,
      streak: d.streak.last === SH.dayKey() || d.streak.last === SH.dayKey(Date.now() - 86400000) ? d.streak.count : 0,
      interviews: d.interviews.length,
      quizzes: d.quizzes.length,
    };
  };

  /* Subtopics to review for a topic: weakest attempted ones first, then untouched ones. */
  const weakSubs = (ts, max = 2) => {
    const entries = Object.entries(ts.subs);
    const attempted = entries
      .filter(([, v]) => v.attempts > 0 && SH.pct(v.correct, v.attempts) < 70)
      .sort((a, b) => a[1].correct / a[1].attempts - b[1].correct / b[1].attempts)
      .map(([k]) => k);
    const untouched = entries.filter(([, v]) => v.attempts === 0).map(([k]) => k);
    return attempted.concat(untouched).slice(0, max);
  };

  const joinAnd = (arr) => (arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1]);

  const recommendations = () => {
    const o = overall();
    const d = SH.store.data;
    const recs = [];

    if (!o.attempts && !d.interviews.length) {
      recs.push({
        level: 'info', icon: '👋',
        text: 'Welcome! Start with a **10-question mixed practice quiz** so the advisor can find your weak areas.',
        action: { label: 'Start diagnostic quiz', href: '#/quiz?mode=practice&count=10&autostart=1' },
      });
    }

    // Weak topics (scored), worst first
    o.topics
      .filter((t) => t.score !== null && t.recentAttempts >= 3 && t.score < WEAK)
      .sort((a, b) => a.score - b.score)
      .forEach((t) => {
        const subs = weakSubs(t);
        const name = SH.topic(t.id).short;
        recs.push({
          level: 'bad', icon: '⚠️', topic: t.id,
          text: `Your score in **${name}** is **${t.score}%**. Review ${subs.length ? '**' + joinAnd(subs) + '**' : 'the core concepts'} before taking another mock test.`,
          action: { label: `Weak-spot quiz: ${name}`, href: `#/quiz?topics=${t.id}&mode=weak&autostart=1` },
          secondary: { label: 'Flashcards', href: `#/flashcards?topic=${t.id}` },
        });
      });

    // Middling topics
    o.topics
      .filter((t) => t.score !== null && t.recentAttempts >= 3 && t.score >= WEAK && t.score < 75)
      .forEach((t) => {
        const subs = weakSubs(t, 1);
        recs.push({
          level: 'warn', icon: '📈', topic: t.id,
          text: `**${SH.topic(t.id).short}** is at **${t.score}%**, close to solid. One more focused session${subs.length ? ' on **' + subs[0] + '**' : ''} should push it past 75%.`,
          action: { label: 'Practice', href: `#/quiz?topics=${t.id}&mode=practice&autostart=1` },
        });
      });

    // Unstarted topics
    const unstarted = o.topics.filter((t) => t.attempts === 0);
    if (o.attempts && unstarted.length) {
      recs.push({
        level: 'info', icon: '🧭',
        text: `You haven't practiced **${joinAnd(unstarted.slice(0, 3).map((t) => SH.topic(t.id).short))}**${unstarted.length > 3 ? ` (+${unstarted.length - 3} more)` : ''} yet. A comprehensive exam covers every area.`,
        action: { label: `Start ${SH.topic(unstarted[0].id).short}`, href: `#/quiz?topics=${unstarted[0].id}&mode=practice&autostart=1` },
      });
    }

    // Flashcards due
    if (o.flashDue > 0 && o.attempts) {
      recs.push({
        level: 'info', icon: '🗂️',
        text: `**${o.flashDue}** flashcards are due for review. Spaced repetition takes about 5 minutes and greatly improves retention.`,
        action: { label: 'Review due cards', href: '#/flashcards?due=1' },
      });
    }

    // Interview performance
    const lastInt = d.interviews[d.interviews.length - 1];
    if (lastInt && lastInt.score < 60) {
      recs.push({
        level: 'warn', icon: '🎤',
        text: `Your last mock interview (${lastInt.trackLabel || lastInt.track}) scored **${lastInt.score}%**. Re-read the model answers, then retry while thinking out loud and structuring your answer.`,
        action: { label: 'Retry interview', href: '#/interview' },
      });
    }

    // Strong topics
    const strong = o.topics.filter((t) => t.score !== null && t.recentAttempts >= 8 && t.score >= STRONG);
    if (strong.length) {
      recs.push({
        level: 'ok', icon: '✅',
        text: `Strong performance in **${joinAnd(strong.map((t) => SH.topic(t.id).short))}** (≥${STRONG}%). Keep it fresh with exam mode or a mock technical interview.`,
        action: { label: 'Timed exam', href: '#/quiz?mode=exam&count=20&autostart=1' },
      });
    }

    if (o.attempts >= 30 && !d.interviews.length) {
      recs.push({
        level: 'info', icon: '💼',
        text: 'You have solid practice volume. Try the **Technical Interview Simulator** to rehearse answering under time pressure.',
        action: { label: 'Open interview simulator', href: '#/interview' },
      });
    }

    return recs;
  };

  /* Exam readiness: blend of mastery, recent accuracy and coverage. */
  const readiness = () => {
    const o = overall();
    const covered = o.topics.filter((t) => t.attempts > 0).length / o.topics.length;
    const scored = o.topics.filter((t) => t.score !== null);
    const avgScore = scored.length ? scored.reduce((s, t) => s + t.score, 0) / scored.length : 0;
    return Math.round(0.4 * o.mastery + 0.4 * avgScore * covered + 0.2 * covered * 100);
  };

  SH.stats = { topicStats, overall, weakSubs, readiness };
  SH.advisor = { recommendations };

  SH.renderAdvice = (recs) =>
    recs.length
      ? recs
          .map(
            (r) => `<div class="advice ${r.level}">
        <div class="advice-icon">${r.icon}</div>
        <div style="flex:1">
          <div>${SH.md(r.text)}</div>
          ${r.action ? `<div class="row mt-sm"><a class="btn btn-sm" href="${r.action.href}">${SH.esc(r.action.label)} →</a>${r.secondary ? `<a class="btn btn-sm btn-ghost" href="${r.secondary.href}">${SH.esc(r.secondary.label)}</a>` : ''}</div>` : ''}
        </div>
      </div>`
          )
          .join('')
      : `<div class="advice ok"><div class="advice-icon">🎯</div><div>No weak areas detected right now. Keep practicing across all topics to maintain mastery.</div></div>`;
})();
