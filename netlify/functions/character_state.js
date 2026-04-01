import { getStore } from "@netlify/blobs";

// Default character data — used when no saved state exists
const DEFAULTS = {
  axel: {
    name: "Axel", class: "Monk 3", race: "Dragonborn",
    str: 10, dex: 15, con: 14, int: 10, wis: 16, cha: 13,
    hp: 21, maxHp: 21, tempHp: 0,
    ac: 15, speed: 40, pp: 13, prof: 2,
    inspiration: false,
    conditions: [],
    attacks: [
      { name: "Unarmed Strike", bonus: "+4", dmg: "1d4+2 bludgeoning", range: "Melee" },
      { name: "Dagger", bonus: "+4", dmg: "1d4+2 piercing", range: "Melee / 20ft" },
      { name: "Blazing Fists", bonus: "+4", dmg: "+1d6 fire", range: "1 ki, 1/long rest" },
      { name: "Breath Weapon", bonus: "—", dmg: "2d6 lightning (Dex save)", range: "5×30ft line" }
    ],
    slots: [],
    coins: { gp: 354, sp: 0, cp: 0, ep: 0, pp: 0 },
    items: [
      { name: "Blazing Fists Tattoo", desc: "+1d6 fire unarmed, 1 ki, 1/long rest", qty: 1, star: true },
      { name: "Dagger +1", desc: "", qty: 1, star: false },
      { name: "Bracer of Defense", desc: "", qty: 1, star: false },
      { name: "Grappling Hook", desc: "", qty: 1, star: false },
      { name: "10 Darts", desc: "", qty: 10, star: false }
    ],
    notes: "", charNotes: "", reminders: [],
    proficiencies: {}
  },
  quincy: {
    name: "Quincy", class: "Ranger 4", race: "Wood Elf",
    str: 12, dex: 16, con: 13, int: 9, wis: 14, cha: 10,
    hp: 26, maxHp: 26, tempHp: 0,
    ac: 15, speed: 35, pp: 14, prof: 2,
    inspiration: false,
    conditions: [],
    attacks: [
      { name: "Longbow", bonus: "+5", dmg: "1d8+2 piercing", range: "150/600ft" },
      { name: "Shortsword", bonus: "+5", dmg: "1d6+2 piercing", range: "Melee" },
      { name: "Longsword", bonus: "+3", dmg: "1d8+2 slashing", range: "Melee" },
      { name: "Hunter's Mark", bonus: "—", dmg: "+1d6 on marked target", range: "Concentration" }
    ],
    slots: [{ lvl: "1st", total: 3, used: 0 }],
    coins: { gp: 283, sp: 0, cp: 0, ep: 0, pp: 0 },
    items: [
      { name: "Blue (Sprite)", desc: "Beastmaster companion — AC 17, HP 12, fly 40ft, invisibility, poison shortbow", qty: 1, star: true },
      { name: "Fizzy Firebreath Soda", desc: "10ft cone, DC 11 Dex or 1d4 fire", qty: 1, star: false },
      { name: "Health Potion", desc: "2d4+2 HP", qty: 1, star: false }
    ],
    notes: "", charNotes: "", reminders: [],
    proficiencies: {}
  },
  rapha: {
    name: "Rapha", class: "Paladin 2", race: "Half-Elf",
    str: 14, dex: 12, con: 8, int: 11, wis: 12, cha: 15,
    hp: 24, maxHp: 24, tempHp: 0,
    ac: 16, speed: 30, pp: 13, prof: 2,
    inspiration: false,
    conditions: [],
    attacks: [
      { name: "Morningstar", bonus: "+4", dmg: "1d8+2 piercing", range: "Melee" },
      { name: "Dagger", bonus: "+4", dmg: "1d4+2 piercing", range: "Melee / 20/60ft" },
      { name: "Divine Smite", bonus: "—", dmg: "2d8 radiant", range: "On hit" },
      { name: "Divine Favor", bonus: "—", dmg: "+1d4 radiant", range: "Concentration, 1 min" }
    ],
    slots: [{ lvl: "1st", total: 3, used: 0 }],
    coins: { gp: 120, sp: 0, cp: 0, ep: 0, pp: 0 },
    items: [
      { name: "Cotton Candy Cloud", desc: "Feather Fall 1 round", qty: 1, star: true },
      { name: "Music Charm", desc: "Advantage on Persuasion for 10 min (from carnival singing contest)", qty: 1, star: true },
      { name: "Glittercorn Popcorn", desc: "DC 10 Con or blinded 1 turn in 10ft radius", qty: 1, star: false },
      { name: "Healer's Kit", desc: "Stabilise a creature, 10 uses", qty: 1, star: false }
    ],
    notes: "", charNotes: "", reminders: [],
    proficiencies: {}
  },
  wayne: {
    name: "Wayne", class: "Wizard 3", race: "Gnome",
    str: 8, dex: 11, con: 10, int: 15, wis: 14, cha: 19,
    hp: 14, maxHp: 14, tempHp: 0,
    ac: 10, speed: 30, pp: 12, prof: 2,
    inspiration: false,
    conditions: [],
    attacks: [
      { name: "Fire Bolt", bonus: "+4", dmg: "1d10 fire", range: "120ft" },
      { name: "Quarterstaff", bonus: "-1", dmg: "1d6-1 bludgeoning", range: "Melee" },
      { name: "Charm of Spark", bonus: "—", dmg: "Lightning Bolt 1st level, no slot", range: "1/day" }
    ],
    slots: [
      { lvl: "1st", total: 4, used: 0 },
      { lvl: "2nd", total: 2, used: 0 }
    ],
    coins: { gp: 150, sp: 0, cp: 0, ep: 0, pp: 0 },
    items: [
      { name: "Charm of Spark", desc: "Lightning Bolt 1/day at 1st level, no slot required", qty: 1, star: true },
      { name: "Carnival Manifest", desc: "Partially unknown script — Wayne's name at bottom, sigil of elemental cult", qty: 1, star: true },
      { name: "Cloak of Billowing", desc: "Billows dramatically on command. Purely cosmetic.", qty: 1, star: false },
      { name: "Pearl of Power (Lesser)", desc: "Recover one 1st-level spell slot (1/day)", qty: 1, star: false }
    ],
    notes: "", charNotes: "", reminders: [],
    proficiencies: {}
  },
  myrtle: {
    name: "Myrtle", class: "Rogue 3", race: "Halfling",
    str: 12, dex: 17, con: 15, int: 10, wis: 8, cha: 13,
    hp: 24, maxHp: 24, tempHp: 0,
    ac: 13, speed: 30, pp: 13, prof: 2,
    inspiration: false,
    conditions: [],
    attacks: [
      { name: "Rapier", bonus: "+5", dmg: "1d8+3 piercing", range: "Melee" },
      { name: "Hand Crossbow", bonus: "+5", dmg: "1d6+3 piercing", range: "30/120ft" },
      { name: "Shortsword", bonus: "+5", dmg: "1d6+3 piercing", range: "Melee" },
      { name: "Sneak Attack", bonus: "—", dmg: "+2d6 on eligible hit", range: "—" }
    ],
    slots: [],
    coins: { gp: 51, sp: 0, cp: 0, ep: 0, pp: 0 },
    items: [
      { name: "Locked Carnival Box", desc: "Picked off a fire-breather. Dark lacquered, no keyhole, faintly warm. Don't ask.", qty: 1, star: true },
      { name: "Gloves of Thievery", desc: "+5 to Sleight of Hand and lockpicking, invisible while worn", qty: 1, star: true },
      { name: "Silent Steps Tattoo", desc: "Advantage on Stealth for 10 min (1/long rest)", qty: 1, star: true },
      { name: "Bag of Chalk Shadows", desc: "5ft puff of darkness 1/day", qty: 1, star: false },
      { name: "Disguise Kit", desc: "", qty: 1, star: false }
    ],
    notes: "", charNotes: "", reminders: [],
    proficiencies: {}
  }
};

