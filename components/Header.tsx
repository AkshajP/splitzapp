import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ACCENT, ACCENT_INK } from '@/constants/theme';
export type Tab = 'items' | 'summary' | 'people' | 'archive';

type T = typeof import('@/constants/theme').light;

export function Header({
  tab, setTab, activeCount, archiveCount, billTitle, onNewBill, t,
}: {
  tab: Tab; setTab: (t: Tab) => void;
  activeCount: number; archiveCount: number;
  billTitle: string; onNewBill: () => void;
  t: T;
}) {
  return (
    <View style={[s.header, { backgroundColor: t.bg }]}>
      <View style={s.top}>
        <View style={s.titles}>
          <Text style={[s.eyebrow, { color: t.ink3 }]}>Current bill</Text>
          <Text style={[s.title, { color: t.ink }]} numberOfLines={1}>{billTitle}</Text>
        </View>
        <View style={s.actions}>
          <TouchableOpacity
            style={[s.iconBtn, { backgroundColor: tab === 'archive' ? t.ink : t.surface, borderColor: tab === 'archive' ? t.ink : t.border }]}
            onPress={() => setTab('archive')}
          >
            <Text style={{ fontSize: 16, color: tab === 'archive' ? t.bg : t.ink }}>⊟</Text>
            {archiveCount > 0 && (
              <View style={[s.badge, { backgroundColor: ACCENT }]}>
                <Text style={[s.badgeText, { color: ACCENT_INK }]}>{archiveCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: ACCENT, borderColor: ACCENT }]} onPress={onNewBill}>
            <Text style={{ fontSize: 20, color: ACCENT_INK, lineHeight: 22 }}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[s.tabs, { backgroundColor: t.surface2 }]}>
        {(['items', 'summary', 'people'] as Tab[]).map((id) => {
          const labels: Record<string, string> = {
            items: 'Items',
            summary: 'Split',
            people: `People · ${activeCount}`,
          };
          const on = tab === id;
          return (
            <TouchableOpacity
              key={id}
              style={[s.tab, on && [s.tabOn, { backgroundColor: t.surface }]]}
              onPress={() => setTab(id)}
            >
              <Text style={[s.tabText, { color: on ? t.ink : t.ink2 }]}>{labels[id]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8 },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingVertical: 8, marginBottom: 12 },
  titles: { flex: 1, minWidth: 0 },
  eyebrow: { fontSize: 11, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  iconBtn: {
    width: 36, height: 36, borderRadius: 12,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute', top: -4, right: -4,
    minWidth: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },
  tabs: { flexDirection: 'row', gap: 4, borderRadius: 12, padding: 4, marginBottom: 0 },
  tab: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
  tabOn: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  tabText: { fontSize: 13, fontWeight: '600' },
});
