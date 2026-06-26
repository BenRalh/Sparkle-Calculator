// Sol Mate — passive design knowledge, encoded for the interface.
// Mirrors the Sol Mate Claude Skill. Location-driven: pick a city, and the
// climate (advice) + latitude/hemisphere (sun + facing direction) follow.
//
// Direction tokens in the advice strings:
//   {eq} = the equator-facing direction (NORTH in the southern hemisphere,
//          SOUTH in the northern). Replaced at render time via applyDir().
//   (West is always the harsh afternoon side, so it's written literally.)

export const climates = {
  tropical: {
    id: 'tropical', name: 'Tropical',
    blurb: 'Hot & humid all year, small day–night swing.',
    priorities: ['Shade everything', 'Cross-ventilate', 'Stay lightweight'],
    accent: '#13b3a3', sky: ['#9fe9df', '#eafbf7'],
  },
  arid: {
    id: 'arid', name: 'Arid (desert)',
    blurb: 'Hot days, cold nights, intense dry sun.',
    priorities: ['Thermal mass', 'Deep shade', 'Night-flush air'],
    accent: '#e08a3c', sky: ['#ffd29a', '#fff0d8'],
  },
  mediterranean: {
    id: 'mediterranean', name: 'Mediterranean',
    blurb: 'Hot dry summers, mild wet winters.',
    priorities: ['Summer shade & mass', 'Cross-ventilate', 'Mild-winter sun'],
    accent: '#cf9b4a', sky: ['#cfe6ff', '#fff2cf'],
  },
  temperate: {
    id: 'temperate', name: 'Temperate',
    blurb: 'Real winters and warm summers — needs both.',
    priorities: ['Solar orientation', 'Seasonal shading', 'Insulate + ventilate'],
    accent: '#4a90d9', sky: ['#c4e6ff', '#eef7ff'],
  },
  cold: {
    id: 'cold', name: 'Cold / Continental',
    blurb: 'Long cold seasons — keep the heat in.',
    priorities: ['Insulate & seal', 'Maximise solar gain', 'Mass in the sun'],
    accent: '#6f88a8', sky: ['#d2deec', '#eef3f9'],
  },
}

export const climateOrder = ['tropical', 'arid', 'mediterranean', 'temperate', 'cold']

// Customisable ground covers (clicking the ground lets you switch these).
export const groundCovers = {
  lawn: { id: 'lawn', label: '🌿 Lawn', color: '#bfe39a' },
  paving: { id: 'paving', label: '⬜ Paving', color: '#d8d3cb' },
  deck: { id: 'deck', label: '🪵 Timber deck', color: '#e3c79a' },
}
export const groundCoverOrder = ['lawn', 'paving', 'deck']

