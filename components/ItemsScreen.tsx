import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { CURRENCY, ACCENT, ACCENT_INK, fmt, initials } from '@/constants/theme';
import type { Item, Person } from '@/store/useStore';

type T = typeof import('@/constants/theme').light;
type Totals = ReturnType<typeof import('@/store/useStore').computeTotals>;

export function ItemsScreen({
  items, people, activePeople, onEdit, onDelete, onAdd, totals, t,
}: {
  items: Item[]; people: Person[]; activePeople: Person[];
  onEdit: (id: string) => void; onDelete: (id: string) => void;
  onAdd: () => void; totals: Totals; t: T;
}) {
  return (
    <View style={s.root}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        {items.length === 0 && (
          <View style={s.empty}>
            <Text style={[s.emptySymbol, { color: t.ink3 }]}>$</Text>
            <Text style={[s.emptyH, { color: t.ink }]}>No items yet</Text>
            <Text style={[s.emptyP, { color: t.ink2 }]}>Add what you ordered. Tap who's in.</Text>
          </View>
        )}
        {items.map(it => (
          <ItemCard key={it.id} item={it} people={people} onEdit={() => onEdit(it.id)} t={t} />
        ))}
        {items.length > 0 && (
          <View style={s.subtotalRow}>
            <Text style={[s.subtotalLabel, { color: t.ink2 }]}>Subtotal · {items.length} items</Text>
            <Text style={[s.subtotalAmt, { color: t.ink }]}>{CURRENCY}{fmt(totals.subtotal)}</Text>
          </View>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
      <TouchableOpacity style={[s.fab, { backgroundColor: ACCENT }]} onPress={onAdd}>
        <Text style={[s.fabText, { color: ACCENT_INK }]}>+ Add item</Text>
      </TouchableOpacity>
    </View>
  );
}

function ItemCard({ item, people, onEdit, t }: { item: Item; people: Person[]; onEdit: () => void; t: T }) {
  const assigned = item.assigned.map(id => people.find(p => p.id === id)!).filter(Boolean);
  const perHead = assigned.length > 0 ? item.amount / assigned.length : 0;
  return (
    <TouchableOpacity style={[s.card, { backgroundColor: t.surface, borderColor: t.border }]} onPress={onEdit}>
      <View style={s.cardRow}>
        <Text style={[s.cardName, { color: t.ink }]}>{item.name}</Text>
        <Text style={[s.cardAmt, { color: t.ink }]}>{CURRENCY}{fmt(item.amount)}</Text>
      </View>
      <View style={[s.cardRow, { marginTop: 8 }]}>
        <View style={s.avatars}>
          {assigned.slice(0, 5).map((p, i) => (
            <View key={p.id} style={[s.avatarSm, { backgroundColor: p.color, marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i }]}>
              <Text style={s.avatarSmText}>{initials(p.name)}</Text>
            </View>
          ))}
          {assigned.length > 5 && (
            <View style={[s.avatarSm, s.avatarMore, { backgroundColor: t.surface2, marginLeft: -8 }]}>
              <Text style={[s.avatarSmText, { color: t.ink2 }]}>+{assigned.length - 5}</Text>
            </View>
          )}
          {assigned.length === 0 && <Text style={[s.unassigned, { color: t.ink3 }]}>Tap to assign</Text>}
        </View>
        <Text style={[s.perHead, { color: t.ink2 }]}>
          {item.mode === 'percent' ? '% split' : `${CURRENCY}${fmt(perHead)} ea`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 8 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptySymbol: { fontSize: 48, fontWeight: '300' },
  emptyH: { fontSize: 18, fontWeight: '600', marginTop: 8 },
  emptyP: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  card: { borderRadius: 12, borderWidth: 1, padding: 14 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  cardName: { fontSize: 15, fontWeight: '600', flex: 1 },
  cardAmt: { fontSize: 15, fontWeight: '600' },
  avatars: { flexDirection: 'row', alignItems: 'center' },
  avatarSm: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fff' },
  avatarSmText: { fontSize: 10, fontWeight: '700', color: '#0f1505' },
  avatarMore: {},
  unassigned: { fontSize: 12, fontStyle: 'italic' },
  perHead: { fontSize: 12 },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, paddingTop: 6 },
  subtotalLabel: { fontSize: 13 },
  subtotalAmt: { fontSize: 13, fontWeight: '600' },
  fab: {
    position: 'absolute', left: 16, right: 16, bottom: 16,
    height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    shadowColor: ACCENT, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: { fontSize: 15, fontWeight: '700' },
});
