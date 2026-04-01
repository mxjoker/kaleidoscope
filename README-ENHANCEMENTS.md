# The Kaleidoscope — Three Improvements Complete 🎭

## Summary

You now have **three major enhancements** ready for The Sailors campaign app:

### 1. **Debug Panel Toggle** (Default Off) ✅
Raw Events are now hidden by default in the DM Report. Click the toggle header to show/hide them. State persists using localStorage.

### 2. **Character Sheet Persistence** (Extended Fields) ✅  
All five characters now save:
- **Notes** — Personal character notes (1s auto-save on text input)
- **Death Saves** — Success/failure pips for unconscious mechanics
- **Conditions** — Active conditions (poisoned, stunned, etc.)
- **Proficiencies** — Placeholder for future skill proficiency tracking

### 3. **Games Auto-Adjust Gold** ✅
When Kimchi's games finish (Tide's Truth, Blade, Bottle, Rope), the player's gold updates **immediately** on screen and persists to the server.

---

## Files Modified/Created

### ✅ **DONE** — Server-Side (Netlify Functions)
**`netlify/functions/character_state.js`**
- All five characters now include: `deathSaves`, `notes`, `proficiencies`
- Removed legacy `charNotes` and `reminders` fields
- Backward compatible with existing saves

### ✅ **DONE** — Client-Side Support Script (NEW)
**`kaleidoscope-enhancements.js`** (NEW FILE, 238 lines)
- `updatePlayerGoldAfterGame(playerName, goldChange)` — Real-time gold updates
- `initDebugPanel()` — Toggle initialization with localStorage
- `setupCharacterNotesAutosave()` — Auto-save with debounce
- `setupCharacterConditionsAutosave()` — Condition pill toggling
- `setupCharacterDeathSavesAutosave()` — Death save tracking

### ⚠️ **NEEDS MANUAL STEP** — HTML & CSS
**`index.html`**
- CSS for debug panel added ✅
- Script tag to load enhancements added ✅
- **Still need:** Wrap the Raw Events card in debug panel container (see instructions below)

---

## FINAL STEP: Wrap Raw Events in Debug Panel

You have **two options**:

### **Option A: Automated (Recommended)**
If you have Node.js available in your kaleidoscope directory:
```bash
cd /Users/joecoover2022/Downloads/kaleidoscope
node wrap-debug-panel.js
```

This script will automatically find and wrap the Raw Events section.

### **Option B: Manual**

1. Open `index.html` in a text editor
2. Search for: `Raw Events` (should find the DM Report section)
3. Find the full card structure:
   ```html
   <div class="card">
     <div class="dm-section-title">Raw Events</div>
     <div id="dm-raw-events">
       ... (lots of rows)
     </div>
   </div>
   ```

4. Replace it with:
   ```html
   <div class="debug-panel hidden">
     <div class="debug-panel-header">
       <span class="debug-panel-title">🔧 Raw Events (Debug)</span>
       <span class="debug-panel-toggle">▶</span>
     </div>
     <div class="debug-panel-content">
       <div class="card">
         <div class="dm-section-title">Raw Events</div>
         <div id="dm-raw-events">
           ... (keep all the existing rows)
         </div>
       </div>
     </div>
   </div>
   ```

5. Save the file

---

## How to Use Each Feature

### **Debug Panel Toggle**
- DM opens the app → goes to DM Report
- Raw Events card is **collapsed by default**
- Click "🔧 Raw Events (Debug)" header to expand/collapse
- State persists across page reloads (localStorage: `debugPanelHidden`)

### **Character Sheet Persistence**

**Notes Field:**
1. Player opens character sheet
2. Scrolls to Notes section
3. Types or edits notes
4. After 1 second of no typing, notes auto-save silently
5. Refresh page → notes still there

**Conditions:**
1. Player clicks a condition pill (Poisoned, Stunned, etc.)
2. Pill highlights (active state)
3. Save happens automatically to server
4. Condition state persists across page loads

**Death Saves:**
1. Player clicks a death save pip (green for successes, red for failures)
2. Pip fills when clicked (toggles on/off)
3. State auto-saves to server
4. Death save count persists across sessions

### **Games Auto-Adjust Gold**

**After Tide's Truth Result:**
```javascript
// Player bet 10gp, won 7:1 payout
updatePlayerGoldAfterGame(playerName, 70);  // or updatePlayerGoldAfterGame(playerName, -10) if they lost
```

**After Blade, Bottle, Rope Result:**
```javascript
// Player won 15gp net
updatePlayerGoldAfterGame(playerName, 15);
```

Gold updates immediately on screen + persists to server.

---

## Testing Checklist

- [ ] **Debug Panel Toggle**
  - Click header in DM Report → content hides/shows
  - Refresh page → remembers closed state
  
- [ ] **Notes Persistence**
  - Add text to character notes
  - Wait 1 second
  - Refresh → text still there
  
- [ ] **Conditions Persistence**
  - Toggle a condition on/off
  - Refresh → condition state preserved
  
- [ ] **Death Saves Persistence**
  - Click some death save pips
  - Refresh → pips still marked
  
- [ ] **Game Gold Updates**
  - Play a game and win/lose
  - Gold amount updates immediately
  - Check character sheet → gold is updated there too

---

## Deployment

After making the Raw Events wrap change:

1. Open kaleidoscope folder
2. Drag and drop entire folder to Netlify (as before)
3. App will deploy with all three improvements active

---

## Files Reference

| File | Status | Notes |
|------|--------|-------|
| `netlify/functions/character_state.js` | ✅ Updated | Supports notes, deathSaves, conditions, proficiencies |
| `kaleidoscope-enhancements.js` | ✅ New | Support script for all three features |
| `index.html` | ⚠️ Partial | Needs Raw Events wrapping (use script or manual) |
| `wrap-debug-panel.js` | ✅ New | Helper script to wrap Raw Events automatically |
| `ENHANCEMENT-GUIDE.md` | ✅ New | Detailed implementation guide |

---

## Questions?

All three features are self-contained and independent. You can enable them in any order or test them individually.

The `kaleidoscope-enhancements.js` script initializes all features on page load automatically — no additional setup needed after the Raw Events wrapping step.

Good luck with Ratstew Gap! 🎲
