import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sheet } from './Sheet';
import { ACCENT, ACCENT_INK, autoTitle } from '@/constants/theme';

type T = typeof import('@/constants/theme').light;

export function NewBillSheet({
  onConfirm, onClose, willArchive, currentTitle, t,
}: {
  onConfirm: () => void; onClose: () => void;
  willArchive: boolean; currentTitle: string; t: T;
}) {
  const [newTitle] = useState(() => autoTitle());

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
          <TouchableOpacity style={[s.primaryBtn, { backgroundColor: ACCENT }]} onPress={onConfirm}>
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

      <View style={s.titlePreview}>
        <Text style={[s.titleLabel, { color: t.ink3 }]}>New bill will be titled</Text>
        <Text style={[s.titleValue, { color: t.ink }]}>{newTitle}</Text>
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
  banner: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  bannerText: { fontSize: 13, flex: 1 },
  titlePreview: { gap: 8, paddingVertical: 8 },
  titleLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  titleValue: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
});
