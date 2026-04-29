import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { CURRENCY, fmt, initials } from '@/constants/theme';
import type { ArchivedBill } from '@/store/useStore';

type T = typeof import('@/constants/theme').light;

export function ArchiveScreen({
  archive, onView, onDelete, t,
}: {
  archive: ArchivedBill[]; onView: (b: ArchivedBill) => void;
  onDelete: (id: string) => void; t: T;
}) {
  if (archive.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={[s.emptySymbol, { color: t.ink3 }]}>⌗</Text>
        <Text style={[s.emptyH, { color: t.ink }]}>No archived bills</Text>
        <Text style={[s.emptyP, { color: t.ink2 }]}>Bills you finish will land here.</Text>
      </View>
    );
  }
  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      {archive.map(b => (
        <TouchableOpacity key={b.id} style={[s.card, { backgroundColor: t.surface, borderColor: t.border }]} onPress={() => onView(b)}>
          <View style={s.row1}>
            <Text style={[s.arcTitle, { color: t.ink }]}>{b.title}</Text>
            <Text style={[s.arcTotal, { color: t.ink }]}>{CURRENCY}{fmt(b.total)}</Text>
          </View>
          <View style={s.row2}>
            <View style={s.avatars}>
              {b.perPerson.slice(0, 4).map((p, i) => (
                <View key={i} style={[s.avatarSm, { backgroundColor: p.color, marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i }]}>
                  <Text style={s.avatarSmText}>{initials(p.name)}</Text>
                </View>
              ))}
              {b.perPerson.length > 4 && (
                <View style={[s.avatarSm, { backgroundColor: t.surface2, marginLeft: -8 }]}>
                  <Text style={[s.avatarSmText, { color: t.ink2 }]}>+{b.perPerson.length - 4}</Text>
                </View>
              )}
            </View>
            <Text style={[s.meta, { color: t.ink3 }]}>{b.date} · {b.items.length} items</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 8, paddingBottom: 32 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptySymbol: { fontSize: 48, fontWeight: '300' },
  emptyH: { fontSize: 18, fontWeight: '600', marginTop: 8 },
  emptyP: { fontSize: 14, marginTop: 4 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  row1: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
  arcTitle: { fontSize: 15, fontWeight: '600' },
  arcTotal: { fontSize: 16, fontWeight: '700' },
  row2: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatars: { flexDirection: 'row', alignItems: 'center' },
  avatarSm: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fff' },
  avatarSmText: { fontSize: 10, fontWeight: '700', color: '#0f1505' },
  meta: { fontSize: 11 },
});
