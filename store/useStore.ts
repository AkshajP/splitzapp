import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback } from 'react';
import { autoTitle } from '@/constants/theme';

export type Person = {
  id: string;
  name: string;
  tags: string[];
  color: string;
};

export type Item = {
  id: string;
  name: string;
  amount: number;
  assigned: string[];
  mode: 'equal' | 'percent';
  percents?: Record<string, number>;
};

export type ArchivedBill = {
  id: string;
  title: string;
  date: string;
  total: number;
  peopleCount: number;
  items: { name: string; amount: number }[];
  perPerson: { name: string; color: string; share: number }[];
  tax?: number;
  taxType?: 'amount' | 'pct';
  service?: number;
  serviceType?: 'amount' | 'pct';
  discount?: number;
  discountType?: 'amount' | 'pct';
};

type State = {
  people: Person[];
  activePeopleIds: string[];
  items: Item[];
  tax: number;
  taxType: 'amount' | 'pct';
  service: number;
  serviceType: 'amount' | 'pct';
  discount: number;
  discountType: 'amount' | 'pct';
  billTitle: string;
  billTitleLocked: boolean;
  archive: ArchivedBill[];
  recentItems: string[];
};

const STORAGE_KEY = 'splitzapp_state';

export const SELF_ID = 'self';
export const SELF_PERSON: Person = {
  id: SELF_ID,
  name: 'Me',
  tags: [],
  color: '#a78bfa',
};

const COLORS = ['#7dd3c0','#fbbf77','#f9a8d4','#a5b4fc','#fcd34d','#86efac','#fda4af','#93c5fd','#c4b5fd','#fde68a'];

const DEFAULT_STATE: State = {
  people: [SELF_PERSON],
  activePeopleIds: [SELF_ID],
  items: [],
  tax: 18,
  taxType: 'pct' as const,
  service: 10,
  serviceType: 'pct' as const,
  discount: 0,
  discountType: 'amount' as const,
  billTitle: '',
  billTitleLocked: false,
  archive: [],
  recentItems: [],
};

