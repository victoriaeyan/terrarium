export type PlaceId =
  | 'library'
  | 'office'
  | 'cafe'
  | 'gym'
  | 'taqueria'
  | 'annex'
  | 'park'
  | 'dining'
  | 'climbing'
  | `home:${string}`;

export type Category = 'work' | 'study' | 'exercise' | 'social' | 'create' | 'rest';

export type CalendarKind = 'meeting' | 'class' | 'busy';

export type Segment = {
  from: number;
  to: number;
  at: PlaceId | 'wander' | 'sleep';
  doing: string;
  category: Category;
  cal?: { title: string; kind: CalendarKind };
};

export type Palette = { hair: string; skin: string; shirt: string; pants: string; accent: string };

export type HouseStyle = 'cottage' | 'treehouse' | 'loft' | 'dome';
export type PetKind = 'cat' | 'dog' | 'frog' | 'none';
export type Accessory = 'none' | 'headphones' | 'cap' | 'glasses' | 'bow';

export type Friend = {
  id: string;
  name: string;
  pronouns: string;
  major: string;
  phone: string;
  palette: Palette;
  accessory: Accessory;
  house: HouseStyle;
  houseColor: string;
  roofColor: string;
  pet: PetKind;
  petName: string;
  car?: string;
  share: { calendar: 'titles' | 'busy'; location: 'exact' | 'approx' };
  badges: string[];
  nowPlaying: { track: string; artist: string; mood: string };
  today: string;
  week: string;
  changes: string[];
  withYou: string;
  weekHours: Record<Category, number>;
  topPlaces: { place: PlaceId; visits: number }[];
  schedule: Segment[];
};

export type Place = {
  id: PlaceId;
  name: string;
  kind: 'building' | 'park' | 'construction';
  x: number;
  y: number;
  w: number;
  h: number;
  spot: { x: number; y: number };
  road: number;
  wall: string;
  roof: string;
  sign: SignIcon;
  why: string;
};

export type SignIcon = 'book' | 'brief' | 'cup' | 'dumbbell' | 'taco' | 'note' | 'tree' | 'fork' | 'rope';

export const COLS = 16;
export const AVENUE_X = 8;
export const ROADS = [6, 11, 16, 21, 26];

export const PLACES: Place[] = [
  { id: 'library', name: 'Green Library', kind: 'building', x: 0.75, y: 2, w: 4.5, h: 4, spot: { x: 3, y: 6.5 }, road: 6.5, wall: '#C9D6F2', roof: '#4C5FA8', sign: 'book', why: 'Alex and you studied here 23 times this month.' },
  { id: 'office', name: 'Lattice HQ', kind: 'building', x: 10.5, y: 2, w: 4.5, h: 4, spot: { x: 12.75, y: 6.5 }, road: 6.5, wall: '#D8DEE3', roof: '#54606B', sign: 'brief', why: "Cain's internship. He's here 5 days a week." },
  { id: 'cafe', name: 'Bean There', kind: 'building', x: 1, y: 8, w: 3.5, h: 3, spot: { x: 2.75, y: 11.5 }, road: 11.5, wall: '#F6C9A6', roof: '#B5563B', sign: 'cup', why: "Maya's second studio. 11 visits from the crew this week." },
  { id: 'gym', name: 'Arrillaga Gym', kind: 'building', x: 10.5, y: 8, w: 4.5, h: 3, spot: { x: 12.75, y: 11.5 }, road: 11.5, wall: '#F2E1B8', roof: '#C9473E', sign: 'dumbbell', why: 'Built when Alex hit 10 lifts in a month.' },
  { id: 'taqueria', name: 'Tacos El Gordo', kind: 'building', x: 9.5, y: 18, w: 3, h: 3, spot: { x: 11, y: 21.5 }, road: 21.5, wall: '#FFE08A', roof: '#2E9E6B', sign: 'taco', why: 'Cain and Theo have a standing Thursday lunch here.' },
  { id: 'annex', name: 'Arts Annex', kind: 'building', x: 12.75, y: 18, w: 3, h: 3, spot: { x: 14.25, y: 21.5 }, road: 21.5, wall: '#E7D2FF', roof: '#7B4FD0', sign: 'note', why: 'Maya paints here, Theo practices here. Lights are on past 2am.' },
  { id: 'park', name: 'The Oval', kind: 'park', x: 0.5, y: 22.25, w: 6.5, h: 3.5, spot: { x: 4.5, y: 24 }, road: 21.5, wall: '', roof: '', sign: 'tree', why: "Priya's running loop. Open-air hangouts show up here." },
  { id: 'dining', name: 'Wilbur Dining', kind: 'building', x: 9.5, y: 23, w: 3, h: 3, spot: { x: 11, y: 26.5 }, road: 26.5, wall: '#FFD4C8', roof: '#E0765E', sign: 'fork', why: 'The crew eats lunch here together most weekdays.' },
  { id: 'climbing', name: 'Climbing Gym', kind: 'construction', x: 12.75, y: 23, w: 3, h: 3, spot: { x: 14.25, y: 26.5 }, road: 26.5, wall: '#D9C3A5', roof: '#8B6B4A', sign: 'rope', why: 'Priya has been to a climbing gym 3 times. 2 more visits and it opens here.' },
];