export default async function handler(req, context) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (req.method === "OPTIONS") {
    return new Response("", { status: 200, headers });
  }

  const store = getStore("kaleidoscope");

  // GET — fetch character state
  if (req.method === "GET") {
    const url = new URL(req.url);
    const character = url.searchParams.get("character")?.toLowerCase();

    if (!character || !DEFAULTS[character]) {
      return new Response(JSON.stringify({ error: "Unknown character" }), { status: 400, headers });
    }

    try {
      const saved = await store.get(`char_${character}`, { type: "json" });
      // Merge saved state over defaults so new fields always exist
      const state = saved ? { ...DEFAULTS[character], ...saved } : { ...DEFAULTS[character] };
      return new Response(JSON.stringify(state), { status: 200, headers });
    } catch (e) {
      // No saved state yet — return defaults
      return new Response(JSON.stringify(DEFAULTS[character]), { status: 200, headers });
    }
  }

  // POST — save character state or a specific field change
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { character, state, field, oldValue, newValue } = body;

      if (!character || !DEFAULTS[character]) {
        return new Response(JSON.stringify({ error: "Unknown character" }), { status: 400, headers });
      }

      // Save full character state
      if (state) {
        await store.setJSON(`char_${character}`, state);
      }

      // Log the change as an event if field info provided
      if (field !== undefined) {
        const eventStore = getStore("kaleidoscope");
        let events = [];
        try {
          events = await eventStore.get("events", { type: "json" }) || [];
        } catch (e) { events = []; }

        events.push({
          type: "sheet_change",
          character,
          field,
          oldValue,
          newValue,
          timestamp: new Date().toISOString()
        });

        await eventStore.setJSON("events", events);
      }

      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    } catch (e) {
      console.error("character_state POST error:", e);
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
}
