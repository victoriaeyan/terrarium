import {
  AVENUE_X,
  FRIENDS,
  Friend,
  HOUSE_LOTS,
  PlaceId,
  Segment,
  placeById,
  placeName,
} from './world';

export type Spot = { x: number; y: number; road: number };

export function segmentAt(friend: Friend, t: number): Segment {
  const hour = ((t % 24) + 24) % 24;
  return friend.schedule.find((s) => hour >= s.from && hour < s.to) ?? friend.schedule[0];
}

export function nextSegment(friend: Friend, t: number): Segment | undefined {
  return friend.schedule.find((s) => s.from > t);
}

export function homeLot(friend: Friend) {
  const i = FRIENDS.findIndex((f) => f.id === friend.id);
  return HOUSE_LOTS[i];
}

export function spotForPlace(at: PlaceId): Spot {
  if (at.startsWith('home:')) {
    const f = FRIENDS.find((x) => x.id === at.slice(5))!;
    const lot = homeLot(f);
    return { x: lot.x + 1.5, y: lot.y + 3.5, road: lot.y + 3.5 };
  }
  const p = placeById(at)!;
  return { x: p.spot.x, y: p.spot.y, road: p.road };
}

const CLUSTER = [
  { x: 0, y: 0 },
  { x: -0.85, y: 0.05 },
  { x: 0.85, y: 0.05 },
  { x: -0.45, y: -0.55 },
  { x: 0.45, y: -0.55 },
  { x: 0, y: 0.6 },
];

export function clusterOffset(i: number) {
  return CLUSTER[i % CLUSTER.length];
}

export function waypoints(from: Spot, to: Spot) {
  if (Math.abs(from.road - to.road) < 0.01) {
    return [
      { x: from.x, y: from.road },
      { x: to.x, y: to.road },
      { x: to.x, y: to.y },
    ];
  }
  return [
    { x: from.x, y: from.road },
    { x: AVENUE_X, y: from.road },
    { x: AVENUE_X, y: to.road },
    { x: to.x, y: to.road },
    { x: to.x, y: to.y },
  ];
}

export type Presence = {
  friend: Friend;
  seg: Segment;
  key: string;
  together: string[];
};

export function presenceAt(t: number): Presence[] {
  const list = FRIENDS.map((friend) => {
    const seg = segmentAt(friend, t);
    return { friend, seg, key: seg.at, together: [] as string[] };
  });
  for (const p of list) {
    if (p.seg.at === 'sleep' || p.seg.at === 'wander') continue;
    p.together = list
      .filter((o) => o !== p && o.seg.at === p.seg.at)
      .map((o) => o.friend.id);
  }
  return list;
}

export type Status = { label: string; tone: 'free' | 'busy' | 'meeting' | 'class' | 'asleep' };

export function statusFor(friend: Friend, t: number): Status {
  const seg = segmentAt(friend, t);
  if (seg.at === 'sleep') return { label: 'Asleep', tone: 'asleep' };
  if (!seg.cal) return { label: 'Free', tone: 'free' };
  if (friend.share.calendar === 'busy') return { label: 'Busy', tone: 'busy' };
  if (seg.cal.kind === 'meeting') return { label: `In a meeting · ${seg.cal.title}`, tone: 'meeting' };
  if (seg.cal.kind === 'class') return { label: `In class · ${seg.cal.title}`, tone: 'class' };
  return { label: `Busy · ${seg.cal.title}`, tone: 'busy' };
}

export function whereLabel(friend: Friend, t: number) {
  const seg = segmentAt(friend, t);
  if (seg.at === 'wander') return friend.share.location === 'approx' ? 'Somewhere nearby' : 'Out and about';
  return placeName(seg.at);
}

export function formatClock(t: number) {
  const hour = Math.floor(((t % 24) + 24) % 24);
  const min = Math.floor((t - Math.floor(t)) * 60);
  const suffix = hour < 12 ? 'AM' : 'PM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(min).padStart(2, '0')} ${suffix}`;
}

export function formatHour(t: number) {
  const hour = Math.floor(t) % 24;
  const min = Math.round((t - Math.floor(t)) * 60);
  const suffix = hour < 12 ? 'a' : 'p';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return min === 0 ? `${h12}${suffix}` : `${h12}:${String(min).padStart(2, '0')}${suffix}`;
}

const COUNT_WORDS = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];

export type Buzz = { id: string; text: string; kind: 'together' | 'heading' | 'group' | 'music' };

export function buzzAt(t: number): Buzz[] {
  const out: Buzz[] = [];
  const pres = presenceAt(t);
  const seen = new Set<string>();
  for (const p of pres) {
    if (p.together.length === 0 || seen.has(p.key)) continue;
    seen.add(p.key);
    const names = [p.friend, ...p.together.map((id) => FRIENDS.find((f) => f.id === id)!)];
    const label = placeName(p.seg.at);
    if (names.length >= 3) {
      out.push({ id: `g-${p.key}`, kind: 'group', text: `${COUNT_WORDS[names.length]} friends are at ${label} right now` });
    } else {
      const [a, b] = names.map((n) => n.name);
      out.push({ id: `t-${p.key}`, kind: 'together', text: `${a} and ${b} are hanging out at ${label}` });
    }
  }
  for (const f of FRIENDS) {
    if (f.id === 'you') continue;
    const next = nextSegment(f, t);
    if (!next || next.at === 'sleep' || next.at === 'wander') continue;
    const mins = Math.round((next.from - t) * 60);
    if (mins > 0 && mins <= 30) {
      out.push({ id: `h-${f.id}-${next.from}`, kind: 'heading', text: `${f.name} is heading to ${placeName(next.at)} in ${mins} min` });
    }
  }
  if (out.length === 0) {
    const listening = FRIENDS.filter((f) => f.id !== 'you' && segmentAt(f, t).at !== 'sleep');
    if (listening.length > 0) {
      const f = listening[Math.floor(t) % listening.length];
      out.push({ id: `m-${f.id}`, kind: 'music', text: `${f.name} is listening to ${f.nowPlaying.track} · ${f.nowPlaying.mood}` });
    } else {
      out.push({ id: 'quiet', kind: 'music', text: 'The village is asleep. Shh.' });
    }
  }
  return out;
}

export function isBusy(friend: Friend, t: number) {
  const seg = segmentAt(friend, t);
  return seg.at === 'sleep' || !!seg.cal;
}

export function freeWindows(a: Friend, b: Friend, from: number) {
  const windows: { from: number; to: number }[] = [];
  let start: number | null = null;
  for (let t = Math.ceil(from * 4) / 4; t <= 24; t += 0.25) {
    const free = t < 24 && !isBusy(a, t) && !isBusy(b, t);
    if (free && start === null) start = t;
    if (!free && start !== null) {
      if (t - start >= 0.75) windows.push({ from: start, to: t });
      start = null;
    }
  }
  return windows.slice(0, 4);
}

export function daylight(t: number) {
  const hour = ((t % 24) + 24) % 24;
  if (hour >= 7.5 && hour < 17.5) return 0;
  if (hour >= 17.5 && hour < 20) return (hour - 17.5) / 2.5;
  if (hour >= 5.5 && hour < 7.5) return 1 - (hour - 5.5) / 2;
  return 1;
}
