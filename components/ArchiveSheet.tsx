import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sheet } from './Sheet';
import { CURRENCY, fmt, initials } from '@/constants/theme';
import type { ArchivedBill } from '@/store/useStore';

type T = typeof import('@/constants/theme').light;

export function ArchiveSheet({
  archive, onView, onDelete, onClose, t,
}: {
  archive: ArchivedBill[];
  onView: (b: ArchivedBill) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  t: T;
}) {
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const enterSelect = (id: string) => {
    setSelecting(true);
    setSelected(new Set([id]));
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      if (next.size === 0) setSelecting(false);
      return next;
    });
  };

  const cancelSelect = () => { setSelecting(false); setSelected(new Set()); };

  const confirmDelete = () => {
    selected.forEach(id => onDelete(id));
    cancelSelect();
  };

  return (
    <Sheet
      title="Archive"
      titleBadge={archive.length}
      onClose={onClose}
      t={t}
      headerRight={selecting ? (
        <View style={s.deleteRow}>
          <TouchableOpacity onPress={cancelSelect} style={[s.deleteBtn, { borderColor: t.border }]}>
            <Text style={[s.deleteBtnText, { color: t.ink2 }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={confirmDelete}
            style={[s.deleteBtn, s.deleteBtnRed, { opacity: selected.size > 0 ? 1 : 0.35 }]}
            disabled={selected.size === 0}
          >
            <Text style={s.deleteBtnTextRed}>Delete {selected.size > 0 ? `(${selected.size})` : ''}</Text>
          </TouchableOpacity>
        </View>
      ) : undefined}
    >
      {archive.length === 0 ? (
        <View style={s.empty}>
          <Text style={[s.emptySymbol, { color: t.ink3 }]}>⌗</Text>
          <Text style={[s.emptyH, { color: t.ink }]}>No archived bills</Text>
          <Text style={[s.emptyP, { color: t.ink2 }]}>Bills you finish will land here.</Text>
        </View>
      ) : (
        <View style={s.list}>
          {archive.map(b => {
            const isSelected = selected.has(b.id);
            return (
              <TouchableOpacity
                key={b.id}
                style={[s.card, { backgroundColor: t.surface, borderColor: selecting ? (isSelected ? '#EF4444' : t.border) : t.border }]}
                onPress={() => selecting ? toggleSelect(b.id) : onView(b)}
                onLongPress={() => !selecting && enterSelect(b.id)}
                delayLongPress={400}
              >
                <View style={s.row1}>
                  <Text style={[s.arcTitle, { color: selecting && isSelected ? '#EF4444' : t.ink }]}>{b.title}</Text>
                  <Text style={[s.arcTotal, { color: selecting && isSelected ? '#EF4444' : t.ink }]}>{CURRENCY}{fmt(b.total)}</Text>
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
            );
          })}
        </View>
      )}
    </Sheet>
  );
}

const s = StyleSheet.create({
  list: { gap: 8, paddingBottom: 16 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
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
  deleteRow: { flexDirection: 'row', gap: 6 },
  deleteBtn: { height: 28, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 12, fontWeight: '500' },
  deleteBtnRed: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  deleteBtnTextRed: { fontSize: 12, fontWeight: '600', color: '#fff' },
});
