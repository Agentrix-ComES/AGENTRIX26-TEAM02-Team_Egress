// Sri Lanka travel graph — Place nodes and ROUTE relationships
// Run once on a fresh Neo4j instance.
// Idempotent: MERGE prevents duplicates on re-runs.

// ── Constraints ──────────────────────────────────────────────────────────────
CREATE CONSTRAINT place_name_unique IF NOT EXISTS
  FOR (p:Place) REQUIRE p.name IS UNIQUE;

// ── Place nodes ───────────────────────────────────────────────────────────────
MERGE (colombo:Place    {name: "Colombo",       region: "Western",    type: "city",       lat: 6.9271,  lon: 79.8612})
MERGE (negombo:Place    {name: "Negombo",       region: "Western",    type: "coastal",    lat: 7.2095,  lon: 79.8353})
MERGE (bentota:Place    {name: "Bentota",       region: "Western",    type: "coastal",    lat: 6.4268,  lon: 80.0023})
MERGE (hikkaduwa:Place  {name: "Hikkaduwa",     region: "Southern",   type: "coastal",    lat: 6.1395,  lon: 80.1003})
MERGE (galle:Place      {name: "Galle",         region: "Southern",   type: "heritage",   lat: 6.0535,  lon: 80.2210})
MERGE (unawatuna:Place  {name: "Unawatuna",     region: "Southern",   type: "coastal",    lat: 6.0139,  lon: 80.2490})
MERGE (mirissa:Place    {name: "Mirissa",       region: "Southern",   type: "coastal",    lat: 5.9483,  lon: 80.4716})
MERGE (tangalle:Place   {name: "Tangalle",      region: "Southern",   type: "coastal",    lat: 6.0232,  lon: 80.7967})
MERGE (tissa:Place      {name: "Tissamaharama", region: "Southern",   type: "wildlife",   lat: 6.2864,  lon: 81.2914})
MERGE (yala:Place       {name: "Yala",          region: "Southern",   type: "national_park", lat: 6.3723, lon: 81.5194})
MERGE (kandy:Place      {name: "Kandy",         region: "Central",    type: "heritage",   lat: 7.2906,  lon: 80.6337})
MERGE (nuwara:Place     {name: "Nuwara Eliya",  region: "Central",    type: "hill",       lat: 6.9497,  lon: 80.7891})
MERGE (ella:Place       {name: "Ella",          region: "Uva",        type: "hill",       lat: 6.8667,  lon: 81.0466})
MERGE (haputale:Place   {name: "Haputale",      region: "Uva",        type: "hill",       lat: 6.7675,  lon: 80.9575})
MERGE (badulla:Place    {name: "Badulla",        region: "Uva",       type: "city",       lat: 6.9934,  lon: 81.0550})
MERGE (dambulla:Place   {name: "Dambulla",      region: "Central",    type: "heritage",   lat: 7.8742,  lon: 80.6514})
MERGE (sigiriya:Place   {name: "Sigiriya",      region: "Central",    type: "heritage",   lat: 7.9570,  lon: 80.7603})
MERGE (anura:Place      {name: "Anuradhapura",  region: "North Central", type: "heritage", lat: 8.3114, lon: 80.4037})
MERGE (polonnaruwa:Place{name: "Polonnaruwa",   region: "North Central", type: "heritage", lat: 7.9403, lon: 81.0188})
MERGE (trinco:Place     {name: "Trincomalee",   region: "Eastern",    type: "coastal",    lat: 8.5874,  lon: 81.2152})
MERGE (arugam:Place     {name: "Arugam Bay",    region: "Eastern",    type: "coastal",    lat: 6.8397,  lon: 81.8364})
MERGE (nilaveli:Place   {name: "Nilaveli",      region: "Eastern",    type: "coastal",    lat: 8.7143,  lon: 81.2043})
MERGE (jaffna:Place     {name: "Jaffna",        region: "Northern",   type: "heritage",   lat: 9.6615,  lon: 80.0255})

// ── Routes (bidirectional) ────────────────────────────────────────────────────
// Colombo hub
MERGE (colombo)-[:ROUTE {mode: "train",  duration_min: 150, distance_km: 115}]->(kandy)
MERGE (kandy)-[:ROUTE   {mode: "train",  duration_min: 155, distance_km: 115}]->(colombo)

