# Slideshow remote

Use your phone as a remote for a Presentations.AI slideshow. Prototype.

## Run

    python3 server.py

- Laptop: http://127.0.0.1:8760/ (deck page, then Present)
- Phone: scan the QR code in the slideshow (Settings, then Connect phone remote), or open `http://<laptop-ip>:8760/r` and type the 4-digit code. Phone and laptop need the same Wi-Fi.

## How it connects

Not Bluetooth. iPhone Safari cannot use Bluetooth from a web page, and a native iOS app needs Xcode and App Store signing. Instead the laptop page gets a 4-digit code from `server.py`, the phone joins that code, and the server relays taps both ways (long-polling down, POST up). Long-polling works on the local Wi-Fi and through tunnels and office proxies that block live streams. No installs, no accounts.

## Share a public link

    cloudflared tunnel --no-autoupdate --url http://127.0.0.1:8760

Share the `https://….trycloudflare.com` address it prints. The QR code then points at that address, so phones can join from any network. The link works while this Mac, `server.py` and the tunnel are running, and changes each time the tunnel restarts.

## Known limits (prototype)

- Plain HTTP on the LAN, so the phone cannot hold a screen wake lock. The remote asks you to set Auto-Lock to Never while presenting.
- 4-digit code, no accounts. Anyone on the same Wi-Fi with the code can move slides. Disconnect from Settings to get a new code.
- Production would swap `server.py` for a hosted relay over HTTPS, so the link does not depend on one laptop.

## Files

- `index.html`: laptop. Deck page, slideshow, settings menu, connect dialog with QR code.
- `remote.html`: phone. Code entry, Next/Back, black screen, speaker notes, slide grid, laser pointer, timer, disconnect.
- `deck.js` / `deck.css`: sample 7-slide deck with speaker notes, shared by both.
- `server.py`: static files + relay (`/api/pair`, `/api/poll`, `/api/send`, `/api/end`, `/api/info`).
- `tokens.css`: Sumanth design system tokens.
