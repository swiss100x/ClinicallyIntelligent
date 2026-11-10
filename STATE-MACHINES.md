# State machines on clinicallyintelligent.com

Every interactive part of the site is a small state machine written in plain inline JavaScript. This file names each one, its states, and where its code lives, so a person or an agent can change one without reverse-engineering the page.

Where a machine's state matters, the page also shows it as a `data-state` (or `data-card` / `data-voice`) attribute. CSS can style it, tests can wait for it, and agents can read it without parsing the page's text.

## 1. Subscriber status (shared by every page)

One fact, read across the whole site: has this visitor signed up?

| Key in `localStorage` | Set when | Read by |
|---|---|---|
| `ci_subscribed` | Any confirmed sign-up, on any page | Everything below |
| `ci_field_guide_02_unlocked` | Confirmed sign-up (older pages set only this), or the Prompting Guide's own offline fallback | Publication sign-up boxes, both Field Guides, templates |
| `ci_field_guide_01_unlocked` | Confirmed sign-up | Nothing at present. The Safety Check has no gate since v2 (November 2026); the key is still set so older pages stay consistent. |
| `ci_templates_unlocked` | Confirmed sign-up, or "Already subscribed?" / offline fallback on `/templates/` | Templates |

Rules:

- **A confirmed sign-up sets all four keys.** "Confirmed" means the Beehiiv Worker answered without an error.
- **Gates (the Prompting Guide, templates) open on their own key, `ci_subscribed` or `ci_field_guide_02_unlocked`.** Over-opening is harmless: the content is free.
- **Sign-up boxes hide only for a confirmed subscriber** (`ci_subscribed` or the older `ci_field_guide_02_unlocked`). An offline fallback on a Field Guide opens that guide only and never hides sign-up elsewhere.
- Every read and write sits in `try/catch`, so the site still works with storage blocked.

In code: `CI_SUB` on `/`, `/subscribe/` and `/publication/`; the key arrays in the Field Guide and templates scripts.

## 2. Sign-up form (homepage, `/subscribe/`, `/publication/` top box and reply slip, the Prompting Guide, `/templates/`)

```
idle --submit--> [typo offered] --submit again--> submitting --ok--> done (Field Guides, templates: unlocked)
                                                        \--error--> error --submit--> submitting
```

- `form[data-state]`: `idle`, `submitting`, `done` or `unlocked`, `error`.
- A submit while `submitting` is ignored, so a double tap sends one request.
- Typo check (homepage and `/subscribe/`): a known misspelt domain (for example `gamil.com`) is corrected in the box. The next press submits it.
- Success is only `response.ok`, `ok !== false` and no `error` (homepage, `/subscribe/`, publication). The Field Guide and templates gates keep their original rule and open on a network failure so nobody is locked out of free content.
- UTM tags: see each page's script. The publication page uses `page_top` and `issue_preview`.

## 3. Problems card (`/problems/`)

```
invitation -> page1 -> page2 <-> page3
   page1 or page3 --drop it in--> posting --ok--> posted --another card--> page1
                                       \--error--> failed --try again--> posting
```

- `body[data-card]`: `invitation`, `page1`, `page2`, `page3`, `posting`, `posted`, `failed`.
- `busy` blocks taps while a page turn or the posting animation runs.
- Draft: an unfinished card is kept in `localStorage` (`ci_problems_card`) for 12 hours and restored with "Your card is where you left it".
- Voice (`body[data-voice]`: `idle`, `listening`): the "Say it" mic on page 1. It stops when the page turns or the card is sent. It records `input_method` as `typed`, `dictated` or `both`. `route` is `quick` or `full`.

## 4. Publication shelf (`/` and `/publication/`)

- `current` issue on the desk. Picking the same issue again does nothing. "Back to the latest" returns to it.
- Shelf or list view: the "See as a list" toggle (`aria-pressed`).
- Data: `/data/issues.json`, with `/data/issues-overrides.json` on top, and a built-in sample if both fail.
- Publication only: the campaign intro shows for `utm_source` of `banner`, `poster`, `email` or `qr`.

## 5. Smaller machines