export const HOUSE_LOTS = [
  { x: 0.75, y: 13 },
  { x: 4, y: 13 },
  { x: 9.5, y: 13 },
  { x: 12.75, y: 13 },
  { x: 0.75, y: 18 },
  { x: 4, y: 18 },
];

export const BASE_ROWS = 28;

export const NEWCOMER_START = 28;

export function newcomerLot(index: number) {
  const row = Math.floor(index / 4);
  const col = index % 4;
  const xs = [0.75, 4, 9.5, 12.75];
  const y = NEWCOMER_START + 1 + row * 5;
  return { x: xs[col], y, road: y + 3.5 };
}

const h = (hh: number, mm = 0) => hh + mm / 60;

export const FRIENDS: Friend[] = [
  {
    id: 'cain',
    name: 'Cain',
    pronouns: 'he/him',
    major: 'Econ, interning at Lattice',
    phone: '+16505550142',
    palette: { hair: '#3B2A1F', skin: '#E9B48A', shirt: '#3D7BF2', pants: '#2F3A56', accent: '#F2F2F2' },
    accessory: 'none',
    house: 'loft',
    houseColor: '#B8C4D6',
    roofColor: '#3E4C63',
    pet: 'dog',
    petName: 'Biscuit',
    car: '#D94B3B',
    share: { calendar: 'busy', location: 'exact' },
    badges: ['locked', 'commuter'],
    nowPlaying: { track: 'Midnight City', artist: 'M83', mood: 'focused' },
    today: 'Cain has been at Lattice since 8:45 with back-to-back meetings until noon. He usually breaks for tacos with Theo, then heads back until about 5:30. He and Alex have a gym slot at 6.',
    week: 'Cain has been spending a lot of time at work this week: 41 hours at Lattice, up from 33 last week. Evenings are mostly home, and he has kept his gym streak alive four days running.',
    changes: ['Started leaving for work 30 min earlier', 'Gym streak: 4 days', 'Skipped Friday trivia for the first time this month'],
    withYou: 'You and Cain haven’t hung out in 9 days. He’s free after 7:30 tonight.',
    weekHours: { work: 41, study: 2, exercise: 6, social: 5, create: 0, rest: 18 },
    topPlaces: [{ place: 'office', visits: 5 }, { place: 'gym', visits: 4 }, { place: 'taqueria', visits: 2 }],
    schedule: [
      { from: 0, to: h(7, 30), at: 'sleep', doing: 'Sleeping', category: 'rest' },
      { from: h(7, 30), to: h(8, 30), at: 'home:cain', doing: 'Making coffee', category: 'rest' },
      { from: h(8, 30), to: h(12), at: 'office', doing: 'Deep in spreadsheets', category: 'work', cal: { title: 'Standup + design review', kind: 'meeting' } },
      { from: h(12), to: h(13), at: 'taqueria', doing: 'Taco lunch with Theo', category: 'social' },
      { from: h(13), to: h(17, 30), at: 'office', doing: 'Shipping a model', category: 'work', cal: { title: '1:1 with manager', kind: 'meeting' } },
      { from: h(17, 30), to: h(18), at: 'home:cain', doing: 'Walking Biscuit', category: 'rest' },
      { from: h(18), to: h(19, 30), at: 'gym', doing: 'Leg day with Alex', category: 'exercise' },
      { from: h(19, 30), to: h(23, 15), at: 'home:cain', doing: 'Watching the Warriors', category: 'rest' },
      { from: h(23, 15), to: 24, at: 'sleep', doing: 'Sleeping', category: 'rest' },
    ],
  },
  {
    id: 'alex',
    name: 'Alex',
    pronouns: 'they/them',
    major: 'CS, junior',
    phone: '+16505550188',
    palette: { hair: '#E8A33D', skin: '#F3C9A4', shirt: '#2FA36B', pants: '#3A3A4A', accent: '#2B1D14' },
    accessory: 'glasses',
    house: 'cottage',
    houseColor: '#F4E1B0',
    roofColor: '#3E8E5E',
    pet: 'cat',
    petName: 'Pixel',
    share: { calendar: 'titles', location: 'exact' },
    badges: ['locked', 'gym', 'bookworm'],
    nowPlaying: { track: 'lofi study session', artist: 'Chillhop', mood: 'locked in' },
    today: 'Alex started the day with a 7am lift, then went straight to the library for CS 161. They’re having lunch with you and Priya at Wilbur, then back to the library through office hours.',
    week: 'Alex has been going to the library almost every afternoon: 6 days out of 7, about 28 hours. Midterm season shows. They still made the gym 5 times, which is how the gym got built.',
    changes: ['Library time up 40% vs. last week', 'New personal best on deadlift', 'Switched from coffee to matcha'],
    withYou: 'You and Alex have studied together 7 times this month.',
    weekHours: { work: 0, study: 28, exercise: 8, social: 6, create: 1, rest: 14 },
    topPlaces: [{ place: 'library', visits: 6 }, { place: 'gym', visits: 5 }, { place: 'dining', visits: 5 }],
    schedule: [
      { from: 0, to: h(7), at: 'sleep', doing: 'Sleeping', category: 'rest' },
      { from: h(7), to: h(8, 15), at: 'gym', doing: 'Morning lift', category: 'exercise' },
      { from: h(8, 15), to: h(12, 30), at: 'library', doing: 'CS 161 problem set', category: 'study', cal: { title: 'CS 161 lecture', kind: 'class' } },
      { from: h(12, 30), to: h(13, 30), at: 'dining', doing: 'Lunch with you + Priya', category: 'social' },
      { from: h(13, 30), to: h(17, 45), at: 'library', doing: 'Locked in', category: 'study', cal: { title: 'CS 161 office hours', kind: 'class' } },
      { from: h(17, 45), to: h(19, 30), at: 'gym', doing: 'Spotting Cain', category: 'exercise' },
      { from: h(19, 30), to: h(20, 30), at: 'dining', doing: 'Late dinner', category: 'social' },
      { from: h(20, 30), to: h(23, 30), at: 'library', doing: 'Night shift studying', category: 'study' },
      { from: h(23, 30), to: 24, at: 'sleep', doing: 'Sleeping', category: 'rest' },
    ],
  },
  {
    id: 'maya',
    name: 'Maya',
    pronouns: 'she/her',
    major: 'Studio Art, senior',
    phone: '+16505550123',
    palette: { hair: '#1E1A2E', skin: '#C98B62', shirt: '#FF6B8A', pants: '#4B3B7A', accent: '#FFC94A' },
    accessory: 'bow',
    house: 'treehouse',
    houseColor: '#F7C4D4',
    roofColor: '#8E4FA8',
    pet: 'frog',
    petName: 'Sir Hops',
    share: { calendar: 'titles', location: 'approx' },
    badges: ['owl', 'social', 'artist'],
    nowPlaying: { track: 'Good Days', artist: 'SZA', mood: 'dreamy' },
    today: 'Maya slept in after painting at the Annex until 3am (classic). She’s at Bean There prepping for crit, has figure drawing at 3, and you two have coffee at 7.',
    week: 'Maya has been a full night owl this week: up past 2am five nights, mostly at the Arts Annex finishing her thesis piece. Her daytime spot is Bean There, where she has been 6 times.',
    changes: ['Night Owl badge earned (5 late nights)', 'Thesis piece 80% done', 'Listening to way more SZA'],
    withYou: 'You and Maya have arranged three hangouts this month!',
    weekHours: { work: 0, study: 6, exercise: 1, social: 12, create: 26, rest: 16 },
    topPlaces: [{ place: 'annex', visits: 7 }, { place: 'cafe', visits: 6 }, { place: 'taqueria', visits: 1 }],
    schedule: [
      { from: 0, to: h(3), at: 'annex', doing: 'Painting at 2am', category: 'create' },
      { from: h(3), to: h(10, 30), at: 'sleep', doing: 'Sleeping in', category: 'rest' },
      { from: h(10, 30), to: h(12), at: 'home:maya', doing: 'Feeding Sir Hops', category: 'rest' },
      { from: h(12), to: h(14, 30), at: 'cafe', doing: 'Crit prep + oat latte', category: 'create', cal: { title: 'Crit prep', kind: 'busy' } },
      { from: h(14, 30), to: h(17), at: 'annex', doing: 'Figure drawing', category: 'create', cal: { title: 'ARTSTUDI 140', kind: 'class' } },
      { from: h(17), to: h(19), at: 'wander', doing: 'Sketching outside', category: 'create' },
      { from: h(19), to: h(21), at: 'cafe', doing: 'Coffee with you', category: 'social', cal: { title: 'Coffee w/ you', kind: 'busy' } },
      { from: h(21), to: 24, at: 'annex', doing: 'Thesis grind', category: 'create' },
    ],
  },
  {
    id: 'priya',
    name: 'Priya',
    pronouns: 'she/her',
    major: 'Human Bio, cross-country',
    phone: '+16505550167',
    palette: { hair: '#5A2E1A', skin: '#B9774E', shirt: '#FF8A3D', pants: '#24565E', accent: '#FFFFFF' },
    accessory: 'cap',
    house: 'dome',
    houseColor: '#C9F0E0',
    roofColor: '#2F9E86',
    pet: 'dog',
    petName: 'Mochi',
    car: '#2F9E86',
    share: { calendar: 'busy', location: 'approx' },
    badges: ['explorer', 'early', 'traveler'],
    nowPlaying: { track: 'Run Boy Run', artist: 'Woodkid', mood: 'hyped' },
    today: 'Priya was on the Oval for a 6am run, then disappeared exploring downtown Palo Alto (location is approximate). She’s at lunch with you and Alex, then has track practice at 4.',
    week: 'Priya logged 31 miles and visited 9 new places this week, more than anyone in the village. She went to a climbing gym three times, so one is under construction.',
    changes: ['9 new places this week', 'Climbing gym under construction because of her', 'Back from a weekend trip to Big Sur'],
    withYou: 'You and Priya have lunch together most weekdays.',
    weekHours: { work: 4, study: 14, exercise: 12, social: 9, create: 0, rest: 12 },
    topPlaces: [{ place: 'park', visits: 6 }, { place: 'dining', visits: 4 }, { place: 'climbing', visits: 3 }],
    schedule: [
      { from: 0, to: h(6), at: 'sleep', doing: 'Sleeping', category: 'rest' },
      { from: h(6), to: h(7, 15), at: 'park', doing: '6 mile tempo run', category: 'exercise' },
      { from: h(7, 15), to: h(9), at: 'home:priya', doing: 'Smoothie + shower', category: 'rest' },
      { from: h(9), to: h(12, 15), at: 'wander', doing: 'Exploring downtown', category: 'social', cal: { title: 'Busy', kind: 'busy' } },
      { from: h(12, 15), to: h(13, 30), at: 'dining', doing: 'Lunch with you + Alex', category: 'social' },
      { from: h(13, 30), to: h(16), at: 'wander', doing: 'Somewhere fun', category: 'study' },
      { from: h(16), to: h(18), at: 'park', doing: 'Track practice', category: 'exercise', cal: { title: 'XC practice', kind: 'busy' } },
      { from: h(18), to: h(21), at: 'home:priya', doing: 'Planning a trip', category: 'rest' },
      { from: h(21), to: h(22), at: 'cafe', doing: 'Decaf + journaling', category: 'rest' },
      { from: h(22), to: 24, at: 'sleep', doing: 'Sleeping', category: 'rest' },
    ],
  },
  {
    id: 'theo',
    name: 'Theo',
    pronouns: 'he/him',
    major: 'Music + CS, sophomore',
    phone: '+16505550199',
    palette: { hair: '#C9472E', skin: '#F0C3A0', shirt: '#1F2A44', pants: '#6B4B3A', accent: '#FFC94A' },
    accessory: 'headphones',
    house: 'cottage',
    houseColor: '#FFE7A8',
    roofColor: '#C9472E',
    pet: 'cat',
    petName: 'Tempo',
    share: { calendar: 'titles', location: 'exact' },
    badges: ['social', 'musician'],
    nowPlaying: { track: 'Tadow', artist: 'Masego & FKJ', mood: 'groovy' },
    today: 'Theo rolled out of bed at 9:30 and went straight to the Annex practice room. Tacos with Cain at noon, band practice at 4, and he’s playing the open mic at Bean There tonight.',
    week: 'Theo has been the social glue this week: he showed up to 8 hangouts, more than anyone. Practice hours are up because the band has a gig on Saturday.',
    changes: ['Most Social badge this week', 'Band gig on Saturday', 'Discovered FKJ and won’t stop'],
    withYou: 'Theo invited you to his open mic tonight at 8.',
    weekHours: { work: 0, study: 10, exercise: 2, social: 18, create: 14, rest: 15 },
    topPlaces: [{ place: 'annex', visits: 5 }, { place: 'taqueria', visits: 3 }, { place: 'cafe', visits: 3 }],
    schedule: [
      { from: 0, to: h(1), at: 'home:theo', doing: 'Writing a song', category: 'create' },
      { from: h(1), to: h(9, 30), at: 'sleep', doing: 'Sleeping', category: 'rest' },
      { from: h(9, 30), to: h(12), at: 'annex', doing: 'Practicing guitar', category: 'create' },
      { from: h(12), to: h(13), at: 'taqueria', doing: 'Tacos with Cain', category: 'social' },
      { from: h(13), to: h(16), at: 'wander', doing: 'Busking by the Oval', category: 'create' },
      { from: h(16), to: h(18), at: 'annex', doing: 'Band practice', category: 'create', cal: { title: 'Band practice', kind: 'busy' } },
      { from: h(18), to: h(20), at: 'dining', doing: 'Dinner', category: 'social' },
      { from: h(20), to: h(22, 30), at: 'cafe', doing: 'Open mic night', category: 'social', cal: { title: 'Open mic', kind: 'busy' } },
      { from: h(22, 30), to: 24, at: 'home:theo', doing: 'Winding down', category: 'rest' },
    ],
  },
  {
    id: 'you',
    name: 'You',
    pronouns: 'she/her',
    major: 'Product Design, junior',
    phone: '',
    palette: { hair: '#6B3A2A', skin: '#F1C7A5', shirt: '#FFC94A', pants: '#3B5BA8', accent: '#FF6B5A' },
    accessory: 'none',
    house: 'cottage',
    houseColor: '#FFD9C2',
    roofColor: '#FF6B5A',
    pet: 'cat',
    petName: 'Noodle',
    share: { calendar: 'titles', location: 'exact' },
    badges: ['social', 'bookworm'],
    nowPlaying: { track: 'Sunflower', artist: 'Rex Orange County', mood: 'sunny' },
    today: 'You had class at the library this morning and lunch with Alex and Priya. Coffee with Maya at 7.',
    week: 'You spent 19 hours studying and hung out with 4 different friends this week.',
    changes: ['Hung out with everyone in the village this month'],
    withYou: '',
    weekHours: { work: 0, study: 19, exercise: 3, social: 11, create: 4, rest: 15 },
    topPlaces: [{ place: 'library', visits: 5 }, { place: 'dining', visits: 4 }, { place: 'cafe', visits: 3 }],
    schedule: [
      { from: 0, to: h(7, 30), at: 'sleep', doing: 'Sleeping', category: 'rest' },
      { from: h(7, 30), to: h(9), at: 'home:you', doing: 'Slow morning', category: 'rest' },
      { from: h(9), to: h(12, 15), at: 'library', doing: 'Design studio', category: 'study', cal: { title: 'DESIGN 110', kind: 'class' } },
      { from: h(12, 15), to: h(13, 30), at: 'dining', doing: 'Lunch with Alex + Priya', category: 'social' },
      { from: h(13, 30), to: h(17), at: 'library', doing: 'Studying', category: 'study' },
      { from: h(17), to: h(19), at: 'home:you', doing: 'Napping, honestly', category: 'rest' },
      { from: h(19), to: h(21), at: 'cafe', doing: 'Coffee with Maya', category: 'social' },
      { from: h(21), to: h(23), at: 'home:you', doing: 'Journaling', category: 'rest' },
      { from: h(23), to: 24, at: 'sleep', doing: 'Sleeping', category: 'rest' },
    ],
  },
];

