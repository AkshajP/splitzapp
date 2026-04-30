import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Sheet } from "./Sheet";
import { ACCENT, ACCENT_INK, autoTitle } from "@/constants/theme";

type T = typeof import("@/constants/theme").light;

export function NewBillSheet({
  onConfirm,
  onClose,
  willArchive,
  currentTitle,
  t,
}: {
  onConfirm: (archiveTitle?: string) => void;
  onClose: () => void;
  willArchive: boolean;
  currentTitle: string;
  t: T;
}) {
  const [editedTitle, setEditedTitle] = useState(currentTitle);

  return (
    <Sheet
      title="Start a new bill"
      onClose={onClose}
      t={t}
      footer={
        <View style={s.row}>
          <TouchableOpacity
            style={[s.ghostBtn, { backgroundColor: t.surface2 }]}
            onPress={onClose}
          >
            <Text style={[s.ghostText, { color: t.ink }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.primaryBtn, { backgroundColor: ACCENT }]}
            onPress={() => onConfirm(willArchive ? editedTitle : undefined)}
          >
            <Text style={[s.primaryText, { color: ACCENT_INK }]}>
              {willArchive ? "Archive & start" : "Start fresh"}
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      {willArchive ? (
        <View style={s.archiveSection}>
          <Text style={[s.fieldLabel, { color: t.ink3 }]}>Bill name</Text>
          <TextInput
            style={[s.titleInput, { backgroundColor: t.surface, borderColor: t.border, color: t.ink }]}
            value={editedTitle}
            onChangeText={setEditedTitle}
            onSubmitEditing={() => onConfirm(editedTitle)}
            returnKeyType="done"
            selectTextOnFocus
          />
          <Text style={[s.hint, { color: t.ink3 }]}>This bill will be saved to your archive.</Text>
        </View>
      ) : (
        <View style={s.titlePreview}>
          <Text style={[s.titleLabel, { color: t.ink3 }]}>Bill Title:</Text>
          <Text style={[s.titleValue, { color: t.ink }]}>{autoTitle()}</Text>
          <Text style={[{ color: t.ink3 }]}>
            Title is set based on time when first item is added
          </Text>
        </View>
      )}
    </Sheet>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  ghostBtn: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostText: { fontSize: 14, fontWeight: "600" },
  primaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { fontSize: 15, fontWeight: "700" },
  archiveSection: { gap: 8, paddingVertical: 4 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  titleInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 20,
    fontWeight: "700",
  },
  hint: { fontSize: 12 },
  titlePreview: { gap: 8, paddingVertical: 8 },
  titleLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  titleValue: { fontSize: 28, fontWeight: "700", letterSpacing: -0.5 },
});
