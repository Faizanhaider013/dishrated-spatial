// ============================================================================
// DISHRATED — content model ("Aftertaste")
// Images referenced by Unsplash photo id — swap for the brand's own library.
// Fields mirror the real product: taste / health / cost scores plus the
// best-bite, next-time and occasion notes.
// ============================================================================

export const img = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const BRAND = {
  name: "Dishrated",
  tagline: "Keep the good ones.",
  appUrl: "https://dishrated.xyz/",
};

export const NAV = [
  { label: "The Vault", href: "#archive" },
  { label: "Taste", href: "#taste" },
  { label: "The Ritual", href: "#ritual" },
  { label: "The App", href: "#product" },
];

export const MEALS = [
  {
    id: "m01", name: "Spicy Miso Ramen", place: "Menya Nº 8", city: "Kyoto", date: "14.10",
    taste: 96, health: 61, cost: 72, again: true, photo: "1623341214825-9f4f963727da", tint: "#a84a1e",
    best: "The slow-rendered pork bone broth.",
    next: "Ask for extra chili. Sit at the counter.",
    occasion: "Rainy night, alone, perfect.",
  },
  {
    id: "m02", name: "Burnt Basque Cheesecake", place: "La Viña", city: "San Sebastián", date: "22.08",
    taste: 94, health: 28, cost: 55, again: true, photo: "1533134242443-d4fd215305ad", tint: "#b07b3e",
    best: "Citrus zest in the molten center.",
    next: "A few flakes of sea salt on top.",
    occasion: "The end of a long, good day.",
  },
  {
    id: "m03", name: "Cacio e Pepe", place: "da Cesare", city: "Rome", date: "04.11",
    taste: 95, health: 44, cost: 48, again: true, photo: "1612874742237-6526221588e3", tint: "#b8912e",
    best: "Pepper blooming in the starch water.",
    next: "Book the table by the kitchen.",
    occasion: "First night back in the city.",
  },
  {
    id: "m04", name: "Beef Tartare", place: "Paul Bert", city: "Paris", date: "18.01",
    taste: 92, health: 58, cost: 63, again: true, photo: "1432139555190-58524dae6a55", tint: "#8a2f28",
    best: "Confit yolk, charred shallot, capers.",
    next: "The '20 Morgon again, chilled.",
    occasion: "A friend's birthday, no plans.",
  },
  {
    id: "m05", name: "Wood-Fired Turbot", place: "Elkano", city: "Getaria", date: "02.03",
    taste: 98, health: 74, cost: 88, again: true, photo: "1467003909585-2f8a72700288", tint: "#486a4a",
    best: "Collagen, txakoli, charcoal smoke.",
    next: "Worth the trip. Save up first.",
    occasion: "The best plate of fish, ever.",
  },
  {
    id: "m06", name: "Hand-Pulled Lanzhou", place: "Mazi Lamian", city: "Xi'an", date: "27.05",
    taste: 93, health: 52, cost: 31, again: true, photo: "1569718212165-3a8278d5f624", tint: "#a8451a",
    best: "The noodle. The noodle is everything.",
    next: "Second-gauge, extra chili oil.",
    occasion: "Lunch that turned into an afternoon.",
  },
];

export const TASTE_BANDS = [
  { min: 0, label: "Forgettable", caption: "Fuel, not a memory. That's allowed — not everything earns a note." },
  { min: 50, label: "Pleasant", caption: "Good in the moment. Worth a line, maybe not a second trip." },
  { min: 75, label: "Memorable", caption: "This one stays. The plate you describe to a friend unprompted." },
  { min: 90, label: "Unforgettable", caption: "A second life. You'll be back — and you'll order this again." },
];

export const NOTES = [
  { text: "The broth was incredible.", meta: "Ramen · Kyoto" },
  { text: "Ask for extra chili next time.", meta: "Larb · Chiang Mai" },
  { text: "Loved the citrus. Needed more crunch.", meta: "Ceviche · Lima" },
  { text: "Definitely ordering this again.", meta: "Tagliolini · Bologna" },
  { text: "Split it next time — huge portion.", meta: "Khachapuri · Tbilisi" },
  { text: "The bread alone is worth the walk.", meta: "Bakery · Lisbon" },
];

// ── a year of eating, counted (animated on scroll) ─────────────────────────
export const STATS = [
  { v: 128, suffix: "", label: "Meals kept", sub: "Across fourteen cities" },
  { v: 2400, suffix: "+", label: "Notes written", sub: "Best bites, fixes, occasions" },
  { v: 42, suffix: "", label: "Worth ordering again", sub: "Flagged for a second life" },
  { v: 1, suffix: "", label: "Taste scale", sub: "Yours. 0 to 100." },
];

// ── the ritual, as a timestamped storyboard ────────────────────────────────
export const STEPS = [
  { n: "01", time: "0:00", title: "Catch the moment", body: "Snap the dish while it's in front of you and give it a name. The memory starts with one photo.", shot: "1623341214825-9f4f963727da", tint: "#a84a1e" },
  { n: "02", time: "0:12", title: "Keep your opinion", body: "Score the taste 0–100, note health and cost, and write the best bite before it fades.", shot: "1612874742237-6526221588e3", tint: "#b8912e" },
  { n: "03", time: "0:30", title: "Mark the details", body: "The fix for next time. The occasion. The reason you'd come back. In your own words.", shot: "1533134242443-d4fd215305ad", tint: "#b07b3e" },
  { n: "04", time: "later", title: "Come back hungry", body: "Revisit your vault by taste, place, or moment — and remember exactly what to order again.", shot: "1467003909585-2f8a72700288", tint: "#486a4a" },
];

export const PRODUCT_POINTS = [
  { k: "Taste 0–100", v: "Your own scale. Not a crowd average." },
  { k: "Health & cost", v: "Two quick scores for context." },
  { k: "Best bite · next time", v: "The notes that bring it all back." },
  { k: "A private vault", v: "Searchable, yours. No feed, no followers." },
];

export const FOOTER = {
  product: [
    { label: "Open the App", href: "https://dishrated.xyz/" },
    { label: "The Vault", href: "#archive" },
    { label: "Taste Score", href: "#taste" },
    { label: "The Ritual", href: "#ritual" },
  ],
  more: [
    { label: "About", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Support", href: "#" },
    { label: "iPhone beta", href: "#" },
  ],
};
