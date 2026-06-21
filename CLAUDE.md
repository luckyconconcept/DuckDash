# Project Git Rules

- After every completed work step, commit and push immediately to `origin`.
- Use `git add -A`, a short clear commit message, and `git push`.
- Commit and push based on completed progress, not on a timer.
- Push only to `origin`, which must remain the owner's repository.
- Never change the push target away from `origin`.
- At the beginning of every new session, inspect `git log` and `git status`, orient briefly, then continue work seamlessly.
- Continue using commit and push after every completed step throughout the session.

# Locked Visual Baseline

- The current duck height and animated water surface are approved and must stay unchanged unless the user explicitly asks to revise them.
- Keep `WATER_SURFACE_Y = 456`, `DUCK_WATERLINE = 476`, and the current water animation setup in `game.js` as the baseline.
- Do not retune water wave amplitudes, foam flecks, shimmer, bathtub runoff, or duck float height during unrelated gameplay, UI, or asset work.