export const parts = {
  sun: {
    id: 'sun', label: 'Orientation', emoji: '🧭', tagline: 'Which way it faces',
    why: 'Orientation is free at concept stage and impossible to fix later — aiming the building at the sun is the highest-leverage passive move.',
    human: 'True north ≠ magnetic north, and site overshadowing matters — verify on the real site, not just the plan.',
    byClimate: {
      tropical: { what: 'Long axis east–west; open living to the breeze; minimise east/west sun.', here: 'Less about chasing sun, more about dodging it and catching wind.' },
      arid: { what: 'Compact form; main openings {eq} and shaded; protect the west.', here: 'Capture mild winter sun, block the brutal summer west sun.' },
      mediterranean: { what: 'Compact form; main glass {eq} and shaded; protect the west.', here: 'Mild-winter sun in, hot dry summer sun out.' },
      temperate: { what: 'Put living spaces on the {eq} side; service/buffer rooms opposite.', here: 'The {eq} side gets generous, easily-shaded winter sun — aim the home at it.' },
      cold: { what: 'Compact, {eq}-facing form to grab every bit of winter sun.', here: 'Maximise solar exposure; minimise the cold, sunless far side.' },
    },
  },
  roof: {
    id: 'roof', label: 'Roof & insulation', emoji: '🏠', tagline: 'Biggest thermal lever',
    why: 'The roof takes the most sun and loses the most heat — the biggest single lever in the envelope.',
    human: 'Exact roof R-value is set by your local code + climate zone — confirm against current code and a thermal model.',
    byClimate: {
      tropical: { what: 'Light, reflective roof over a ventilated, insulated roof space.', here: 'It bakes all year — reflect it, ventilate under it, insulate against radiant heat.' },
      arid: { what: 'Heavy insulation with a light/reflective finish.', here: "Keeps the day's heat out and holds the night's warmth in." },
      mediterranean: { what: 'Insulate well; light/reflective finish.', here: 'Blocks hot dry summers; retains some mild-winter warmth.' },
      temperate: { what: 'Insulate the ceiling/roof FIRST — before walls or floor.', here: 'Most winter heat escapes here, so make it your first insulation spend.' },
      cold: { what: 'Max out roof insulation; seal every ceiling-level air leak.', here: 'Heat rises and escapes here — the biggest cold-climate saving.' },
    },
  },
  walls: {
    id: 'walls', label: 'Walls', emoji: '🧱', tagline: 'Envelope + mass',
    why: 'Walls are the largest surface of the envelope — they set how fast heat moves, and can double as thermal mass.',
    human: 'Wall build-up interacts with structure, fire and waterproofing — get the assembly engineer-checked.',
    byClimate: {
      tropical: { what: "Lightweight, insulated, light-coloured walls that don't store heat.", here: 'Heavy masonry radiates into warm nights — avoid it.' },
      arid: { what: 'Heavy mass walls (masonry / rammed earth), insulated on the outside.', here: 'The big day–night swing lets mass bank heat and release it after dark.' },
      mediterranean: { what: 'Insulated walls with some thermal mass.', here: 'Mass rides out hot days; insulation handles the cool wet winter.' },
      temperate: { what: 'Well-insulated walls; some internal mass on the sunny rooms.', here: 'Insulate for winter; a little mass steadies the daily swing.' },
      cold: { what: 'Thick, continuous insulation and an airtight build-up.', here: 'Every gap is a heat leak in winter — insulate heavily and seal.' },
    },
  },
  windows: {
    id: 'windows', label: 'Windows & glazing', emoji: '🪟', tagline: "The envelope's weak point",
    why: 'Glass is the weakest thermal point in a wall — where you gain and lose the most heat. Orientation decides if that helps or hurts.',
    human: 'Glazing spec (double/low-E, U-value, SHGC) should be sized with a thermal model for your actual window areas.',
    byClimate: {
      tropical: { what: 'Modest, well-shaded openings to catch the breeze; keep west/east glass tiny.', here: 'Glass = heat gain here. Shade it; use it for airflow, not solar gain.' },
      arid: { what: 'Small, deeply-shaded windows, protected from the harsh sun.', here: 'Big glass is a liability in desert sun.' },
      mediterranean: { what: 'Moderate {eq} glass, well shaded; minimal west; low-E.', here: 'Shade hard in summer; let a little winter sun in.' },
      temperate: { what: 'Generous {eq} glass (winter sun), modest elsewhere, minimal west; double-glaze.', here: 'Classic passive-solar: {eq} glass for free winter warmth, shaded in summer.' },
      cold: { what: 'Generous high-performance (double/triple, low-E) {eq} glazing for solar gain.', here: "Let winter sun in — spec the glass so it doesn't bleed heat at night." },
    },
  },
  eaves: {
    id: 'eaves', label: 'Eaves & shading', emoji: '⛱️', tagline: 'Summer out, winter in',
    why: 'Summer sun is high and winter sun is low — a correctly-sized overhang blocks one and admits the other, automatically.',
    human: 'Exact eave depth depends on your latitude and window heights — confirm with a sun-path / shadow study.',
    byClimate: {
      tropical: { what: 'Deep eaves and verandahs shading every face, all year.', here: 'The sun is high and harsh year-round — wrap the house in shade.' },
      arid: { what: 'Deep shading on all openings; add courtyards and screens.', here: 'Over-shade rather than under-shade.' },
      mediterranean: { what: 'Generous {eq} shading + adjustable east/west devices.', here: 'Long hot summers — prioritise shade, keep some winter sun.' },
      temperate: { what: 'Size the {eq} eave for summer-out / winter-in; fins for east/west.', here: 'This one detail cuts both summer overheating and winter heating.' },
      cold: { what: 'Moderate {eq} eave — enough for the short summer, not blocking winter sun.', here: 'Prioritise letting the precious winter sun reach in.' },
    },
  },
  door: {
    id: 'door', label: 'Entry & sealing', emoji: '🚪', tagline: 'Cheap airtightness',
    why: 'Gaps around doors leak conditioned air — sealing is cheap and one of the highest-return moves there is.',
    human: 'Airtightness is best verified with a blower-door test; balance sealing with proper fresh-air ventilation.',
    byClimate: {
      tropical: { what: 'Big openable doors for cross-flow, with insect screens.', here: 'Make doors part of the ventilation path.' },
      arid: { what: 'Well-sealed doors with an airlock / buffer where you can.', here: 'Seal against dust and heat by day; open up to the cool at night.' },
      mediterranean: { what: 'Seal well; add a shaded porch / entry.', here: 'Comfort across hot summers and the mild wet winter.' },
      temperate: { what: 'Draught-seal all doors; place the entry as a buffer on the cool side.', here: 'Stops winter draughts cheaply.' },
      cold: { what: 'Heavily weather-sealed doors, ideally with an entry airlock.', here: 'Draughts are a major heat loss in winter — seal obsessively.' },
    },
  },
  floor: {
    id: 'floor', label: 'Floor & slab', emoji: '🟫', tagline: 'A thermal battery',
    why: "A floor slab in the sun's path is a free thermal battery — it soaks up warmth by day and releases it as the air cools.",
    human: 'Slab edge insulation, structure and moisture detailing need engineering — mass only pays off if detailed right.',
    byClimate: {
      tropical: { what: 'Lightweight, raised floor — skip the heavy slab.', here: 'Warm nights give mass nothing to discharge into; stay light and raised.' },
      arid: { what: 'Exposed concrete slab as mass, edge-insulated and shaded in summer.', here: 'The big day–night swing makes it a powerful heat store.' },
      mediterranean: { what: 'Exposed mass floor in the sun, edge-insulated, summer-shaded.', here: 'Steadies hot days; soaks up mild winter sun.' },
      temperate: { what: 'Polished slab in the {eq}-lit living zone — keep it exposed, edge-insulated.', here: "Banks winter sun; don't carpet over your thermal store." },
      cold: { what: 'Insulated slab with mass positioned to catch winter sun.', here: 'Stores solar gain and steadies cold nights.' },
    },
  },
  ground: {
    id: 'ground', label: 'Ground & site', emoji: '🌱', tagline: 'Cool the surroundings',
    why: 'The ground around a building reflects heat and rain — hard, dark surfaces bake; soft, planted ones cool. (Tap the swatches to change the cover.)',
    human: 'Drainage, soil and site levels are a civil / landscape job — local site conditions trump any rule of thumb.',
    byClimate: {
      tropical: { what: 'Shaded, permeable ground; keep airflow at ground level.', here: 'Avoid heat-storing paving; let the site drain and breathe.' },
      arid: { what: 'Light-coloured, shaded courtyards; minimal lawn.', here: 'Cut glare and reflected heat; water is scarce.' },
      mediterranean: { what: 'Permeable, light ground; shade the paving; water-wise planting.', here: 'Avoid hot reflective hardscape next to glass.' },
      temperate: { what: 'Mix of lawn and paving; keep dark hardscape away from {eq} glass.', here: "Don't bounce summer heat into the sunny rooms." },
      cold: { what: 'Hard, well-drained ground; let low winter sun reach the walls.', here: "Keep paths clear; don't over-shade the winter sun." },
    },
  },
  tree: {
    id: 'tree', label: 'Landscaping', emoji: '🌳', tagline: 'First line of defence',
    why: 'The right planting shades, cools by evapotranspiration, and blocks or channels wind — the site’s first line of climate defence.',
    human: 'Species, mature size and root impacts need a landscape architect — and trees take years to grow in.',
    byClimate: {
      tropical: { what: 'Shade trees around the house; canopy over west/east; keep ground airflow.', here: "Maximise shade without blocking the breeze." },
      arid: { what: 'Hardy shade trees over outdoor areas; water-wise planting.', here: 'Shade and a little evaporative cooling; avoid thirsty species.' },
      mediterranean: { what: 'Deciduous shade to {eq}/west; drought-hardy species.', here: 'Summer shade with winter sun, on little water.' },
      temperate: { what: 'Deciduous trees to the {eq}/west — summer shade, winter sun.', here: "Nature's adjustable shading." },
      cold: { what: 'Evergreen windbreak on the cold side; keep the {eq} clear for sun.', here: 'Block the cold wind without shading your winter sun.' },
    },
  },
  zoning: {
    id: 'zoning', label: 'Layout & zoning', emoji: '🛋️', tagline: 'Condition only what’s used',
    why: 'Grouping rooms by how they’re used lets you condition only what’s in use — free energy savings from layout alone.',
    human: 'Room layout serves the whole brief (privacy, flow, views) — passive zoning is one input among many.',
    byClimate: {
      tropical: { what: 'Open plan for cross-flow; separate sleeping for night cooling.', here: 'Keep air moving through the living zones.' },
      arid: { what: 'Compact core; courtyards; buffer the west.', here: 'Shield living spaces from the harsh west.' },
      mediterranean: { what: 'Open to breezes in summer; a warm, zoned winter core.', here: 'Flexible for the big seasonal swing.' },
      temperate: { what: 'Separate day (living) and night (bed) zones; buffer the cold side.', here: 'Heat only what’s in use; stores/garage on the cold or west side.' },
      cold: { what: 'Compact, zoned plan with an airlock entry and a small heated core.', here: 'Minimise the volume you actively heat.' },
    },
  },
}

