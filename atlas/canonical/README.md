# canonical

Screens that are right. Not examples of the harness, examples of the work.

Mudita puts them here.

## What belongs

A screen somebody would point at and say *this is how we do it*. Shipped or not — what matters is
that it settles a question, so a later argument can be answered by opening it rather than by
debating.

One folder per screen, named for the thing rather than the run:

```
canonical/
  <screen-name>/
    <screen-name>.html      the screen
    assets/                 only what it references
    about.md                what it gets right, and why it is here
```

`about.md` matters as much as the file. A screen in a folder called canonical says *this is good*
and nothing more; a sentence saying **what** it is good at is what makes it usable — the type
hierarchy, the way it handles an empty state, how it earns a decision.

## What does not belong

**A screen this harness produced.** Those live in `designs/<feature>/runs/`, which is the record of
what happened. Something here is a reference, not a result, and copying a pass into it would mean
the harness grading its own homework.

**A screenshot.** The markup has to be readable, or the only thing anyone can take from it is what
it looks like.

## What reads this

**Nothing, yet.** That is deliberate for now — the folder exists so good work has somewhere to go
before anything depends on it.

Three plausible consumers, none of them decided:

- **`/atlas-build`** could few-shot from these, which is the strongest argument for the folder and
  also the fastest route to copying rather than learning.
- **`/atlas-judge-design`** could use them the way it uses the annotations — worked examples of what
  right looks like, which is the single biggest lever it has on being right.
- **A person**, picking a direction before anything is drawn.

`designs/*/annotations.jsonl` already carries rules learned from real screens. That is the same idea
at a smaller grain: a note on an element rather than a whole screen. These should end up related —
a rule with a canonical screen behind it is a rule you can argue with.
