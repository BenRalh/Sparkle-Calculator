// Sol Mate — passive design knowledge, encoded for the interface.
// Mirrors the Sol Mate Claude Skill (climate-first, honest about human judgement).
// Southern-hemisphere examples (Australia): equator-facing = NORTH.

export const HEMISPHERE_NOTE =
  'Southern hemisphere — living spaces face NORTH, and the harsh sun comes from the WEST.'

export const climates = {
  tropical: {
    id: 'tropical',
    name: 'Tropical',
    location: 'e.g. Darwin',
    blurb: 'Hot & humid all year, small day–night swing.',
    priorities: ['Shade everything', 'Cross-ventilate', 'Stay lightweight'],
    accent: '#11b3a3',
    sky: ['#8fe9df', '#e8fbf7'],
  },
  arid: {
    id: 'arid',
    name: 'Arid',
    location: 'e.g. Alice Springs',
    blurb: 'Hot days, cold nights, intense dry sun.',
    priorities: ['Thermal mass', 'Deep shade', 'Night-flush air'],
    accent: '#e07a2f',
    sky: ['#ffc785', '#ffeccb'],
  },
  temperate: {
    id: 'temperate',
    name: 'Temperate',
    location: 'e.g. Melbourne',
    blurb: 'Real winters and warm summers — needs both.',
    priorities: ['Orient north', 'Seasonal shading', 'Insulate + ventilate'],
    accent: '#3f8fd6',
    sky: ['#bfe4ff', '#eef7ff'],
  },
  cold: {
    id: 'cold',
    name: 'Cool',
    location: 'e.g. Hobart',
    blurb: 'Long cold seasons — keep the heat in.',
    priorities: ['Insulate & seal', 'Solar gain', 'Mass in the sun'],
    accent: '#6c7f93',
    sky: ['#cfdae6', '#eef3f8'],
  },
}

export const climateOrder = ['tropical', 'arid', 'temperate', 'cold']

