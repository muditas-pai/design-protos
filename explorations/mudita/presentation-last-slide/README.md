# Presentation — last slide

The end-of-presentation screen, broken out by **user state**. Each state shows a different modal
and set of next-steps. Source spec: Notion → *Last screen of Presentation View* (Roadmaps · Live
Releases, P0).

| User state | Modal | Next-steps | Prototype |
|---|---|---|---|
| **Free, logged in** | Export PPT · Upgrade to Pro | Continue to Editor · Share · Replay | [`free-logged-in.html`](free-logged-in.html) |
| **Pro / Gold, logged in** | _none (skip the modal)_ | Continue to Editor · Share · Replay | [`pro-gold-logged-in.html`](pro-gold-logged-in.html) |
| **Not logged in** (opened a published link) | Export PPT · Sign Up | Share · Replay | [`not-logged-in.html`](not-logged-in.html) |

Notes (now resolved in the protos): a "Your presentation is ready · Start editing" toast that the
user can dismiss; the Exit control renamed to **Go to Editor**.
