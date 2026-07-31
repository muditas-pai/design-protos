window.MM_SPEC = {
  META: {
    title: 'Design harness — the design up for approval',
    subtitle: 'A brief goes in, a screen in the house style comes out, and the judgement spent on it is written back so the next run starts smarter. The corpus is ten small annotated prototypes, not one big canonical app — that was the simplification.',
    legend: [
      { c: 'navy',   label: 'build flow' },
      { c: 'violet', label: 'the brief, and the check that it was answered' },
      { c: 'red',    label: 'correction loop — the whole surface re-verifies' },
      { c: 'orange', label: 'harvest — your decisions written back' },
      { c: 'green',  label: 'owned elsewhere — leaves as a PR' },
      { c: 'gray',   label: 'reads', dash: 1 },
      { k: 'you',    label: 'you, and the calls only you can make' },
      { k: 'file',   label: 'an asset on disk' },
      { k: 'judge',  label: 'a fresh agent, deliberately kept ignorant' }
    ]
  },

  LANES: [
    { id: 'assets' },
    { id: 'run' },
    { id: 'join', gap: 40 },
    { id: 'close' }
  ],

  FRAMES: [
    { id: 'corpus', label: 'THE CORPUS — what "good" looks like', color: 'orange',
      nodes: ['protos', 'annotations', 'donts'] },
    { id: 'verify', label: 'ONE PASS — everything below runs, then adjudicate decides', color: 'red',
      nodes: ['lint', 'render', 'designjudge', 'productjudge'] }
  ],

  NODES: [
    // ---- assets ----
    { id: 'brief', lane: 'assets', kind: 'brief', title: 'THE BRIEF',
      body: 'a feature spec or PRD — the problem, who it is for, and what counts as solved. Written by a person; the harness never invents one from an investigation' },

    { id: 'quickref', lane: 'assets', kind: 'note',
      body: '<b>Quick reference</b> — the surface × register list, eleven rows. It fixes what kind of thing you are building, which decides every anchor and every scoped rule after it' },

    { id: 'reqtemplate', lane: 'assets', kind: 'file', title: 'requirements-template.md',
      body: 'the edge cases we always forget, inherited by every brief — free-plan behaviour, the empty case, what happens after the primary action' },

    { id: 'content', lane: 'assets', kind: 'file', title: 'content.md',
      body: 'the real strings and numbers — plan names, prices, limits, error copy. Carries an owner and a date. Nothing user-visible may be invented' },

    { id: 'tokens', lane: 'assets', kind: 'file', title: 'design-system/',
      body: 'pai.css, components.html, template.html — the only vocabulary. Linked by relative path, never copied. Owned by someone else and PR-gated' },

    { id: 'protos', lane: 'assets', kind: 'file', title: 'ten canonical prototypes',
      body: 'small, isolated, one surface each — the anchors a build is few-shot on. <b>This is the change.</b> Retrieval used to come back with fewer than two hits and every run went unanchored; ten deliberately-chosen files fix that without maintaining a whole replica app' },

    { id: 'annotations', lane: 'assets', kind: 'file', title: 'annotations/',
      body: 'element-level comments left in the browser — what is wrong here, and what to do instead. Committed as files beside the design they describe, so the comment and the thing move together and harvest just reads them' },

    { id: 'donts', lane: 'assets', kind: 'file', title: 'the anti-pattern table',
      body: 'every rejection, as ❌ don\'t / ✅ do / why, pointing at the file where the bad thing already sits. It <b>is</b> the design judge\'s rubric, and it reaches the builder too — a rejection only the judge sees is one we pay to rediscover every run' },

    { id: 'lintscript', lane: 'assets', kind: 'file', title: 'lint/pai-lint.py',
      body: 'everything checkable without judgement. It reports which checks it has not got yet, so a thin lint never reads as a clean bill of health' },

    // ---- the run ----
    { id: 'frame', lane: 'run', kind: 'step', n: '0', title: 'FRAME THE BRIEF',
      body: 'check the assets are all there — a missing one stops the run rather than quietly degrading it. Then turn the doc into a numbered checklist and fix the surface and register. Anything you could not settle by looking at a picture is marked <b>not checkable</b> instead of being reworded into something scoreable' },

    { id: 'gate', lane: 'run', kind: 'you', title: 'YOU RATIFY — surface, register, the list',
      body: 'a minute or two, honestly, before a line is generated. The builder and the product judge both score against this list, so if it is wrong they are wrong together and the second opinion buys nothing',
      foot: 'the only stop that waits for you — every other human moment ends the run and hands it back' },

    { id: 'retrieve', lane: 'run', kind: 'step', n: '1', title: 'RETRIEVE THE ANCHORS',
      body: 'up to three prototypes on the same surface and register, widening if too few hit. At least one must be human-made whenever one exists — the only thing stopping the corpus from feeding on its own output' },

    { id: 'generate', lane: 'run', kind: 'step', n: '2', title: 'GENERATE',
      body: 'build against the ratified list, <b>few-shot on the anchors just retrieved</b> — this is the one moment prevention is cheaper than correction. A number content.md cannot resolve stops the run rather than being invented' },

    { id: 'lint', lane: 'run', kind: 'verify', n: '3', title: 'LINT — two phases',
      body: 'on the file first, in milliseconds: no inline styles, no colour or spacing literals, no placeholder text. Then on each rendered state: every price and number checked against content.md, plus contrast, accessible names and focus rings',
      foot: 'a source failure short-circuits — no screenshots, no judges, no pass spent' },

    { id: 'render', lane: 'run', kind: 'verify', n: '4', title: 'RENDER EVERY STATE',
      body: 'a real browser, at phone and desktop width. A state you reach by clicking is <b>driven through the interface</b> — so the renderer is the one that found out whether it is reachable, and neither judge is asked to guess' },

    { id: 'designjudge', lane: 'run', kind: 'judge', n: '5', title: 'DESIGN JUDGE — does it look right?',
      body: 'a fresh agent given the pictures, the rubric, and the same anchors the builder saw. Never the brief, the checklist, the code, or how the thing was built — a judge holding the style rules starts excusing a missing error state as restraint',
      foot: 'its verdict on the anchor is advisory, always — direction is yours' },

    { id: 'productjudge', lane: 'run', kind: 'judge', n: '6', title: 'PRODUCT JUDGE — does it solve the brief?',
      body: 'a second fresh agent given the brief, the ratified list, the content, every state and the code. Walks the list one requirement at a time. Anything the brief obliged that the list never mentioned <b>stops the run</b> — the list was wrong, so correcting against it would be aiming at the wrong target' },

    { id: 'deliver', lane: 'run', kind: 'step', n: '7', title: 'DELIVER',
      body: 'the only way out, including every stop. It always names what went unjudged and which checks were never written, so a thin pass can never be mistaken for a clean one' },

    // ---- the join ----
    { id: 'adjudicate', lane: 'join', kind: 'correct', title: 'ADJUDICATE',
      body: 'waits for both judges, adds the lint\'s and the renderer\'s findings, and routes to exactly one of deliver, correct, or stop. Clean means <b>nothing blocking from anywhere</b>',
      alignWith: 'designjudge' },

    { id: 'conflict', lane: 'join', kind: 'note',
      body: 'two blocking findings that cannot both be satisfied end the run and are quoted back to you verbatim. A finding that merely survives a fix is not a conflict — it means the edit helped without finishing the job' },

    { id: 'correct', lane: 'join', kind: 'correct', title: 'CORRECT',
      body: 'targeted edits, never a regenerate, so nothing already right gets gambled away. Then the whole surface re-verifies, because fixing one thing breaks another constantly',
      foot: 'two passes total, then it delivers the best one' },

    // ---- close ----
    { id: 'you', lane: 'close', kind: 'you', title: 'YOU — the taste, and the call on the brief',
      body: 'accept it · reject it and say why (the why is the whole payload) · override a rule · settle something the brief implied but the list missed',
      alignWith: 'deliver' },

    { id: 'harvest', lane: 'close', kind: 'harvest', title: 'HARVEST — where the judgement is kept',
      body: 'opens with one question, always: <b>is this the reference for this surface?</b> A yes makes it the newest anchor. Then every other learning goes to exactly one home, you confirm each write, and every write prunes — nothing here only grows',
      foot: 'nothing worth keeping? it says so in one line and stops' },

    { id: 'ladder', lane: 'close', kind: 'note',
      body: 'the point of the whole thing: a rule argued about twice becomes a written rule, and a written rule that turns out mechanically checkable becomes a lint check — where it is enforced for free instead of re-litigated every run' },

    { id: 'comppr', lane: 'close', kind: 'side', title: 'component PR',
      body: 'a snippet you keep rebuilding is proposed to whoever owns the design system, never quietly ported in' }
  ],

  EDGES: [
    // in
    { f: 'brief',    t: 'frame',  c: 'violet', l: 'the ask' },
    { f: 'quickref', t: 'frame',  c: 'gray', dash: 1 },
    { f: 'reqtemplate', t: 'frame', c: 'gray', dash: 1 },
    { f: 'frame',    t: 'gate',   c: 'navy', l: 'the checklist' },
    { f: 'gate',     t: 'retrieve', c: 'navy', l: 'ratified' },

    // build
    { f: 'protos',   t: 'retrieve', c: 'gray', dash: 1, l: 'the anchors' },
    { f: 'retrieve', t: 'generate', c: 'navy' },
    { f: 'tokens',   t: 'generate', c: 'gray', dash: 1 },
    { f: 'content',  t: 'generate', c: 'gray', dash: 1 },
    { f: 'donts',    t: 'generate', c: 'gray', dash: 1, l: 'known failures' },
    { f: 'generate', t: 'lint',   c: 'navy', l: 'a draft you have not seen' },
    { f: 'lintscript', t: 'lint', c: 'gray', dash: 1 },
    { f: 'lint',     t: 'render', c: 'navy' },
    { f: 'render',   t: 'designjudge', c: 'navy', l: 'the pictures' },
    { f: 'render',   t: 'productjudge', c: 'violet', side: 'left', bulge: 60 },
    { f: 'brief',    t: 'productjudge', c: 'violet', dash: 1, side: 'left', bulge: 300 },
    { f: 'donts',    t: 'designjudge', c: 'gray', dash: 1, l: 'the rubric' },

    // join
    { f: 'designjudge',  t: 'adjudicate', c: 'red' },
    { f: 'productjudge', t: 'adjudicate', c: 'violet' },
    { f: 'lint',   t: 'adjudicate', c: 'red', side: 'right', bulge: 40 },
    { f: 'render', t: 'adjudicate', c: 'red', side: 'right', bulge: 70, l: 'a state it could not reach' },
    { f: 'adjudicate', t: 'correct', c: 'red', l: 'something blocking' },
    { f: 'correct', t: 'lint', c: 'red', side: 'right', bulge: 90, l: 'then the whole surface re-verifies' },
    { f: 'adjudicate', t: 'deliver', c: 'navy', side: 'right', bulge: 130, l: 'nothing blocking anywhere' },
    { f: 'productjudge', t: 'deliver', c: 'violet', side: 'left', bulge: 110, l: 'the brief obliged something the list missed' },

    // close
    { f: 'deliver', t: 'you', c: 'navy' },
    { f: 'you', t: 'harvest', c: 'navy', l: 'the session ends here' },
    { f: 'annotations', t: 'harvest', c: 'orange', side: 'left', bulge: 340, l: 'what designers marked up' },

    // write-back
    { f: 'harvest', t: 'protos',      c: 'orange', side: 'left', bulge: 40,  l: 'a new anchor' },
    { f: 'harvest', t: 'donts',       c: 'orange', side: 'left', bulge: 90,  l: 'a rejection, and why' },
    { f: 'harvest', t: 'lintscript',  c: 'orange', side: 'left', bulge: 140, l: 'a rule that turned out checkable' },
    { f: 'harvest', t: 'reqtemplate', c: 'orange', side: 'left', bulge: 190, l: 'a miss we keep making' },
    { f: 'harvest', t: 'content',     c: 'orange', side: 'left', bulge: 240, l: 'a number that was wrong' },
    { f: 'harvest', t: 'brief',       c: 'violet', side: 'left', bulge: 290, l: 'the doc itself was wrong' },
    { f: 'harvest', t: 'comppr',      c: 'green' }
  ]
};
