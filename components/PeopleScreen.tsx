import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { initials } from '@/constants/theme';
import { ACCENT, ACCENT_INK } from '@/constants/theme';
import type { Person } from '@/store/useStore';

type T = typeof import('@/constants/theme').light;

export function PeopleScreen({
  people, activeIds, onToggle, onAdd, t,
}: {
  people: Person[]; activeIds: string[];
  onToggle: (id: string) => void; onAdd: (name: string) => void;
  t: T;
}) {
  const [name, setName] = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const allTags = [...new Set(people.flatMap(p => p.tags))];

  const submit = () => {
    if (name.trim()) { onAdd(name); setName(''); }
  };

  const filtered = activeTag === 'all' ? people : people.filter(p => p.tags.includes(activeTag));

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <View style={s.quickAdd}>
        <TextInput
          style={[s.input, { backgroundColor: t.surface, borderColor: t.border, color: t.ink }]}
          placeholder="Type a name, hit enter"
          placeholderTextColor={t.ink3}
          value={name}
          onChangeText={setName}
          onSubmitEditing={submit}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[s.addBtn, { backgroundColor: t.ink, opacity: name.trim() ? 1 : 0.4 }]}
          onPress={submit} disabled={!name.trim()}
        >
          <Text style={[s.addBtnText, { color: t.bg }]}>Add</Text>
        </TouchableOpacity>
      </View>

      {allTags.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tagRow} contentContainerStyle={s.tagContent}>
          <TouchableOpacity style={[s.tag, activeTag === 'all' && [s.tagOn, { backgroundColor: t.ink, borderColor: t.ink }]]} onPress={() => setActiveTag('all')}>
            <Text style={[s.tagText, { color: activeTag === 'all' ? t.bg : t.ink2 }]}>All · {people.length}</Text>
          </TouchableOpacity>
          {allTags.map(tag => {
            const count = people.filter(p => p.tags.includes(tag)).length;
            const on = activeTag === tag;
            return (
              <TouchableOpacity key={tag} style={[s.tag, { borderColor: t.border, backgroundColor: t.surface }, on && [s.tagOn, { backgroundColor: t.ink, borderColor: t.ink }]]} onPress={() => setActiveTag(tag)}>
                <Text style={[s.tagText, { color: on ? t.bg : t.ink2 }]}>{tag} · {count}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <View style={s.sectionH}>
        <Text style={[s.sectionLabel, { color: t.ink3 }]}>{activeTag === 'all' ? 'Everyone' : activeTag}</Text>
        <Text style={[s.sectionMuted, { color: t.ink3 }]}>tap to toggle</Text>
      </View>

      <View style={s.list}>
        {filtered.map(p => {
          const on = activeIds.includes(p.id);
          return (
            <TouchableOpacity
              key={p.id}
              style={[s.personRow, { backgroundColor: t.surface, borderColor: on ? ACCENT : t.border }, on && s.personOn]}
              onPress={() => onToggle(p.id)}
            >
              <View style={[s.avatar, { backgroundColor: p.color }]}>
                <Text style={s.avatarText}>{initials(p.name)}</Text>
              </View>
              <View style={s.personMeta}>
                <Text style={[s.personName, { color: t.ink }]}>{p.name}</Text>
                {p.tags.length > 0 && (
                  <Text style={[s.personTags, { color: t.ink3 }]}>{p.tags.join(' · ')}</Text>
                )}
              </View>
              <View style={[s.check, { borderColor: on ? ACCENT : t.borderStrong, backgroundColor: on ? ACCENT : 'transparent' }]}>
                {on && <Text style={{ color: ACCENT_INK, fontSize: 12 }}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
        {filtered.length === 0 && (
          <Text style={[s.emptyP, { color: t.ink2 }]}>No people yet. Add one above.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 16 },
  quickAdd: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 14 },
  addBtn: { height: 44, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontWeight: '600', fontSize: 13 },
  tagRow: { flexGrow: 0 },
  tagContent: { flexDirection: 'row', gap: 6 },
  tag: { height: 32, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  tagOn: {},
  tagText: { fontSize: 12, fontWeight: '500', textTransform: 'capitalize' },
  sectionH: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' },
  sectionMuted: { fontSize: 11 },
  list: { gap: 6 },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1 },
  personOn: {},
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '700', color: '#0f1505' },
  personMeta: { flex: 1 },
  personName: { fontSize: 14, fontWeight: '600' },
  personTags: { fontSize: 10, marginTop: 2, textTransform: 'capitalize' },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  emptyP: { fontSize: 14, textAlign: 'center', paddingVertical: 20 },
});
