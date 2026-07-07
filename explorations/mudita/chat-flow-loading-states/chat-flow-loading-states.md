# Chat Flow — Cycling Rotator Phrases

The conversational loading labels in the chat flow (`src/chat/loadingPhrases.js`). Each stage's
pool = **canonical label → 5 flavor variants → 6 shared generics**, shuffled, one every ~4.2s.
All are en.json `chat_phrase_*` keys with the in-source string as fallback.

**Shared generics** (appended to *every* stage) — `chat_phrase_generic_1…6`:
On the right track · Pieces are clicking · Working behind the scenes · Making steady progress on this · Letting it simmer · Thinking it over

| Stage (canonical label) | Flavor variants |
|---|---|
| **planning** — "Planning your deck..." | Mulling over a few directions · Mapping it out · Sorting through what fits best · Working the angles · Lining things up |
| **research** — "Researching..." | Digging in · Pulling threads together · Picking up the patterns · Following up on a few leads · Working through the details now |
| **slides** — "Designing outline..." | Putting the pieces in place · Stitching this together · Building the flow · Plugging away at the details · Sharpening the message |
| **final** — "Polishing..." | *(canonical + generics only)* |