MERGE (colombo)-[:ROUTE {mode: "bus",    duration_min: 60,  distance_km: 35}]->(negombo)
MERGE (negombo)-[:ROUTE {mode: "bus",    duration_min: 60,  distance_km: 35}]->(colombo)

MERGE (colombo)-[:ROUTE {mode: "train",  duration_min: 90,  distance_km: 65}]->(bentota)
MERGE (bentota)-[:ROUTE {mode: "train",  duration_min: 90,  distance_km: 65}]->(colombo)

MERGE (colombo)-[:ROUTE {mode: "train",  duration_min: 150, distance_km: 116}]->(galle)
MERGE (galle)-[:ROUTE   {mode: "train",  duration_min: 150, distance_km: 116}]->(colombo)

MERGE (colombo)-[:ROUTE {mode: "bus",    duration_min: 240, distance_km: 200}]->(anura)
MERGE (anura)-[:ROUTE   {mode: "bus",    duration_min: 240, distance_km: 200}]->(colombo)

// Southern coast chain
MERGE (bentota)-[:ROUTE  {mode: "train",  duration_min: 60,  distance_km: 50}]->(hikkaduwa)
MERGE (hikkaduwa)-[:ROUTE{mode: "train",  duration_min: 60,  distance_km: 50}]->(bentota)

MERGE (hikkaduwa)-[:ROUTE{mode: "bus",    duration_min: 30,  distance_km: 20}]->(galle)
MERGE (galle)-[:ROUTE    {mode: "bus",    duration_min: 30,  distance_km: 20}]->(hikkaduwa)

MERGE (galle)-[:ROUTE    {mode: "tuk-tuk",duration_min: 20, distance_km: 8}]->(unawatuna)
MERGE (unawatuna)-[:ROUTE{mode: "tuk-tuk",duration_min: 20, distance_km: 8}]->(galle)

MERGE (galle)-[:ROUTE    {mode: "bus",    duration_min: 60,  distance_km: 40}]->(mirissa)
MERGE (mirissa)-[:ROUTE  {mode: "bus",    duration_min: 60,  distance_km: 40}]->(galle)

MERGE (unawatuna)-[:ROUTE{mode: "bus",    duration_min: 50,  distance_km: 32}]->(mirissa)
MERGE (mirissa)-[:ROUTE  {mode: "bus",    duration_min: 50,  distance_km: 32}]->(unawatuna)

MERGE (mirissa)-[:ROUTE  {mode: "bus",    duration_min: 60,  distance_km: 40}]->(tangalle)
MERGE (tangalle)-[:ROUTE {mode: "bus",    duration_min: 60,  distance_km: 40}]->(mirissa)

MERGE (tangalle)-[:ROUTE {mode: "bus",    duration_min: 90,  distance_km: 70}]->(tissa)
MERGE (tissa)-[:ROUTE    {mode: "bus",    duration_min: 90,  distance_km: 70}]->(tangalle)

MERGE (tissa)-[:ROUTE    {mode: "taxi",   duration_min: 30,  distance_km: 20}]->(yala)
MERGE (yala)-[:ROUTE     {mode: "taxi",   duration_min: 30,  distance_km: 20}]->(tissa)

// Hill country loop
MERGE (kandy)-[:ROUTE    {mode: "bus",    duration_min: 120, distance_km: 75}]->(nuwara)
MERGE (nuwara)-[:ROUTE   {mode: "bus",    duration_min: 120, distance_km: 75}]->(kandy)

MERGE (nuwara)-[:ROUTE   {mode: "train",  duration_min: 150, distance_km: 60}]->(ella)
MERGE (ella)-[:ROUTE     {mode: "train",  duration_min: 155, distance_km: 60}]->(nuwara)

MERGE (kandy)-[:ROUTE    {mode: "train",  duration_min: 360, distance_km: 140}]->(ella)
MERGE (ella)-[:ROUTE     {mode: "train",  duration_min: 360, distance_km: 140}]->(kandy)

