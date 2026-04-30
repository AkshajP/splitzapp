import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Sheet } from './Sheet';
import { CURRENCY, fmt, initials } from '@/constants/theme';
import type { ArchivedBill } from '@/store/useStore';

type T = typeof import('@/constants/theme').light;

export function ArchiveSheet({
  archive, onView, onDelete, onRename, onClose, t,
}: {
  archive: ArchivedBill[];
  onView: (b: ArchivedBill) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onClose: () => void;
  t: T;
}) {
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

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

  const startRename = (b: ArchivedBill) => {
    setRenamingId(b.id);
    setRenameValue(b.title);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      onRename(renamingId, renameValue);
    }
    setRenamingId(null);
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
            const isRenaming = renamingId === b.id;
            return (
              <TouchableOpacity
                key={b.id}
                style={[s.card, { backgroundColor: t.surface, borderColor: selecting ? (isSelected ? '#EF4444' : t.border) : t.border }]}
                onPress={() => {
                  if (isRenaming) return;
                  selecting ? toggleSelect(b.id) : onView(b);
                }}
                onLongPress={() => !selecting && !isRenaming && enterSelect(b.id)}
                delayLongPress={400}
                activeOpacity={isRenaming ? 1 : 0.7}
              >
                <View style={s.row1}>
                  {isRenaming ? (
                    <TextInput
                      style={[s.renameInput, { color: t.ink, borderBottomColor: t.border }]}
                      value={renameValue}
                      onChangeText={setRenameValue}
                      onSubmitEditing={commitRename}
                      onBlur={commitRename}
                      returnKeyType="done"
                      autoFocus
                      selectTextOnFocus
                    />
                  ) : (
                    <Text style={[s.arcTitle, { color: selecting && isSelected ? '#EF4444' : t.ink, flex: 1 }]}>{b.title}</Text>
                  )}
                  <View style={s.row1Right}>
                    {!selecting && !isRenaming && (
                      <TouchableOpacity
                        onPress={() => startRename(b)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={[s.renameIcon, { color: t.ink3 }]}>✎</Text>
                      </TouchableOpacity>
                    )}
                    {isRenaming ? (
                      <TouchableOpacity onPress={commitRename} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[s.renameDone, { color: t.ink }]}>Done</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={[s.arcTotal, { color: selecting && isSelected ? '#EF4444' : t.ink }]}>{CURRENCY}{fmt(b.total)}</Text>
                    )}
                  </View>
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
  row1: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  row1Right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  arcTitle: { fontSize: 15, fontWeight: '600' },
  arcTotal: { fontSize: 16, fontWeight: '700' },
  renameIcon: { fontSize: 16 },
  renameInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    borderBottomWidth: 1,
    paddingVertical: 2,
  },
  renameDone: { fontSize: 13, fontWeight: '600' },
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