export const partOrder = ['sun', 'roof', 'walls', 'windows', 'eaves', 'door', 'floor', 'ground', 'tree', 'zoning']

// Curated worldwide list — pick any and the climate + latitude follow.
// lat is signed (− = southern hemisphere). climate keys into `climates`.
export const cities = [
  // Tropical
  { name: 'Singapore', country: 'Singapore', lat: 1.3, climate: 'tropical' },
  { name: 'Darwin', country: 'Australia', lat: -12.5, climate: 'tropical' },
  { name: 'Bangkok', country: 'Thailand', lat: 13.8, climate: 'tropical' },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2, climate: 'tropical' },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1, climate: 'tropical' },
  { name: 'Mumbai', country: 'India', lat: 19.1, climate: 'tropical' },
  { name: 'Lagos', country: 'Nigeria', lat: 6.5, climate: 'tropical' },
  { name: 'Miami', country: 'USA', lat: 25.8, climate: 'tropical' },
  { name: 'Honolulu', country: 'USA', lat: 21.3, climate: 'tropical' },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9, climate: 'tropical' },
  { name: 'Cairns', country: 'Australia', lat: -16.9, climate: 'tropical' },
  // Arid
  { name: 'Alice Springs', country: 'Australia', lat: -23.7, climate: 'arid' },
  { name: 'Dubai', country: 'UAE', lat: 25.2, climate: 'arid' },
  { name: 'Phoenix', country: 'USA', lat: 33.4, climate: 'arid' },
  { name: 'Cairo', country: 'Egypt', lat: 30.0, climate: 'arid' },
  { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7, climate: 'arid' },
  { name: 'Las Vegas', country: 'USA', lat: 36.2, climate: 'arid' },
  { name: 'Marrakesh', country: 'Morocco', lat: 31.6, climate: 'arid' },
  { name: 'Karachi', country: 'Pakistan', lat: 24.9, climate: 'arid' },
  // Mediterranean
  { name: 'Barcelona', country: 'Spain', lat: 41.4, climate: 'mediterranean' },
  { name: 'Rome', country: 'Italy', lat: 41.9, climate: 'mediterranean' },
  { name: 'Athens', country: 'Greece', lat: 38.0, climate: 'mediterranean' },
  { name: 'Los Angeles', country: 'USA', lat: 34.1, climate: 'mediterranean' },
  { name: 'Lisbon', country: 'Portugal', lat: 38.7, climate: 'mediterranean' },
  { name: 'Cape Town', country: 'South Africa', lat: -33.9, climate: 'mediterranean' },
  { name: 'Perth', country: 'Australia', lat: -31.9, climate: 'mediterranean' },
  { name: 'Adelaide', country: 'Australia', lat: -34.9, climate: 'mediterranean' },
  { name: 'Santiago', country: 'Chile', lat: -33.4, climate: 'mediterranean' },
  { name: 'San Francisco', country: 'USA', lat: 37.8, climate: 'mediterranean' },
  // Temperate
  { name: 'London', country: 'UK', lat: 51.5, climate: 'temperate' },
  { name: 'Melbourne', country: 'Australia', lat: -37.8, climate: 'temperate' },
  { name: 'Sydney', country: 'Australia', lat: -33.9, climate: 'temperate' },
  { name: 'Auckland', country: 'New Zealand', lat: -36.8, climate: 'temperate' },
  { name: 'Paris', country: 'France', lat: 48.9, climate: 'temperate' },
  { name: 'Vancouver', country: 'Canada', lat: 49.3, climate: 'temperate' },
  { name: 'Seattle', country: 'USA', lat: 47.6, climate: 'temperate' },
  { name: 'Dublin', country: 'Ireland', lat: 53.3, climate: 'temperate' },
  { name: 'Wellington', country: 'New Zealand', lat: -41.3, climate: 'temperate' },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.4, climate: 'temperate' },
  { name: 'Brisbane', country: 'Australia', lat: -27.5, climate: 'temperate' },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6, climate: 'temperate' },
  // Cold / Continental
  { name: 'Toronto', country: 'Canada', lat: 43.7, climate: 'cold' },
  { name: 'Montreal', country: 'Canada', lat: 45.5, climate: 'cold' },
  { name: 'Moscow', country: 'Russia', lat: 55.8, climate: 'cold' },
  { name: 'Oslo', country: 'Norway', lat: 59.9, climate: 'cold' },
  { name: 'Stockholm', country: 'Sweden', lat: 59.3, climate: 'cold' },
  { name: 'Calgary', country: 'Canada', lat: 51.0, climate: 'cold' },
  { name: 'Reykjavik', country: 'Iceland', lat: 64.1, climate: 'cold' },
  { name: 'Chicago', country: 'USA', lat: 41.9, climate: 'cold' },
  { name: 'Beijing', country: 'China', lat: 39.9, climate: 'cold' },
  { name: 'Hobart', country: 'Australia', lat: -42.9, climate: 'cold' },
  { name: 'Denver', country: 'USA', lat: 39.7, climate: 'cold' },
  { name: 'Sapporo', country: 'Japan', lat: 43.1, climate: 'cold' },
  // More major cities
  { name: 'Tokyo', country: 'Japan', lat: 35.7, climate: 'temperate' },
  { name: 'New York', country: 'USA', lat: 40.7, climate: 'cold' },
  { name: 'Berlin', country: 'Germany', lat: 52.5, climate: 'cold' },
  { name: 'Vienna', country: 'Austria', lat: 48.2, climate: 'cold' },
  { name: 'Madrid', country: 'Spain', lat: 40.4, climate: 'mediterranean' },
  { name: 'Istanbul', country: 'Türkiye', lat: 41.0, climate: 'mediterranean' },
  { name: 'Delhi', country: 'India', lat: 28.6, climate: 'arid' },
  { name: 'Shanghai', country: 'China', lat: 31.2, climate: 'temperate' },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4, climate: 'temperate' },
  { name: 'Nairobi', country: 'Kenya', lat: -1.3, climate: 'tropical' },
]

export const hemisphereOf = (lat) => (lat < 0 ? 'S' : 'N')
export const equatorDir = (hemisphere) => (hemisphere === 'S' ? 'north' : 'south')

// Replace {eq} with the actual equator-facing compass word for this hemisphere.
export const applyDir = (text, hemisphere) =>
  (text || '').split('{eq}').join(equatorDir(hemisphere))

export const findCity = (name) => cities.find((c) => c.name === name)

export const demoProject = { cityName: 'Melbourne', part: 'windows' }
