import type { Language, NudgeMoment, NudgeResult, ReportCard, Student } from "./types";

// Curated, pre-written report cards per language so a LIVE DEMO NEVER FAILS,
// even with no API key / no network. The real LLM call (when a key is set)
// personalizes far better — these are the safety net.

function fill(template: string, s: Student): string {
  const first = s.name.split(" ")[0];
  return template
    .replaceAll("{name}", first)
    .replaceAll("{project}", s.lastProject)
    .replaceAll("{rank}", String(s.rankInCollege))
    .replaceAll("{cohort}", String(s.collegeCohortSize));
}

const TEMPLATES: Record<Language, { message: string; translation: string }> = {
  Telugu: {
    message:
      "🙏 నమస్కారం! ఈ వారం {name} {project} తయారు చేశారు — చాలా బాగుంది. వారి కాలేజీ బ్యాచ్‌లో {cohort} మందిలో {rank}వ స్థానంలో ఉన్నారు. ఇలాగే కొనసాగితే మంచి క్యాంపస్ ప్లేస్‌మెంట్ (6-10 LPA) దిశగా వెళ్తున్నారు. దయచేసి వారిని ఇది చూపించి, ఏం నేర్చుకున్నారో వివరించమని అడగండి. 📈",
    translation:
      "🙏 Greetings! This week {name} built {project} — very well done. They are ranked {rank} out of {cohort} in their college batch. At this pace they are on track for a good campus placement (6-10 LPA). Please show them this and ask them to explain what they learned. 📈",
  },
  Hindi: {
    message:
      "🙏 नमस्ते! इस हफ़्ते {name} ने {project} बनाया — बहुत अच्छा काम किया। अपने कॉलेज बैच के {cohort} छात्रों में वे {rank}वें स्थान पर हैं। इसी तरह चलता रहा तो अच्छे कैंपस प्लेसमेंट (6-10 LPA) की राह पर हैं। कृपया उन्हें यह दिखाएँ और पूछें कि उन्होंने क्या सीखा। 📈",
    translation:
      "🙏 Namaste! This week {name} built {project} — excellent work. They rank {rank} out of {cohort} in their college batch. If this continues they are on track for a good campus placement (6-10 LPA). Please show them this and ask what they learned. 📈",
  },
  Tamil: {
    message:
      "🙏 வணக்கம்! இந்த வாரம் {name} {project} உருவாக்கினார் — மிகச் சிறப்பு. தனது கல்லூரி குழுவில் {cohort} பேரில் {rank}-வது இடத்தில் உள்ளார். இதே வேகத்தில் சென்றால் நல்ல கேம்பஸ் பிளேஸ்மென்ட் (6-10 LPA) நோக்கி செல்கிறார். தயவுசெய்து இதை அவருக்குக் காண்பித்து, என்ன கற்றார் என்று கேளுங்கள். 📈",
    translation:
      "🙏 Vanakkam! This week {name} built {project} — wonderful. They are ranked {rank} of {cohort} in their college group. At this pace they are heading toward a good campus placement (6-10 LPA). Please show them this and ask what they learned. 📈",
  },
  Malayalam: {
    message:
      "🙏 നമസ്കാരം! ഈ ആഴ്ച {name} {project} ഉണ്ടാക്കി — വളരെ നന്നായി. കോളേജ് ബാച്ചിലെ {cohort} പേരിൽ {rank}-ാം സ്ഥാനത്താണ്. ഇതുപോലെ തുടർന്നാൽ നല്ലൊരു ക്യാമ്പസ് പ്ലേസ്മെന്റ് (6-10 LPA) ലക്ഷ്യത്തിലേക്കാണ്. ദയവായി ഇത് അവർക്ക് കാണിച്ച്, എന്താണ് പഠിച്ചതെന്ന് ചോദിക്കൂ. 📈",
    translation:
      "🙏 Namaskaram! This week {name} built {project} — very good. They rank {rank} of {cohort} in their college batch. At this pace they are on track for a good campus placement (6-10 LPA). Please show them this and ask what they learned. 📈",
  },
};

// Curated per-moment nudge fallbacks (English) so the Composer never hard-fails
// without a live model. The real LLM call personalizes far better + in-language.
const NUDGE_FALLBACK: Record<NudgeMoment, { audience: "student" | "parent"; tmpl: string }> = {
  "stuck-midnight": {
    audience: "student",
    tmpl: "Hey {name} 👋 stuck on this one? Most students hit a wall exactly here — that frustration is what getting better feels like. Don't peek at the answer yet: re-read your last error line and try just 10 more minutes. You've got this.",
  },
  "exam-approaching": {
    audience: "student",
    tmpl: "Hi {name} — college exams coming up? Totally fine to lighten up. Tap Exam Mode and I'll freeze (not break) your {streak} streak. Let's pre-book one easy 10-min comeback the day after your exams end. 📚",
  },
  "friend-dropped": {
    audience: "student",
    tmpl: "Hey {name} — noticed a batchmate paused. That's about them, not you. You shipped {project} recently — that's real. Want to team up with someone still going for one quick problem today?",
  },
  "parent-disengaged": {
    audience: "parent",
    tmpl: "Namaste 🙏 Small update on {name}: this month they've been building consistently and recently made {project}. Consistency like this is exactly what leads to placements. Do tell them you're proud — it means more than you know.",
  },
  "post-mock-failure": {
    audience: "student",
    tmpl: "Hey {name} — one mock doesn't define you. Almost everyone who got placed failed their first one too. You've improved a lot since you started. Forget the score for now — solve just one 20-min question today to rebuild momentum. 💪",
  },
  drifting: {
    audience: "student",
    tmpl: "Hi {name} 👋 no pressure to 'catch up'. Just one tiny thing today: write one line of code — print(\"I'm back\"). That's it. Tap here and I'll meet you there.",
  },
};

export function fallbackNudge(s: Student, moment: NudgeMoment): NudgeResult {
  const f = NUDGE_FALLBACK[moment];
  const msg = f.tmpl
    .replaceAll("{name}", s.name.split(" ")[0])
    .replaceAll("{project}", s.lastProject)
    .replaceAll("{streak}", `${s.currentStreak}-day`);
  return { audience: f.audience, message: msg, translation: msg, source: "fallback" };
}

export function fallbackReportCard(s: Student): ReportCard {
  const t = TEMPLATES[s.language];
  return {
    language: s.language,
    message: fill(t.message, s),
    translation: fill(t.translation, s),
    source: "fallback",
  };
}