MERGE (ella)-[:ROUTE     {mode: "train",  duration_min: 60,  distance_km: 30}]->(haputale)
MERGE (haputale)-[:ROUTE {mode: "train",  duration_min: 60,  distance_km: 30}]->(ella)

MERGE (ella)-[:ROUTE     {mode: "bus",    duration_min: 90,  distance_km: 55}]->(badulla)
MERGE (badulla)-[:ROUTE  {mode: "bus",    duration_min: 90,  distance_km: 55}]->(ella)

// Ella to south coast
MERGE (ella)-[:ROUTE     {mode: "bus",    duration_min: 180, distance_km: 100}]->(mirissa)
MERGE (mirissa)-[:ROUTE  {mode: "bus",    duration_min: 180, distance_km: 100}]->(ella)

MERGE (ella)-[:ROUTE     {mode: "bus",    duration_min: 240, distance_km: 150}]->(arugam)
MERGE (arugam)-[:ROUTE   {mode: "bus",    duration_min: 240, distance_km: 150}]->(ella)

// Cultural triangle
MERGE (kandy)-[:ROUTE    {mode: "bus",    duration_min: 90,  distance_km: 72}]->(dambulla)
MERGE (dambulla)-[:ROUTE {mode: "bus",    duration_min: 90,  distance_km: 72}]->(kandy)

MERGE (dambulla)-[:ROUTE {mode: "tuk-tuk",duration_min: 30,  distance_km: 20}]->(sigiriya)
MERGE (sigiriya)-[:ROUTE {mode: "tuk-tuk",duration_min: 30,  distance_km: 20}]->(dambulla)

MERGE (kandy)-[:ROUTE    {mode: "bus",    duration_min: 120, distance_km: 65}]->(sigiriya)
MERGE (sigiriya)-[:ROUTE {mode: "bus",    duration_min: 120, distance_km: 65}]->(kandy)

MERGE (anura)-[:ROUTE    {mode: "bus",    duration_min: 90,  distance_km: 66}]->(sigiriya)
MERGE (sigiriya)-[:ROUTE {mode: "bus",    duration_min: 90,  distance_km: 66}]->(anura)

MERGE (anura)-[:ROUTE    {mode: "bus",    duration_min: 150, distance_km: 100}]->(polonnaruwa)
MERGE (polonnaruwa)-[:ROUTE{mode:"bus",   duration_min: 150, distance_km: 100}]->(anura)

MERGE (kandy)-[:ROUTE    {mode: "bus",    duration_min: 180, distance_km: 120}]->(polonnaruwa)
MERGE (polonnaruwa)-[:ROUTE{mode:"bus",   duration_min: 180, distance_km: 120}]->(kandy)

MERGE (sigiriya)-[:ROUTE {mode: "bus",    duration_min: 90,  distance_km: 70}]->(polonnaruwa)
MERGE (polonnaruwa)-[:ROUTE{mode:"bus",   duration_min: 90,  distance_km: 70}]->(sigiriya)

// Eastern coast
MERGE (trinco)-[:ROUTE   {mode: "bus",    duration_min: 120, distance_km: 100}]->(sigiriya)
MERGE (sigiriya)-[:ROUTE {mode: "bus",    duration_min: 120, distance_km: 100}]->(trinco)

MERGE (trinco)-[:ROUTE   {mode: "bus",    duration_min: 30,  distance_km: 15}]->(nilaveli)
MERGE (nilaveli)-[:ROUTE {mode: "bus",    duration_min: 30,  distance_km: 15}]->(trinco)

MERGE (trinco)-[:ROUTE   {mode: "bus",    duration_min: 180, distance_km: 120}]->(anura)
MERGE (anura)-[:ROUTE    {mode: "bus",    duration_min: 180, distance_km: 120}]->(trinco)

// Northern
MERGE (colombo)-[:ROUTE  {mode: "train",  duration_min: 360, distance_km: 400}]->(jaffna)
MERGE (jaffna)-[:ROUTE   {mode: "train",  duration_min: 360, distance_km: 400}]->(colombo)

MERGE (anura)-[:ROUTE    {mode: "bus",    duration_min: 180, distance_km: 150}]->(jaffna)
MERGE (jaffna)-[:ROUTE   {mode: "bus",    duration_min: 180, distance_km: 150}]->(anura)
