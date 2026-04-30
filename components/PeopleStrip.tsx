import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { initials } from "@/constants/theme";
import type { Person } from "@/store/useStore";

type T = typeof import("@/constants/theme").light;

export function PeopleStrip({
  people,
  activeIds,
  onPick,
  t,
}: {
  people: Person[];
  activeIds: string[];
  onPick: () => void;
  t: T;
}) {
  const active = activeIds
    .map((id) => people.find((p) => p.id === id)!)
    .filter(Boolean);
  return (
    <View style={[s.strip, { borderBottomColor: t.border }]}>
      <TouchableOpacity
        style={[s.addBtn, { borderColor: t.borderStrong }]}
        onPress={onPick}
      >
        <Text style={{ fontSize: 22, color: t.ink2, lineHeight: 24 }}>+</Text>
      </TouchableOpacity>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
      >
        {active.length === 0 && (
          <Text style={[s.empty, { color: t.ink3 }]}>
            Tap + to add people to the bill
          </Text>
        )}
        {active.map((p) => (
          <View
            key={p.id}
            style={[
              s.chip,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <View style={[s.avatar, { backgroundColor: p.color }]}>
              <Text style={s.avatarText}>{initials(p.name)}</Text>
            </View>
            <Text style={[s.chipName, { color: t.ink }]}>{p.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  strip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  scroll: { flex: 1 },
  scrollContent: { flexDirection: "row", gap: 8, alignItems: "center" },
  empty: { fontSize: 13, paddingHorizontal: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 6,
    paddingRight: 12,
    borderRadius: 30,
    borderWidth: 1,
    height: 44,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 12, fontWeight: "700", color: "#0f1505" },
  chipName: { fontSize: 13, fontWeight: "500" },
});
