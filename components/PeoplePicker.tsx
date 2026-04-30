import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Sheet } from './Sheet';
import { ACCENT, ACCENT_INK, initials } from '@/constants/theme';
import { SELF_ID } from '@/store/useStore';
import type { Person } from '@/store/useStore';

type T = typeof import('@/constants/theme').light;

export function PeoplePicker({
  people, activeIds, onToggle, onAdd, onClose, t,
}: {
  people: Person[]; activeIds: string[];
  onToggle: (id: string) => void; onAdd: (name: string) => void;
  onClose: () => void; t: T;
}) {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('all');

  const selfPerson = people.find(p => p.id === SELF_ID);
  const otherPeople = people.filter(p => p.id !== SELF_ID);
  const allTags = [...new Set(otherPeople.flatMap(p => p.tags))];

  const submit = () => {
    if (name.trim()) { onAdd(name); setName(''); }
  };

  const filtered = tag === 'all' ? otherPeople : otherPeople.filter(p => p.tags.includes(tag));
  const recents = [...otherPeople].slice(-4).reverse();

  return (
    <Sheet title="Who's in?" onClose={onClose} t={t}>
      <View style={s.quickAdd}>
        <TextInput
          style={[s.input, { backgroundColor: t.surface, borderColor: t.border, color: t.ink }]}
          placeholder="Add new — type name, hit enter"
          placeholderTextColor={t.ink3}
          value={name}
          onChangeText={setName}
          onSubmitEditing={submit}
          returnKeyType="done"
          autoFocus
        />
        <TouchableOpacity style={[s.addBtn, { backgroundColor: ACCENT, opacity: name.trim() ? 1 : 0.4 }]} onPress={submit}>
          <Text style={[s.addBtnText, { color: ACCENT_INK }]}>Add</Text>
        </TouchableOpacity>
      </View>

      {selfPerson && (
        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: t.ink3 }]}>You</Text>
          <View style={s.pickerGrid}>
            {(() => {
              const p = selfPerson;
              const on = activeIds.includes(p.id);
              return (
                <TouchableOpacity key={p.id} style={[s.pick, { backgroundColor: t.surface, borderColor: on ? ACCENT : t.border }, on && s.pickOn]} onPress={() => onToggle(p.id)}>
                  <View style={[s.avatarSm, { backgroundColor: p.color }]}>
                    <Text style={s.avatarSmText}>{initials(p.name)}</Text>
                  </View>
                  <Text style={[s.pickName, { color: t.ink }]} numberOfLines={1}>{p.name}</Text>
                  {on && (
                    <View style={[s.pickTick, { backgroundColor: ACCENT }]}>
                      <Text style={{ color: ACCENT_INK, fontSize: 10 }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })()}
          </View>
        </View>
      )}

      {recents.length > 0 && tag === 'all' && (
        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: t.ink3 }]}>Recent</Text>
          <View style={s.pickerGrid}>
            {recents.map(p => {
              const on = activeIds.includes(p.id);
              return (
                <TouchableOpacity key={p.id} style={[s.pick, { backgroundColor: t.surface, borderColor: on ? ACCENT : t.border }, on && s.pickOn]} onPress={() => onToggle(p.id)}>
                  <View style={[s.avatarSm, { backgroundColor: p.color }]}>
                    <Text style={s.avatarSmText}>{initials(p.name)}</Text>
                  </View>
                  <Text style={[s.pickName, { color: t.ink }]} numberOfLines={1}>{p.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <View style={s.section}>
        <View style={s.tagRow}>
          <TouchableOpacity style={[s.tag, { borderColor: t.border, backgroundColor: t.surface }, tag === 'all' && [s.tagOn, { backgroundColor: t.ink, borderColor: t.ink }]]} onPress={() => setTag('all')}>
            <Text style={[s.tagText, { color: tag === 'all' ? t.bg : t.ink2 }]}>All</Text>
          </TouchableOpacity>
          {allTags.map(tg => {
            const on = tag === tg;
            return (
              <TouchableOpacity key={tg} style={[s.tag, { borderColor: t.border, backgroundColor: t.surface }, on && [s.tagOn, { backgroundColor: t.ink, borderColor: t.ink }]]} onPress={() => setTag(tg)}>
                <Text style={[s.tagText, { color: on ? t.bg : t.ink2 }]}>{tg}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={s.pickerGrid}>
          {filtered.map(p => {
            const on = activeIds.includes(p.id);
            return (
              <TouchableOpacity key={p.id} style={[s.pick, { backgroundColor: t.surface, borderColor: on ? ACCENT : t.border }, on && s.pickOn]} onPress={() => onToggle(p.id)}>
                <View style={[s.avatarSm, { backgroundColor: p.color }]}>
                  <Text style={s.avatarSmText}>{initials(p.name)}</Text>
                </View>
                <Text style={[s.pickName, { color: t.ink }]} numberOfLines={1}>{p.name}</Text>
                {on && (
                  <View style={[s.pickTick, { backgroundColor: ACCENT }]}>
                    <Text style={{ color: ACCENT_INK, fontSize: 10 }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  quickAdd: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 14 },
  addBtn: { height: 44, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontWeight: '600', fontSize: 13 },
  section: { marginTop: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 10 },
  tag: { height: 32, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  tagOn: {},
  tagText: { fontSize: 12, fontWeight: '500', textTransform: 'capitalize' },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pick: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingLeft: 6, paddingRight: 10, borderRadius: 26, borderWidth: 1, height: 44,
    position: 'relative', minWidth: 108,
  },
  pickOn: {},
  avatarSm: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  avatarSmText: { fontSize: 10, fontWeight: '700', color: '#0f1505' },
  pickName: { fontSize: 13, fontWeight: '500', flex: 1 },
  pickTick: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff',
  },
});