export const BADGES: Record<string, { label: string; color: string; blurb: string }> = {
  owl: { label: 'Night Owl', color: '#5B4BD6', blurb: 'Up past 2am five nights this week' },
  social: { label: 'Most Social', color: '#FF6B8A', blurb: 'Most hangouts in the village' },
  gym: { label: 'Gym Regular', color: '#D9483A', blurb: '5+ gym visits this week' },
  explorer: { label: 'Explorer', color: '#2F9E86', blurb: '9 new places this week' },
  locked: { label: 'Locked In', color: '#3D7BF2', blurb: '25+ focused hours this week' },
  bookworm: { label: 'Bookworm', color: '#8E6BFF', blurb: 'Library 5 days in a row' },
  commuter: { label: 'Commuter', color: '#54606B', blurb: 'Same route 5 days straight' },
  artist: { label: 'Creator', color: '#E07AC4', blurb: '20+ hours making things' },
  early: { label: 'Early Bird', color: '#FFB020', blurb: 'Out before 6:30am' },
  traveler: { label: 'Traveler', color: '#1FA2D6', blurb: 'Weekend trip logged' },
  musician: { label: 'Musician', color: '#C9472E', blurb: '10+ hours in the practice room' },
};

export const CATEGORY_META: Record<Category, { label: string; color: string }> = {
  work: { label: 'Work', color: '#3D7BF2' },
  study: { label: 'Study', color: '#8E6BFF' },
  exercise: { label: 'Move', color: '#FF6B5A' },
  social: { label: 'Social', color: '#FFB020' },
  create: { label: 'Create', color: '#E07AC4' },
  rest: { label: 'Rest', color: '#5FD3A1' },
};

export function friendById(id: string) {
  return FRIENDS.find((f) => f.id === id);
}

export function placeById(id: PlaceId) {
  return PLACES.find((p) => p.id === id);
}

export function placeName(id: PlaceId | 'wander' | 'sleep') {
  if (id === 'wander') return 'Out and about';
  if (id === 'sleep') return 'Asleep';
  if (id.startsWith('home:')) {
    const f = friendById(id.slice(5));
    return f?.id === 'you' ? 'Your place' : `${f?.name ?? 'Their'}'s place`;
  }
  return placeById(id)?.name ?? id;
}
