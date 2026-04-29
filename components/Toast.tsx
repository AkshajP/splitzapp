import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function Toast({ message }: { message: string }) {
  return (
    <View style={s.toast} pointerEvents="none">
      <Text style={s.toastText}>{message}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#0f0f0f',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    zIndex: 999,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  toastText: { color: '#f5f5f0', fontSize: 13, fontWeight: '600' },
});
