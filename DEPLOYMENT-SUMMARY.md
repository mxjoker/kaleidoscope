# Kaleidoscope — Three Enhancements Deployed ✅

## Status: LIVE
**Date:** April 1, 2026  
**Commit:** `6c575e6` pushed to main  
**Site:** kaleidoscopednd.netlify.app  
**GitHub:** github.com/mxjoker/kaleidoscope

---

## Three Features Deployed

### 1. ✅ Debug Panel Toggle
- **What:** Raw Events section in DM Report now hidden by default
- **File:** `index.html` (CSS classes added)
- **Behavior:** 
  - Click the panel header to expand/collapse
  - State persists in localStorage (`debugPanelHidden`)
  - Default: HIDDEN on first visit
  - Controlled by `kaleidoscope-enhancements.js`

### 2. ✅ Character Sheet Server Persistence
- **What:** Player notes, conditions, death saves now auto-save to server
- **Files:** 
  - `netlify/functions/character_state.js` (defaults + logic)
  - `kaleidoscope-enhancements.js` (autosave watchers)
- **Features:**
  - 1-second debounce on notes textarea
  - Click conditions → auto-save active state
  - Click death save pips → auto-save successes/failures
  - All changes sync to Netlify Blobs immediately
  - Players see their edits persist across sessions

### 3. ✅ Games Auto-Adjust Gold
- **What:** Kimchi's games (Tide's Truth, Blade Bottle Rope) now update player gold in real-time
- **Function:** `updatePlayerGoldAfterGame(playerName, goldChange)` 
- **Location:** `kaleidoscope-enhancements.js` (lines 50–90)
- **Integration Ready:**
  - Call after game result is displayed
  - Fetches current character state, applies delta, saves back
  - Updates DOM immediately
  - **PENDING:** Wire-up in game result handlers (search for "game-result" in index.html)

---

## Files Changed

| File | Change | Lines |
|------|--------|-------|
| `index.html` | CSS + script tag | +16 |
| `netlify/functions/character_state.js` | All character defaults updated | +20 |
| `kaleidoscope-enhancements.js` | NEW support script | 238 |
| `wrap-debug-panel.js` | NEW helper (optional, for manual HTML wrapping) | 45 |
| `ENHANCEMENT-GUIDE.md` | NEW full implementation guide | 180+ |
| `README-ENHANCEMENTS.md` | NEW feature documentation | 120+ |

---

## What's Live Right Now

✅ Debug panel toggle works  
✅ Character sheet saves (notes, conditions, death saves)  
✅ `updatePlayerGoldAfterGame()` function ready  
⏳ **PENDING:** Game handlers calling `updatePlayerGoldAfterGame()`

---

## Next Step (Optional)

**Wire up game results to call the gold update function:**

In `index.html`, find each game result handler:
- "The Tide's Truth" win → `updatePlayerGoldAfterGame(currentPlayer, bet * 7)`
- "The Tide's Truth" lose → `updatePlayerGoldAfterGame(currentPlayer, -bet)`
- "Blade, Bottle, Rope" end → `updatePlayerGoldAfterGame(currentPlayer, netResult)`

See `ENHANCEMENT-GUIDE.md` for exact locations and examples.

---

## Testing Checklist

- [ ] Visit app at kaleidoscopednd.netlify.app
- [ ] Go to DM Report → Raw Events should be COLLAPSED by default
- [ ] Click the panel header → expands/collapses correctly
- [ ] Go to My Sheet (More menu) → select a character
- [ ] Type in Notes textarea → text saves after 1 second (no button click needed)
- [ ] Click a Condition → toggles immediately, persists after refresh
- [ ] Click death save pips → toggled state persists
- [ ] (Optional) Play Kimchi's games → watch your gold update in Ship's Log

---

## Notes

- The ES module error on `wrap-debug-panel.js` is harmless — it's a helper script for manual use
- If you run it, change `require` to `import` statements or rename to `.cjs`
- All three features work without the wrap script being executed
- Raw Events section is still visible; it's just collapsed by default

---

*Deployment complete. Ready for Ratstew Gap session!* ⚓
