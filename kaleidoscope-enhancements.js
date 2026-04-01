// ═════════════════════════════════════════════════════════════
// KALEIDOSCOPE ENHANCEMENTS
// Three improvements for The Sailors campaign
// ═════════════════════════════════════════════════════════════

// ══════════ 1. GAME GOLD UPDATES ══════════
// Call after any game result to update player gold in real-time
async function updatePlayerGoldAfterGame(playerName, goldChange) {
  // Map of character names to API identifiers
  const charMap = {
    'Axel': 'axel',
    'Axel Flameborn': 'axel',
    'Quincy': 'quincy',
    'Quincy Schueb': 'quincy',
    'Rapha': 'rapha',
    'Wayne': 'wayne',
    'Wayne Kerr': 'wayne',
    'Myrtle': 'myrtle',
    'Myrtle Beetlebite': 'myrtle'
  };
  
  const character = charMap[playerName.trim()] || Object.values(charMap)[0];
  if (!character) {
    console.warn(`Player ${playerName} not found`);
    return;
  }
  
  try {
    // Fetch current character state
    const response = await fetch(`/.netlify/functions/character_state?character=${character}`);
    const state = await response.json();
    
    // Apply gold change
    state.coins.gp = Math.max(0, (state.coins.gp || 0) + goldChange);
    
    // Save updated state
    await fetch(`/.netlify/functions/character_state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        character,
        state,
        field: 'coins.gp',
        oldValue: state.coins.gp - goldChange,
        newValue: state.coins.gp
      })
    });
    
    // Update display if character sheet is visible
    const goldDisplay = document.querySelector(`[data-char="${character}"] .gold-amount`);
    if (goldDisplay) {
      goldDisplay.textContent = state.coins.gp;
      goldDisplay.classList.add('gold-color');
      goldDisplay.style.animation = 'none';
      setTimeout(() => { goldDisplay.style.animation = ''; }, 10);
    }
    
    return state.coins.gp;
  } catch (e) {
    console.error('updatePlayerGoldAfterGame error:', e);
  }
}

// ══════════ 2. DEBUG PANEL TOGGLE (Default Off) ══════════
function initDebugPanel() {
  const debugPanel = document.querySelector('.debug-panel');
  const debugHeader = document.querySelector('.debug-panel-header');
  
  if (!debugHeader || !debugPanel) {
    console.log('Debug panel elements not found');
    return;
  }
  
  // Load saved state from localStorage
  const isHidden = localStorage.getItem('debugPanelHidden') === 'true';
  if (isHidden) {
    debugPanel.classList.add('hidden');
  } else {
    // Default to hidden on first visit
    debugPanel.classList.add('hidden');
    localStorage.setItem('debugPanelHidden', 'true');
  }
  
  // Toggle on header click
  debugHeader.addEventListener('click', (e) => {
    e.stopPropagation();
    const isCurrentlyHidden = debugPanel.classList.contains('hidden');
    
    if (isCurrentlyHidden) {
      debugPanel.classList.remove('hidden');
      localStorage.setItem('debugPanelHidden', 'false');
    } else {
      debugPanel.classList.add('hidden');
      localStorage.setItem('debugPanelHidden', 'true');
    }
  });
}

// ══════════ 3. CHARACTER SHEET PERSISTENCE ══════════
// Automatically save when character fields change
async function saveCharacterField(character, field, newValue) {
  try {
    // Fetch current state
    const response = await fetch(`/.netlify/functions/character_state?character=${character}`);
    const state = await response.json();
    const oldValue = state[field];
    
    // Update field
    state[field] = newValue;
    
    // Save
    await fetch(`/.netlify/functions/character_state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        character,
        state,
        field,
        oldValue,
        newValue
      })
    });
    
    console.log(`Saved ${character}.${field}`);
  } catch (e) {
    console.error(`saveCharacterField error for ${character}.${field}:`, e);
  }
}

// Setup auto-save for notes field with debounce
function setupCharacterNotesAutosave() {
  const notesAreas = document.querySelectorAll('.notes-area');
  let saveTimeout;
  
  notesAreas.forEach(textarea => {
    textarea.addEventListener('input', function() {
      clearTimeout(saveTimeout);
      
      const character = this.closest('[data-char]')?.dataset.char;
      if (!character) return;
      
      saveTimeout = setTimeout(() => {
        saveCharacterField(character, 'notes', this.value);
      }, 1000);
    });
  });
}

// Setup auto-save for conditions
function setupCharacterConditionsAutosave() {
  const conditionPills = document.querySelectorAll('.condition-pill');
  
  conditionPills.forEach(pill => {
    pill.addEventListener('click', function() {
      setTimeout(() => {
        const character = this.closest('[data-char]')?.dataset.char;
        const conditionName = this.textContent.trim();
        const isActive = this.classList.contains('active');
        
        if (!character) return;
        
        // Get current conditions from server
        fetch(`/.netlify/functions/character_state?character=${character}`)
          .then(r => r.json())
          .then(state => {
            let conditions = state.conditions || [];
            
            if (isActive) {
              if (!conditions.includes(conditionName)) {
                conditions.push(conditionName);
              }
            } else {
              conditions = conditions.filter(c => c !== conditionName);
            }
            
            saveCharacterField(character, 'conditions', conditions);
          });
      }, 100);
    });
  });
}

// Setup auto-save for death saves
function setupCharacterDeathSavesAutosave() {
  const deathSavePips = document.querySelectorAll('.ds-pip');
  
  deathSavePips.forEach(pip => {
    pip.addEventListener('click', function() {
      setTimeout(() => {
        const character = this.closest('[data-char]')?.dataset.char;
        const dsGroup = this.closest('.ds-group');
        const isSuccess = dsGroup?.querySelector('.ds-label.success');
        const isMarked = this.classList.contains('marked');
        
        if (!character) return;
        
        // Get current death saves
        fetch(`/.netlify/functions/character_state?character=${character}`)
          .then(r => r.json())
          .then(state => {
            const deathSaves = state.deathSaves || { successes: 0, failures: 0 };
            
            const successPips = dsGroup?.parentElement?.querySelector('.ds-group:nth-child(1) .ds-pip.marked').length || 0;
            const failurePips = dsGroup?.parentElement?.querySelector('.ds-group:nth-child(2) .ds-pip.marked').length || 0;
            
            deathSaves.successes = successPips;
            deathSaves.failures = failurePips;
            
            saveCharacterField(character, 'deathSaves', deathSaves);
          });
      }, 100);
    });
  });
}

// ══════════ INITIALIZE ALL ENHANCEMENTS ══════════
function initKaleidoscopeEnhancements() {
  console.log('Initializing Kaleidoscope enhancements...');
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initDebugPanel();
      setupCharacterNotesAutosave();
      setupCharacterConditionsAutosave();
      setupCharacterDeathSavesAutosave();
    });
  } else {
    initDebugPanel();
    setupCharacterNotesAutosave();
    setupCharacterConditionsAutosave();
    setupCharacterDeathSavesAutosave();
  }
}

// Run on load
initKaleidoscopeEnhancements();
