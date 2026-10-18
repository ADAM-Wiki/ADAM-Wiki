---
target: critique the /kontakt page
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:C:\\Users\\ljack\\Desktop\\ProjekatAdam\\src\\components\\KontaktPage.tsx"
target_fingerprint: "sha256:bf7638674de5fe15dc62968c100f6fd52eafff6b998284f53da617db96fb0552"
target_path: "C:\\Users\\ljack\\Desktop\\ProjekatAdam\\src\\components\\KontaktPage.tsx"
timestamp: 2026-10-09T21-14-45Z
slug: src-components-kontaktpage-tsx
---
Method: dual-agent (A: Explore · B: default agent) with parent browser verification

Assessment A reviewed the contact form source and page content; the parent session captured the rendered desktop page and checked mobile layout dimensions at 375px. The contact form was not submitted. Assessment B ran the CLI detector and browser overlay on a fresh tab.

## Design Health Score

| #         | Heuristic                       |     Score | Key issue                                                                                           |
| --------- | ------------------------------- | --------: | --------------------------------------------------------------------------------------------------- |
| 1         | Visibility of System Status     |         3 | Sending, success, and failure states are visible; sending has no explicit live-region announcement. |
| 2         | Match System / Real World       |         4 | Familiar fields and plain-language Serbian validation fit the task.                                 |
| 3         | User Control and Freedom        |         3 | Retry and exit are available; drafts are not restored after leaving.                                |
| 4         | Consistency and Standards       |         3 | Native form semantics are strong; fallback/error paths are less predictable.                        |
| 5         | Error Prevention                |         3 | Required fields, email validity, first-invalid focus, and a honeypot prevent common problems.       |
| 6         | Recognition Rather Than Recall  |         3 | Labels and inline errors are clear; there is no nearby guide for useful correction reports.         |
| 7         | Flexibility and Efficiency      |         2 | Autofill and keyboard use work, but an interrupted draft cannot be restored.                        |
| 8         | Aesthetic and Minimalist Design |         3 | The centered form is focused and uncluttered; the page is generic for this research archive.        |
| 9         | Error Recovery                  |         2 | The failure message implies a connection problem for every non-OK response and suggests YouTube.    |
| 10        | Help and Documentation          |         1 | Processing details exist only on a separate privacy page; no direct email fallback is offered.      |
| **Total** |                                 | **27/40** | **Acceptable (67.5%)**                                                                              |

Cognitive load: **1 failure of 8.** The form itself is simple: three labeled fields and one action. Minimal choices fails in the desktop global navigation, with five destinations plus utilities visible. Mobile check at 375px showed no horizontal overflow; the submit target is 44px high.

## Design Specificity Verdict

**LLM assessment:** The page is clear and purpose-built enough to complete a basic contact task, but could belong to nearly any organization. It does not make the project’s source-focused research identity visible in the interaction, and the YouTube fallback is a weak substitute for a direct contact path.

**Deterministic scan:** CLI `detect --json src/components/KontaktPage.tsx` exited 0 with **0 findings**. Browser detector rendered **6 hits across 4 rule types**: three undersized footer social labels, a kicker above the heading, overused Inter (93%), and a two-axis grid background. The grid is a verified false positive: `.page-no-grid` hides the global grid pseudo-element in `src/index.css`. Inter is the site’s intentionally self-hosted body face in `src/fonts.css`, so that warning is advisory rather than actionable. The three 10px footer links are valid findings; the `KONTAKT` kicker is a minor duplicate of the page title. The browser overlay was injected and rendered on the detector’s fresh contact tab; no form data was sent.

## Overall Impression

The form is unusually thoughtful about validation and state handling. Its biggest trust gap is that users enter personal details and message content into a Formspree-powered form without a nearby disclosure; its biggest recovery gap is a generic error message that points to the wrong cause and a weak fallback.

## What's Working

- Required-field and email errors are inline, localized, actionable, and focus the first invalid field.
- Native labels, autocomplete, email input mode, and mobile-sized fields support keyboard and phone use.
- Success and failure preserve clear states; failed submissions retain entered values, and success lets users send another message.

## Priority Issues

1. **[P1] Formspree processing is disclosed away from the form.** The privacy page says Formspree receives the name, email, and message, but the contact form gives no nearby notice or privacy link before submission. Add a concise disclosure beside the submit action and link the privacy policy so people can make an informed choice. Suggested command: `/impeccable clarify`.
2. **[P2] Failure guidance misdiagnoses some errors.** Every non-OK server response and network exception shares “Proverite internet konekciju,” even when the service rejected the request. YouTube is also not a direct equivalent fallback. Distinguish delivery failure causes where possible; otherwise use neutral wording, keep the draft, and offer retry or a reliable direct contact route. Suggested command: `/impeccable harden`.
3. **[P2] Sending status may not be announced reliably.** The button changes to “Slanje…” and becomes disabled, but no live region or `aria-busy` marks the in-progress state. Add a polite status announcement for screen-reader users. Suggested command: `/impeccable audit`.
4. **[P2] The unsaved warning tracks any input, not remaining content.** `dirty` stays true after a user clears every field, so leaving the blank form can still trigger a confirmation. Derive the guard from remaining content or reset it when all fields are empty. Suggested command: `/impeccable harden`.

## Persona Red Flags

- **Jordan, first-time visitor:** Sees no nearby privacy explanation before entering a personal message; the form does not clarify what makes a useful correction or inquiry.
- **Sam, screen-reader user:** Labels, field errors, success `role="status"`, and error `role="alert"` are strong. The “Slanje…” transition is not explicitly announced.
- **Casey, interrupted mobile user:** Fields fit and the submit target is thumb-sized, but a browser exit only prompts; the message cannot be restored if the page is discarded.

## Minor Observations

- “Odgovaramo na svaku poruku” gives no response-time expectation.
- The three footer social links are 10px, below the detector’s functional-text floor.
- `KONTAKT` repeats the meaning of “Pišite nam” and the active navigation item.
- The page offers YouTube but no direct email address as an alternative.

## Questions to Consider

- Should the Formspree notice be a concise sentence beside the button, or a short consent checkbox?
- What is the most reliable fallback if a submission is rejected: retry, direct email, or another contact channel?
