import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import type { GiftKind } from '@/components/sprites';
import type { HouseStyle, PetKind } from './world';

export type Integration = 'calendar' | 'location' | 'chats' | 'music' | 'photos';
export type Audience = 'everyone' | 'close' | 'nobody';

export type Hangout = { id: string; friendId: string; from: number; to: number; place: string };

type Store = {
  t: number;
  live: boolean;
  playing: boolean;
  setT: (t: number) => void;
  goLive: () => void;
  togglePlay: () => void;
  gifts: Record<string, GiftKind[]>;
  giveGift: (friendId: string, kind: GiftKind) => void;
  hangouts: Hangout[];
  proposeHangout: (h: Omit<Hangout, 'id'>) => void;
  integrations: Record<Integration, boolean>;
  setIntegration: (k: Integration, on: boolean) => void;
  audience: Record<Integration, Audience>;
  setAudience: (k: Integration, a: Audience) => void;
  calendarDetail: 'busy' | 'titles';
  setCalendarDetail: (d: 'busy' | 'titles') => void;
  me: { house: HouseStyle; pet: PetKind; carPhoto: string | null; houseColor: string };
  setMe: (patch: Partial<Store['me']>) => void;
};

const Ctx = createContext<Store | null>(null);

function nowHours() {
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [t, setTState] = useState(nowHours);
  const [live, setLive] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [gifts, setGifts] = useState<Record<string, GiftKind[]>>({ maya: ['stars'], alex: ['plant'] });
  const [hangouts, setHangouts] = useState<Hangout[]>([]);
  const [integrations, setIntegrations] = useState<Record<Integration, boolean>>({
    calendar: true,
    location: true,
    chats: true,
    music: true,
    photos: false,
  });
  const [audience, setAudienceState] = useState<Record<Integration, Audience>>({
    calendar: 'everyone',
    location: 'close',
    chats: 'close',
    music: 'everyone',
    photos: 'everyone',
  });
  const [calendarDetail, setCalendarDetail] = useState<'busy' | 'titles'>('busy');
  const [me, setMeState] = useState<Store['me']>({ house: 'cottage', pet: 'cat', carPhoto: null, houseColor: '#FFD9C2' });

  useEffect(() => {
    if (playing) {
      const id = setInterval(() => setTState((x) => (x + 2 / 60) % 24), 100);
      return () => clearInterval(id);
    }
    if (live) {
      const id = setInterval(() => setTState(nowHours()), 15000);
      return () => clearInterval(id);
    }
  }, [playing, live]);

  const value: Store = {
    t,
    live,
    playing,
    setT: (x) => {
      setLive(false);
      setTState(x);
    },
    goLive: () => {
      setPlaying(false);
      setLive(true);
      setTState(nowHours());
    },
    togglePlay: () => {
      setLive(false);
      setPlaying((p) => !p);
    },
    gifts,
    giveGift: (friendId, kind) => setGifts((g) => ({ ...g, [friendId]: [...(g[friendId] ?? []), kind].slice(-4) })),
    hangouts,
    proposeHangout: (h) => setHangouts((list) => [...list, { ...h, id: `${h.friendId}-${h.from}` }]),
    integrations,
    setIntegration: (k, on) => setIntegrations((s) => ({ ...s, [k]: on })),
    audience,
    setAudience: (k, a) => setAudienceState((s) => ({ ...s, [k]: a })),
    calendarDetail,
    setCalendarDetail,
    me,
    setMe: (patch) => setMeState((m) => ({ ...m, ...patch })),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}
