import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Alert,
} from 'react-native';
import { Sheet } from './Sheet';
import { ACCENT, ACCENT_INK } from '@/constants/theme';

type T = typeof import('@/constants/theme').light;
type ThemeOverride = 'system' | 'light' | 'dark';

export function SettingsSheet({
  onClose,
  themeOverride,
  onChangeTheme,
  onResetData,
  t,
}: {
  onClose: () => void;
  themeOverride: ThemeOverride;
  onChangeTheme: (v: ThemeOverride) => void;
  onResetData: () => void;
  t: T;
}) {
  const handleReset = () => {
    Alert.alert(
      'Reset App Data',
      'This will clear all bills, people, and history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset', style: 'destructive',
          onPress: () => { onResetData(); onClose(); },
        },
      ],
    );
  };

  const THEME_OPTIONS: { value: ThemeOverride; label: string }[] = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  return (
    <Sheet title="Settings" onClose={onClose} t={t}>
      <View style={s.section}>
        <Text style={[s.label, { color: t.ink2 }]}>APPEARANCE</Text>
        <View style={[s.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          {THEME_OPTIONS.map((opt, i) => {
            const active = themeOverride === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  s.row,
                  i < THEME_OPTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.border },
                ]}
                onPress={() => onChangeTheme(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={[s.rowLabel, { color: t.ink }]}>{opt.label}</Text>
                <View style={[s.radio, { borderColor: active ? ACCENT : t.borderStrong }]}>
                  {active && <View style={[s.radioDot, { backgroundColor: ACCENT }]} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={s.section}>
        <Text style={[s.label, { color: t.ink2 }]}>DANGER ZONE</Text>
        <TouchableOpacity
          style={[s.resetBtn, { borderColor: '#ef4444' }]}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Text style={s.resetText}>Reset App Data</Text>
        </TouchableOpacity>
      </View>

      <View style={[s.footer, { borderTopColor: t.border }]}>
        <Text style={[s.credit, { color: t.ink3 }]}>Developed by Akshaj</Text>
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  section: { marginBottom: 24 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8, marginLeft: 2 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: { fontSize: 15 },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  resetBtn: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resetText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
  footer: { marginTop: 8, paddingTop: 20, borderTopWidth: 1, alignItems: 'center' },
  credit: { fontSize: 13 },
});
