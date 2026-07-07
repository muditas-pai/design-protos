# Chat Flow — Cycling Rotator Phrases

The conversational loading labels in the chat flow (`src/chat/loadingPhrases.js`). Each stage's
pool = **canonical label → 5 flavor variants → 6 shared generics**, shuffled, one every ~4.2s.
All are en.json `chat_phrase_*` keys with the in-source string as fallback.

## Per-stage phrases

| Stage | Phrase | |
|---|---|---|
| **planning** | Planning your deck... | *canonical* |
| | Mulling over a few directions | |
| | Mapping it out | |
| | Sorting through what fits best | |
| | Working the angles | |
| | Lining things up | |
| **research** | Researching... | *canonical* |
| | Digging in | |
| | Pulling threads together | |
| | Picking up the patterns | |
| | Following up on a few leads | |
| | Working through the details now | |
| **slides** | Designing outline... | *canonical* |
| | Putting the pieces in place | |
| | Stitching this together | |
| | Building the flow | |
| | Plugging away at the details | |
| | Sharpening the message | |
| **final** | Polishing... | *canonical* |

## Shared generics

Appended to *every* stage (`chat_phrase_generic_1…6`):

| Phrase |
|---|
| On the right track |
| Pieces are clicking |
| Working behind the scenes |
| Making steady progress on this |
| Letting it simmer |
| Thinking it over |