// Each part maps to a passive-design element from the skill.
// why  = the (climate-independent) building-physics reason
// human = where human judgement / modelling / code still rules
// byClimate[id] = { what, here }
export const parts = {
  sun: {
    id: 'sun',
    label: 'Orientation',
    emoji: '🧭',
    tagline: 'Which way the house faces',
    why: "Orientation is free at concept stage and impossible to fix later — aiming the building at the sun is the single highest-leverage passive move.",
    human: 'True north ≠ magnetic north, and site overshadowing matters — verify on the real site, not just the plan.',
    byClimate: {
      tropical: { what: 'Long axis east–west; open the living spaces to the breeze; minimise east/west sun.', here: "Here it's less about chasing sun and more about dodging it and catching wind." },
      arid: { what: 'Compact form; main openings to the north and well shaded; protect the west.', here: 'Capture the mild winter sun, block the brutal summer west sun.' },
      temperate: { what: 'Living spaces face NORTH; push service & buffer rooms to the south and west.', here: 'North = generous, easily-shaded winter sun. Aim the home right at it.' },
      cold: { what: 'Compact, north-facing form to grab every bit of winter sun.', here: 'Maximise solar exposure; minimise the cold, sunless south face.' },
    },
  },
  roof: {
    id: 'roof',
    label: 'Roof & insulation',
    emoji: '🏠',
    tagline: 'The biggest thermal lever',
    why: "The roof takes the most sun and loses the most heat — it's the biggest single lever in the whole envelope.",
    human: 'Exact roof R-value is set by your local code + climate zone — confirm against the NCC and a thermal model.',
    byClimate: {
      tropical: { what: 'Light, reflective roof over a ventilated, well-insulated roof space.', here: 'The roof bakes all year — reflect it, ventilate under it, insulate against radiant heat.' },
      arid: { what: 'Heavy insulation with a light/reflective finish.', here: "Keeps the day's heat out and holds the night's warmth in." },
      temperate: { what: 'Insulate the ceiling/roof FIRST — before walls or floor.', here: 'Most winter heat escapes here, so make it your first insulation spend.' },
      cold: { what: 'Max out roof insulation and seal every air leak at ceiling level.', here: 'Heat rises and escapes here — this is where a cold climate saves the most.' },
    },
  },
  walls: {
    id: 'walls',
    label: 'Walls',
    emoji: '🧱',
    tagline: 'Envelope + optional mass',
    why: 'Walls are the largest surface of the envelope — they set how fast heat moves, and can double as thermal mass.',
    human: 'Wall build-up interacts with structure, fire and waterproofing — get the assembly engineer-checked.',
    byClimate: {
      tropical: { what: "Lightweight, insulated, light-coloured walls that don't store heat.", here: 'Avoid heavy masonry — in humid heat it soaks up the day and radiates into warm nights.' },
      arid: { what: 'Heavy masonry / rammed-earth walls as thermal mass, insulated on the outside.', here: 'The big day–night swing lets massive walls bank heat and release it after dark.' },
      temperate: { what: 'Well-insulated walls, with some internal mass on the sun-facing rooms.', here: 'Insulate against winter cold; keep a little mass to steady the daily swing.' },
      cold: { what: 'Thick, continuous insulation and an airtight wall build-up.', here: 'Every gap is a heat leak in winter — insulate heavily and seal carefully.' },
    },
  },
  windows: {
    id: 'windows',
    label: 'Windows & glazing',
    emoji: '🪟',
    tagline: 'The envelope’s weak point',
    why: 'Glass is the weakest thermal point in a wall — where you gain and lose the most heat. Orientation decides if that helps or hurts.',
    human: 'Glazing spec (double/low-E, U-value, SHGC) should be sized with a thermal model for your actual window areas.',
    byClimate: {
      tropical: { what: 'Modest, well-shaded openings placed to catch the breeze; keep west/east glass tiny.', here: 'Glass = heat gain here. Shade it all and use it for ventilation, not solar gain.' },
      arid: { what: 'Small, deeply-shaded windows, protected from the harsh sun.', here: 'Big glass is a liability in desert sun — keep openings small and shaded.' },
      temperate: { what: 'Generous glass to the NORTH (winter sun), modest elsewhere, minimal west; double-glaze.', here: 'The classic passive-solar move: north glass for free winter warmth, shaded in summer.' },
      cold: { what: 'Generous high-performance (double/triple, low-E) north glazing for solar gain.', here: "Let winter sun in — but spec the glass well so it doesn't bleed the heat back out at night." },
    },
  },
  eaves: {
    id: 'eaves',
    label: 'Eaves & shading',
    emoji: '⛱️',
    tagline: 'Summer out, winter in',
    why: 'The summer sun is high and the winter sun is low — a correctly-sized overhang blocks one and admits the other, automatically.',
    human: 'Exact eave depth depends on your latitude and window heights — confirm with a sun-path / shadow study.',
    byClimate: {
      tropical: { what: 'Deep eaves and verandahs shading every face, all year.', here: 'The sun is high and harsh year-round — wrap the whole house in shade.' },
      arid: { what: 'Deep shading on all openings; add courtyards and screens.', here: 'Intense sun — over-shade rather than under-shade.' },
      temperate: { what: 'Size the north eave to block high summer sun but admit low winter sun; fins for east/west.', here: 'This one detail cuts both summer overheating and winter heating — get it right.' },
      cold: { what: "Moderate north eave — enough for the short summer, not so deep it blocks winter sun.", here: 'Prioritise letting the precious winter sun reach in.' },
    },
  },
  door: {
    id: 'door',
    label: 'Entry & sealing',
    emoji: '🚪',
    tagline: 'Cheap, high-return airtightness',
    why: 'Gaps around doors leak conditioned air — sealing is cheap and one of the highest-return moves there is.',
    human: 'Airtightness is best verified with a blower-door test; balance sealing with proper fresh-air ventilation.',
    byClimate: {
      tropical: { what: 'Big openable doors for cross-flow, with insect screens.', here: 'You want air moving through — make doors part of the ventilation path.' },
      arid: { what: 'Well-sealed doors with an airlock / buffer where you can.', here: 'Seal against dust and heat by day; open up to the cool at night.' },
      temperate: { what: 'Draught-seal all doors; place the entry as a buffer on the cool side.', here: 'Stops winter draughts cheaply and keeps the heated air inside.' },
      cold: { what: 'Heavily weather-sealed doors, ideally with an entry airlock.', here: 'Draughts are a major heat loss in winter — seal obsessively.' },
    },
  },
  slab: {
    id: 'slab',
    label: 'Floor & slab',
    emoji: '🟫',
    tagline: 'A free thermal battery',
    why: "A floor slab in the sun's path is a free thermal battery — it soaks up warmth by day and releases it when the air cools.",
    human: 'Slab edge insulation, structure and moisture detailing need engineering — mass only pays off if detailed right.',
    byClimate: {
      tropical: { what: 'Lightweight, raised floor — skip the heavy slab.', here: 'Warm nights give mass nothing to discharge into; it just traps heat. Stay light and raised.' },
      arid: { what: 'Exposed concrete slab as thermal mass, edge-insulated and shaded in summer.', here: 'The big day–night swing makes the slab a powerful heat store.' },
      temperate: { what: 'Polished concrete slab in the north-lit living zone — keep it exposed, insulate the edge.', here: "Banks winter sun by day. Don't carpet over your thermal store — the classic own-goal." },
      cold: { what: 'Insulated slab with mass positioned to catch and hold winter sun.', here: 'Stores solar gain and steadies the indoor temperature through cold nights.' },
    },
  },
  tree: {
    id: 'tree',
    label: 'Landscaping',
    emoji: '🌳',
    tagline: 'The first line of defence',
    why: 'The right planting shades, cools by evapotranspiration, and blocks or channels wind — the building’s first line of climate defence.',
    human: 'Species, mature size and root/structure impacts need a landscape architect — and trees take years to grow in.',
    byClimate: {
      tropical: { what: 'Shade trees around the house; canopy over west/east; keep airflow at ground level.', here: "Maximise shade — but don't block the cooling breeze." },
      arid: { what: 'Hardy shade trees over outdoor areas; water-wise planting.', here: 'Shade and a little evaporative cooling go a long way; avoid thirsty species.' },
      temperate: { what: 'Deciduous trees to the north/west — summer shade, bare branches for winter sun.', here: "Nature's adjustable shading: leaves in summer, sun in winter." },
      cold: { what: 'Evergreen windbreak on the cold/windy side; keep the north clear for sun.', here: 'Block the cold wind without shading your winter solar gain.' },
    },
  },
}

// Order used for any part listings / cycling.
export const partOrder = ['sun', 'roof', 'walls', 'windows', 'eaves', 'door', 'slab', 'tree']

// A ready-made demo project for the "Load demo" button.
export const demoProject = {
  name: '3-bed house · Melbourne',
  climate: 'temperate',
  part: 'windows',
}
