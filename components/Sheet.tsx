import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  KeyboardAvoidingView, Platform, Dimensions, Animated,
  PanResponder, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type T = typeof import('@/constants/theme').light;

const SCREEN_H = Dimensions.get('window').height;
const HEIGHT_DEFAULT = SCREEN_H * 0.62;
const HEIGHT_MAX = SCREEN_H * 0.94;

export function Sheet({
  title, onClose, children, footer, t,
}: {
  title: string; onClose: () => void;
  children: React.ReactNode; footer?: React.ReactNode; t: T;
}) {
  const insets = useSafeAreaInsets();
  const height = useRef(new Animated.Value(0)).current;
  const currentHeight = useRef(HEIGHT_DEFAULT);

  useEffect(() => {
    Animated.spring(height, { toValue: HEIGHT_DEFAULT, useNativeDriver: false, damping: 22, stiffness: 260 }).start();
    currentHeight.current = HEIGHT_DEFAULT;
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        (height as any).stopAnimation((val: number) => { currentHeight.current = val; });
        height.setOffset(currentHeight.current);
        height.setValue(0);
      },
      onPanResponderMove: (_, g) => {
        height.setValue(-g.dy);
      },
      onPanResponderRelease: (_, g) => {
        height.flattenOffset();
        (height as any).stopAnimation((val: number) => {
          currentHeight.current = val;
          const midpoint = (HEIGHT_DEFAULT + HEIGHT_MAX) / 2;
          if (g.vy > 1.5 || val < HEIGHT_DEFAULT * 0.6) {
            onClose();
          } else if (val > midpoint || g.vy < -1.5) {
            Animated.spring(height, { toValue: HEIGHT_MAX, useNativeDriver: false, damping: 22, stiffness: 260 }).start();
            currentHeight.current = HEIGHT_MAX;
          } else {
            Animated.spring(height, { toValue: HEIGHT_DEFAULT, useNativeDriver: false, damping: 22, stiffness: 260 }).start();
            currentHeight.current = HEIGHT_DEFAULT;
          }
        });
      },
    })
  ).current;

  return (
    <Modal visible transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />

        <Animated.View style={[s.sheet, { backgroundColor: t.bg, paddingBottom: insets.bottom, height }]}>
          <View style={s.handle} {...panResponder.panHandlers}>
            <View style={[s.grab, { backgroundColor: t.borderStrong }]} />
            <View style={s.sheetH}>
              <Text style={[s.sheetTitle, { color: t.ink }]}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={[s.closeBtn, { backgroundColor: t.surface2 }]}>
                <Text style={{ color: t.ink, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={s.body}
            contentContainerStyle={s.bodyContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>

          {footer && (
            <View style={[s.footer, { borderTopColor: t.border }]}>{footer}</View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  kav: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,15,15,0.45)' },
  backdrop: { flex: 1 },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handle: { paddingBottom: 4 },
  grab: { width: 36, height: 4, borderRadius: 4, alignSelf: 'center', marginTop: 8 },
  sheetH: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  bodyContent: { padding: 16, paddingTop: 8 },
  footer: { padding: 16, borderTopWidth: 1 },
});