export function useStore() {
  const [state, setState] = useState<State>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const merged = { ...DEFAULT_STATE, ...parsed };
          // Ensure self person is always present
          if (!merged.people.find((p: Person) => p.id === SELF_ID)) {
            merged.people = [SELF_PERSON, ...merged.people];
          }
          if (!merged.activePeopleIds.includes(SELF_ID)) {
            merged.activePeopleIds = [SELF_ID, ...merged.activePeopleIds];
          }
          // If no items, bill never started — treat title as unlocked
          if (merged.items.length === 0) {
            merged.billTitleLocked = false;
            merged.billTitle = '';
          }
          setState(merged);
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const save = useCallback((next: State) => {
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const update = useCallback((partial: Partial<State>) => {
    setState(prev => {
      const next = { ...prev, ...partial };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addPerson = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState(prev => {
      const id = 'p' + Date.now();
      const color = COLORS[prev.people.length % COLORS.length];
      const person: Person = { id, name: trimmed, tags: [], color };
      const next: State = {
        ...prev,
        people: [...prev.people, person],
        activePeopleIds: [...prev.activePeopleIds, id],
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const togglePersonActive = useCallback((id: string) => {
    setState(prev => {
      const activePeopleIds = prev.activePeopleIds.includes(id)
        ? prev.activePeopleIds.filter(x => x !== id)
        : [...prev.activePeopleIds, id];
      const next = { ...prev, activePeopleIds };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const upsertItem = useCallback((item: Item) => {
    setState(prev => {
      const idx = prev.items.findIndex(x => x.id === item.id);
      const isNew = idx === -1;
      const items = isNew ? [...prev.items, item] : prev.items.map((x, i) => i === idx ? item : x);
      const name = item.name.trim();
      const recentItems = name
        ? [name, ...prev.recentItems.filter(r => r.toLowerCase() !== name.toLowerCase())].slice(0, 50)
        : prev.recentItems;
      // Lock title on first item added
      const billTitleLocked = prev.billTitleLocked || (isNew && prev.items.length === 0);
      const billTitle = billTitleLocked && !prev.billTitleLocked ? autoTitle() : prev.billTitle;
      const next = { ...prev, items, recentItems, billTitle, billTitleLocked };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteItem = useCallback((id: string) => {
    setState(prev => {
      const next = { ...prev, items: prev.items.filter(x => x.id !== id) };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const startNewBill = useCallback((archiveTitle?: string) => {
    setState(prev => {
      const activePeople = prev.activePeopleIds.map(id => prev.people.find(p => p.id === id)!).filter(Boolean);
      const subtotal = prev.items.reduce((s, i) => s + (i.amount || 0), 0);
      const taxAmt = prev.taxType === 'amount' ? prev.tax : subtotal * (prev.tax / 100);
      const serviceAmt = prev.serviceType === 'amount' ? prev.service : subtotal * (prev.service / 100);
      const rawDiscountAmt = prev.discountType === 'pct' ? subtotal * (prev.discount / 100) : prev.discount;
      const discountAmt = Math.min(rawDiscountAmt, subtotal);
      const grand = subtotal + taxAmt + serviceAmt - discountAmt;

      const perPersonShares: Record<string, number> = {};
      prev.activePeopleIds.forEach(pid => { perPersonShares[pid] = 0; });
      prev.items.forEach(it => {
        const ppl = it.assigned.filter(pid => prev.activePeopleIds.includes(pid));
        if (ppl.length === 0) return;
        if (it.mode === 'percent' && it.percents) {
          ppl.forEach(pid => { perPersonShares[pid] = (perPersonShares[pid] || 0) + it.amount * ((it.percents![pid] || 0) / 100); });
        } else {
          const share = it.amount / ppl.length;
          ppl.forEach(pid => { perPersonShares[pid] = (perPersonShares[pid] || 0) + share; });
        }
      });

      const newArchive: ArchivedBill[] = prev.items.length > 0 ? [
        {
          id: 'b' + Date.now(),
          title: (archiveTitle?.trim()) || prev.billTitle,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          total: grand,
          peopleCount: prev.activePeopleIds.length,
          items: prev.items.map(it => ({ name: it.name, amount: it.amount })),
          perPerson: activePeople.map(p => ({
            name: p.name, color: p.color,
            share: (() => {
              const base = perPersonShares[p.id] || 0;
              const ratio = subtotal > 0 ? base / subtotal : 0;
              return base + taxAmt * ratio + serviceAmt * ratio - discountAmt * ratio;
            })(),
          })),
          tax: prev.tax, taxType: prev.taxType,
          service: prev.service, serviceType: prev.serviceType,
          discount: prev.discount, discountType: prev.discountType,
        },
        ...prev.archive,
      ] : prev.archive;

      const nextActiveIds = prev.activePeopleIds.includes(SELF_ID)
        ? prev.activePeopleIds
        : [SELF_ID, ...prev.activePeopleIds];

      const next: State = {
        ...prev,
        activePeopleIds: nextActiveIds,
        items: [],
        tax: 18,
        taxType: 'pct' as const,
        service: 10,
        serviceType: 'pct' as const,
        discount: 0,
        discountType: 'amount' as const,
        billTitle: '',
        billTitleLocked: false,
        archive: newArchive,
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updatePersonTags = useCallback((id: string, tags: string[]) => {
    setState(prev => {
      const next: State = {
        ...prev,
        people: prev.people.map(p => p.id === id ? { ...p, tags } : p),
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteArchivedBill = useCallback((id: string) => {
    setState(prev => {
      const next = { ...prev, archive: prev.archive.filter(b => b.id !== id) };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const renameArchivedBill = useCallback((id: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setState(prev => {
      const next = { ...prev, archive: prev.archive.map(b => b.id === id ? { ...b, title: trimmed } : b) };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deletePeople = useCallback((ids: string[]) => {
    const set = new Set(ids.filter(id => id !== SELF_ID));
    setState(prev => {
      const next: State = {
        ...prev,
        people: prev.people.filter(p => !set.has(p.id)),
        activePeopleIds: prev.activePeopleIds.filter(id => !set.has(id)),
        items: prev.items.map(it => ({
          ...it,
          assigned: it.assigned.filter(pid => !set.has(pid)),
          percents: it.percents
            ? Object.fromEntries(Object.entries(it.percents).filter(([k]) => !set.has(k)))
            : undefined,
        })),
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return {
    ...state,
    loaded,
    update,
    addPerson,
    togglePersonActive,
    upsertItem,
    deleteItem,
    startNewBill,
    updatePersonTags,
    deleteArchivedBill,
    renameArchivedBill,
    deletePeople,
  };
}

export function computeTotals(
  items: Item[],
  activePeopleIds: string[],
  tax: number,
  service: number,
  discount: number,
  discountType: 'amount' | 'pct' = 'amount',
  taxType: 'amount' | 'pct' = 'pct',
  serviceType: 'amount' | 'pct' = 'pct',
) {
  const subtotal = items.reduce((s, i) => s + (i.amount || 0), 0);
  const taxAmt = taxType === 'amount' ? tax : subtotal * (tax / 100);
  const serviceAmt = serviceType === 'amount' ? service : subtotal * (service / 100);
  const rawDiscountAmt = discountType === 'pct' ? subtotal * (discount / 100) : discount;
  const discountAmt = Math.min(rawDiscountAmt, subtotal);
  const grand = subtotal + taxAmt + serviceAmt - discountAmt;

  const perPerson: Record<string, { items: number; tax: number; service: number; discount: number; share: number }> = {};
  activePeopleIds.forEach(pid => { perPerson[pid] = { items: 0, tax: 0, service: 0, discount: 0, share: 0 }; });

  items.forEach(it => {
    const ppl = it.assigned.filter(pid => activePeopleIds.includes(pid));
    if (ppl.length === 0) return;
    if (it.mode === 'percent' && it.percents) {
      ppl.forEach(pid => {
        const pct = it.percents![pid] || 0;
        if (perPerson[pid]) perPerson[pid].items += it.amount * (pct / 100);
      });
    } else {
      const share = it.amount / ppl.length;
      ppl.forEach(pid => { if (perPerson[pid]) perPerson[pid].items += share; });
    }
  });

  activePeopleIds.forEach(pid => {
    const base = perPerson[pid].items;
    const ratio = subtotal > 0 ? base / subtotal : 0;
    perPerson[pid].tax = taxAmt * ratio;
    perPerson[pid].service = serviceAmt * ratio;
    perPerson[pid].discount = discountAmt * ratio;
    perPerson[pid].share = base + perPerson[pid].tax + perPerson[pid].service - perPerson[pid].discount;
  });

  return { subtotal, taxAmt, serviceAmt, discountAmt, grand, perPerson };
}