| Where | States | Signal |
|---|---|---|
| "Would you send it?" (`/work/would-you-send-it/`, `/overview/`) | `searching` -> `revealed` (both words found, or "Show me") -> `searching` ("Try again"). Taps after the reveal do nothing. | `#ai[data-state]` |
| Spot the fake (`/answers/does-chatgpt-make-up-references/`) | unrevealed -> revealed (A, B or "Just show me") | `.spot.on` |
| Slide viewer (`/overview/` workshop slides) | closed -> open on slide 1 or 2 -> closed | `dialog#lb[open]`, `#lb-n` |
| Film dialog (`/`) | closed -> open (playing) -> closed (paused) | `dialog#film[open]` |
| Homepage reel | playing or paused, on slide n | `#reelPlay[aria-label]` |
| Menu sheet (shared header) | closed -> open -> closed (Escape, link, or wider screen) | `.sh-menu[aria-expanded]` |
| Share buttons (`/build/`, "Would you send it?", `/overview/`) | idle -> "Link copied" -> idle after 2.5s | button text |
| Copy prompt (`/templates/`) | idle -> "Copied" -> idle after 2.2s, also on a double tap | `.copied` |

## 6. The Clinician's AI Safety Check (`/field-guides/safety-check/`)

Free and open: no gate, no email, nothing saved or sent. Its "Subscribe free" link goes to `/subscribe/`.

```
quick check:  q1 --yes--> q2 --yes--> q3 --no--> clear
              any question --no / not sure (or yes on q3)--> stop | change | ask
              any outcome --start again--> q1
```

- `#qc[data-state]`: `q1`, `q2`, `q3`, `stop`, `change`, `ask`, `clear`. The outcome words and wording live in the `R` table in the page script.
- "The details add up": `#lesson[data-step]` is `0` to `3`. "Add the next detail" moves forward; "Start again" returns to `0`.
- Practice chat: `#chat[data-state]` is `asking`, then `stop`, `better` or `best` for the reply chosen. Choosing again replaces the verdict.
- Print the reminder: adds `body.card-mode`, prints, and removes it on `afterprint`. The card is a hidden section of the same page, so any wording change goes in both places.
- Archive: version 1.0 is kept at `/field-guides/safety-check/v1/` with no gate and no interactive parts. It is `noindex` and linked only from "Version history".
- Downloads: `AI_Safety_Check_one_page_reminder_A4.pdf` and `The_Clinicians_AI_Safety_Check_Field_Guide_01.pdf`, regenerated from the page, plus three posters (`CI_AI_Safety_Check_Wall_Poster_A3.pdf`, `..._A4.pdf`, `CI_AI_Safety_Check_Reference_Poster_A3.pdf`). Poster wording must match the page; change both together. The old link `downloads/AI Safety Checklist.pdf` serves the current guide.

### The AI Safety Challenge (`/field-guides/safety-check/challenge/`)

```
entry --start--> deciding --check--> feedback --try again (up to 2)--> deciding
                                         \--continue--> deciding (next) ... --> results --do it again--> deciding
```

- `#app[data-state]`: `entry`, `deciding`, `feedback`, `results`.
- Choices are locked while feedback shows. Answers are graded on the page; nothing is stored or sent (`record()` is an empty hook for a future version that needs a privacy review first).
- The results screen offers the one-page reminder first and the full guide second.

## 7. Password-locked previews

Some private previews are published as a single page whose content is encrypted (AES-256-GCM, key from the password with PBKDF2-SHA256, 600,000 rounds). The content can only be read with the password; the page is safe on public hosting.

```
locked --submit--> unlocking --right password--> opened (the content replaces the page)
                        \--wrong password--> error --submit--> unlocking
refresh in the same tab --> unlocking --> opened, using the key kept for this tab
```

- `form[data-state]`: `locked`, `unlocking`, `error`, `opened`.
- The tab keeps the derived key for that one file in `sessionStorage`, never the password, and forgets it when the tab closes or the key stops working.
- Only the locked page is ever committed. The unlocked file and the locking tool stay off the repo, because everything here is public, history included. Previews are not linked, not in the sitemap and not named in robots.txt; they ask search engines not to list or archive them.
- A new password or new content means re-locking with the locking tool and replacing the page.

## Adding a new interactive part

1. Write its states down here first.
2. Keep one variable as the source of truth, and show it as `data-state` where it matters.
3. Ignore input that doesn't apply in the current state, rather than letting it change the screen.
4. If it touches subscriber status, use the rules in section 1.
