import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Sheet } from './Sheet';
import { ACCENT, ACCENT_INK } from '@/constants/theme';

type T = typeof import('@/constants/theme').light;

const SUGGESTIONS = ['Dinner', 'Brunch', 'Bar night', 'Groceries', 'Trip', 'Lunch'];

export function NewBillSheet({
  onConfirm, onClose, willArchive, currentTitle, t,
}: {
  onConfirm: (title: string) => void; onClose: () => void;
  willArchive: boolean; currentTitle: string; t: T;
}) {
  const [title, setTitle] = useState('');

  return (
    <Sheet
      title="Start a new bill"
      onClose={onClose}
      t={t}
      footer={
        <View style={s.row}>
          <TouchableOpacity style={[s.ghostBtn, { backgroundColor: t.surface2 }]} onPress={onClose}>
            <Text style={[s.ghostText, { color: t.ink }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.primaryBtn, { backgroundColor: ACCENT }]} onPress={() => onConfirm(title.trim() || 'New bill')}>
            <Text style={[s.primaryText, { color: ACCENT_INK }]}>{willArchive ? 'Archive & start' : 'Start fresh'}</Text>
          </TouchableOpacity>
        </View>
      }
    >
      {willArchive && (
        <View style={[s.banner, { backgroundColor: 'rgba(200,255,62,0.14)', borderColor: 'rgba(200,255,62,0.28)' }]}>
          <Text style={[s.bannerText, { color: t.ink }]}>
            <Text style={{ fontWeight: '700' }}>"{currentTitle}"</Text> will be saved to your archive.
          </Text>
        </View>
      )}

      <View style={s.field}>
        <Text style={[s.label, { color: t.ink3 }]}>Name this bill</Text>
        <TextInput
          style={[s.input, { backgroundColor: t.surface, borderColor: t.border, color: t.ink }]}
          placeholder="e.g. Saturday · Dinner"
          placeholderTextColor={t.ink3}
          value={title}
          onChangeText={setTitle}
          autoFocus
          onSubmitEditing={() => onConfirm(title.trim() || 'New bill')}
          returnKeyType="done"
        />
      </View>

      <View style={s.section}>
        <Text style={[s.sectionLabel, { color: t.ink3 }]}>Quick</Text>
        <View style={s.suggestions}>
          {SUGGESTIONS.map(s2 => (
            <TouchableOpacity key={s2} style={[s.suggestion, { backgroundColor: t.surface, borderColor: t.border }]} onPress={() => setTitle(s2)}>
              <Text style={[s.suggestionText, { color: t.ink }]}>{s2}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  ghostBtn: { height: 44, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ghostText: { fontSize: 14, fontWeight: '600' },
  primaryBtn: { flex: 1, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontSize: 15, fontWeight: '700' },
  banner: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  bannerText: { fontSize: 13, flex: 1 },
  field: { gap: 6, marginTop: 8 },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 16 },
  section: { marginTop: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  suggestion: { height: 32, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  suggestionText: { fontSize: 12, fontWeight: '500' },
});
