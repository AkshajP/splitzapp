import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { initials, ACCENT, ACCENT_INK } from "@/constants/theme";
import type { Person } from "@/store/useStore";

type T = typeof import("@/constants/theme").light;

export function PeopleScreen({
  people,
  activeIds,
  onToggle,
  onAdd,
  onUpdateTags,
  onDelete,
  t,
}: {
  people: Person[];
  activeIds: string[];
  onToggle: (id: string) => void;
  onAdd: (name: string) => void;
  onUpdateTags: (id: string, tags: string[]) => void;
  onDelete: (ids: string[]) => void;
  t: T;
}) {
  const [name, setName] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewTagModal, setShowNewTagModal] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allTags = [...new Set(people.flatMap((p) => p.tags))];

  const submit = () => {
    if (name.trim()) {
      onAdd(name);
      setName("");
    }
  };

  const filtered =
    activeTag === "all"
      ? people
      : people.filter((p) => p.tags.includes(activeTag));

  const enterSelect = (id: string) => {
    setSelecting(true);
    setSelected(new Set([id]));
    setExpandedId(null);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      if (next.size === 0) setSelecting(false);
      return next;
    });
  };

  const cancelSelect = () => {
    setSelecting(false);
    setSelected(new Set());
  };

  const confirmDelete = () => {
    onDelete(Array.from(selected));
    cancelSelect();
  };

  const toggleTag = (person: Person, tag: string) => {
    if (person.tags.includes(tag)) {
      onUpdateTags(
        person.id,
        person.tags.filter((t2) => t2 !== tag),
      );
    } else {
      onUpdateTags(person.id, [...person.tags, tag]);
    }
  };

  // Creates the tag globally — no auto-association. It will appear in allTags
  // once at least one person is associated via the # panel.
  // To make it immediately visible we store extra "global" tags separately,
  // but since tags live on people we just leave it: the modal flow is the
  // entry point and the user then associates via #.
  // Simpler: after creating a tag we don't need to track it globally —
  // the user hits # and taps it to associate. So confirming modal just closes.
  // BUT — we need the tag to appear in allTags before anyone has it, so we
  // store a pending "global tags" list.
  // Actually the cleanest approach: when user creates a tag from the top,
  // we need somewhere to store it. The store's people don't have it yet.
  // Solution: keep a local `extraTags` state that holds tags not yet on anyone.
  // allTags merges people tags + extraTags.

  const [extraTags, setExtraTags] = useState<string[]>([]);
  const allTagsMerged = [
    ...new Set([...people.flatMap((p) => p.tags), ...extraTags]),
  ];

  const confirmNewTag = () => {
    const tag = newTagInput.trim().toLowerCase();
    if (tag && !allTagsMerged.includes(tag)) {
      setExtraTags((prev) => [...prev, tag]);
    }
    setShowNewTagModal(false);
    setNewTagInput("");
  };

  return (
    <>
      <ScrollView style={s.root} contentContainerStyle={s.content}>
        <View style={s.quickAdd}>
          <TextInput
            style={[
              s.input,
              {
                backgroundColor: t.surface,
                borderColor: t.border,
                color: t.ink,
              },
            ]}
            placeholder="Enter a name to add person"
            placeholderTextColor={t.ink3}
            value={name}
            onChangeText={setName}
            onSubmitEditing={submit}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[
              s.addBtn,
              { backgroundColor: t.ink, opacity: name.trim() ? 1 : 0.4 },
            ]}
            onPress={submit}
            disabled={!name.trim()}
          >
            <Text style={[s.addBtnText, { color: t.bg }]}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Tag filter row — always shown, dashed pill always at the end */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.tagRow}
          contentContainerStyle={s.tagContent}
        >
          <TouchableOpacity
            style={[
              s.tag,
              { borderColor: t.border, backgroundColor: t.surface },
              activeTag === "all" && {
                backgroundColor: t.ink,
                borderColor: t.ink,
              },
            ]}
            onPress={() => setActiveTag("all")}
          >
            <Text
              style={[
                s.tagText,
                { color: activeTag === "all" ? t.bg : t.ink2 },
              ]}
            >
              All · {people.length}
            </Text>
          </TouchableOpacity>
          {allTagsMerged.map((tag) => {
            const count = people.filter((p) => p.tags.includes(tag)).length;
            const on = activeTag === tag;
            return (
              <TouchableOpacity
                key={tag}
                style={[
                  s.tag,
                  { borderColor: t.border, backgroundColor: t.surface },
                  on && { backgroundColor: t.ink, borderColor: t.ink },
                ]}
                onPress={() => setActiveTag(tag)}
              >
                <Text style={[s.tagText, { color: on ? t.bg : t.ink2 }]}>
                  {tag} · {count}
                </Text>
              </TouchableOpacity>
            );
          })}
          {/* Dashed pill to create a new tag */}
          <TouchableOpacity
            style={[s.tag, s.tagDashed, { borderColor: t.ink3 }]}
            onPress={() => {
              setShowNewTagModal(true);
              setNewTagInput("");
            }}
          >
            <Text style={[s.tagText, { color: t.ink3 }]}>+ tag</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={s.sectionH}>
          <Text style={[s.sectionLabel, { color: t.ink3 }]}>
            {activeTag === "all" ? "Everyone" : activeTag}
          </Text>
          {selecting ? (
            <View style={s.deleteRow}>
              <TouchableOpacity
                onPress={cancelSelect}
                style={[s.deleteBtn, { borderColor: t.border }]}
              >
                <Text style={[s.deleteBtnText, { color: t.ink2 }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDelete}
                style={[
                  s.deleteBtn,
                  s.deleteBtnRed,
                  { opacity: selected.size > 0 ? 1 : 0.35 },
                ]}
                disabled={selected.size === 0}
              >
                <Text style={s.deleteBtnTextRed}>
                  Delete {selected.size > 0 ? `(${selected.size})` : ""}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={[s.sectionMuted, { color: t.ink3 }]}>
              tap to toggle · hold to delete
            </Text>
          )}
        </View>

        <View style={s.list}>
          {filtered.map((p) => {
            const on = activeIds.includes(p.id);
            const expanded = expandedId === p.id;
            const isSelected = selected.has(p.id);
            return (
              <View
                key={p.id}
                style={[
                  s.card,
                  {
                    backgroundColor: t.surface,
                    borderColor: selecting
                      ? isSelected
                        ? "#EF4444"
                        : t.border
                      : on
                        ? ACCENT
                        : t.border,
                  },
                ]}
              >
                {/* Main row */}
                <View style={s.personRow}>
                  <TouchableOpacity
                    style={s.personTouchable}
                    onPress={() =>
                      selecting ? toggleSelect(p.id) : onToggle(p.id)
                    }
                    onLongPress={() => !selecting && enterSelect(p.id)}
                    delayLongPress={400}
                  >
                    <View
                      style={[
                        s.avatar,
                        {
                          backgroundColor: selecting
                            ? isSelected
                              ? "#EF4444"
                              : t.surface2
                            : p.color,
                        },
                      ]}
                    >
                      {selecting ? (
                        <Text
                          style={[
                            s.avatarText,
                            { color: isSelected ? "#fff" : t.ink3 },
                          ]}
                        >
                          {isSelected ? "✓" : initials(p.name)}
                        </Text>
                      ) : (
                        <Text style={s.avatarText}>{initials(p.name)}</Text>
                      )}
                    </View>
                    <View style={s.personMeta}>
                      <Text style={[s.personName, { color: t.ink }]}>
                        {p.name}
                      </Text>
                      {p.tags.length > 0 && (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={s.inlineTagScroll}
                          contentContainerStyle={s.inlineTagContent}
                        >
                          {p.tags.map((tag) => (
                            <View
                              key={tag}
                              style={[
                                s.inlinePill,
                                {
                                  backgroundColor: t.surface2,
                                  borderColor: t.border,
                                },
                              ]}
                            >
                              <Text
                                style={[s.inlinePillText, { color: t.ink3 }]}
                              >
                                {tag}
                              </Text>
                            </View>
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  </TouchableOpacity>
                  {!selecting && (
                    <TouchableOpacity
                      style={[
                        s.hashBtn,
                        {
                          borderColor: expanded ? t.ink : t.border,
                          backgroundColor: expanded ? t.ink : "transparent",
                        },
                      ]}
                      onPress={() => setExpandedId(expanded ? null : p.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text
                        style={[
                          s.hashText,
                          { color: expanded ? t.bg : t.ink3 },
                        ]}
                      >
                        #
                      </Text>
                    </TouchableOpacity>
                  )}
                  {!selecting && (
                    <View
                      style={[
                        s.check,
                        {
                          borderColor: on ? ACCENT : t.borderStrong,
                          backgroundColor: on ? ACCENT : "transparent",
                        },
                      ]}
                    >
                      {on && (
                        <Text style={{ color: ACCENT_INK, fontSize: 12 }}>
                          ✓
                        </Text>
                      )}
                    </View>
                  )}
                </View>

                {/* Tag association panel — toggle only, no create */}
                {expanded && (
                  <View style={[s.tagPanel, { borderTopColor: t.border }]}>
                    {allTagsMerged.length > 0 ? (
                      <View style={s.tagPills}>
                        {allTagsMerged.map((tag) => {
                          const has = p.tags.includes(tag);
                          return (
                            <TouchableOpacity
                              key={tag}
                              style={[
                                s.tagPill,
                                has
                                  ? {
                                      backgroundColor: t.ink,
                                      borderColor: t.ink,
                                    }
                                  : {
                                      backgroundColor: "transparent",
                                      borderColor: t.borderStrong,
                                    },
                              ]}
                              onPress={() => toggleTag(p, tag)}
                            >
                              <Text
                                style={[
                                  s.tagPillText,
                                  { color: has ? t.bg : t.ink2 },
                                ]}
                              >
                                {tag}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ) : (
                      <Text style={[s.hint, { color: t.ink3 }]}>
                        No tags yet — create one with + tag above
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
          {filtered.length === 0 && (
            <>
              <Text style={[s.emptyP, { color: t.ink2 }]}>
                No people to select.
              </Text>
              <Text style={[s.emptyP, { color: t.ink2 }]}>
                You can add people and group them with custom tags.
              </Text>
            </>
          )}
        </View>
      </ScrollView>

      {/* New tag modal */}
      <Modal
        visible={showNewTagModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewTagModal(false)}
      >
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity
            style={s.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowNewTagModal(false)}
          />
          <View
            style={[
              s.modalBox,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <Text style={[s.modalTitle, { color: t.ink }]}>New tag</Text>
            <TextInput
              style={[
                s.modalInput,
                { backgroundColor: t.bg, borderColor: t.border, color: t.ink },
              ]}
              placeholder="e.g. work, cousins, gym…"
              placeholderTextColor={t.ink3}
              value={newTagInput}
              onChangeText={setNewTagInput}
              onSubmitEditing={confirmNewTag}
              returnKeyType="done"
              autoFocus
              autoCapitalize="none"
            />
            <View style={s.modalActions}>
              <TouchableOpacity
                style={[s.modalCancel, { borderColor: t.border }]}
                onPress={() => setShowNewTagModal(false)}
              >
                <Text style={[s.modalCancelText, { color: t.ink2 }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  s.modalConfirm,
                  {
                    backgroundColor: t.ink,
                    opacity: newTagInput.trim() ? 1 : 0.35,
                  },
                ]}
                onPress={confirmNewTag}
                disabled={!newTagInput.trim()}
              >
                <Text style={[s.modalConfirmText, { color: t.bg }]}>
                  Create tag
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 16 },

  quickAdd: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  addBtn: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { fontWeight: "600", fontSize: 13 },

  tagRow: { flexGrow: 0 },
  tagContent: { flexDirection: "row", gap: 6 },
  tag: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tagDashed: { borderStyle: "dashed" },
  tagText: { fontSize: 12, fontWeight: "500", textTransform: "capitalize" },

  sectionH: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  sectionMuted: { fontSize: 11 },
  deleteRow: { flexDirection: "row", gap: 6 },
  deleteBtn: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: { fontSize: 12, fontWeight: "500" },
  deleteBtnRed: { backgroundColor: "#EF4444", borderColor: "#EF4444" },
  deleteBtnTextRed: { fontSize: 12, fontWeight: "600", color: "#fff" },

  list: { gap: 6 },
  card: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },

  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 14,
    paddingVertical: 10,
  },
  personTouchable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingLeft: 14,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 12, fontWeight: "700", color: "#0f1505" },
  personMeta: { flex: 1, minWidth: 0 },
  personName: { fontSize: 14, fontWeight: "600" },

  inlineTagScroll: { marginTop: 3, flexGrow: 0 },
  inlineTagContent: { flexDirection: "row", gap: 4 },
  inlinePill: {
    height: 18,
    paddingHorizontal: 7,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  inlinePillText: { fontSize: 10, textTransform: "capitalize" },

  hashBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hashText: { fontSize: 12, fontWeight: "600" },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },

  tagPanel: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  tagPills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tagPill: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tagPillText: { fontSize: 12, textTransform: "capitalize", fontWeight: "500" },
  hint: { fontSize: 11, fontStyle: "italic" },

  emptyP: { fontSize: 14, textAlign: "center", paddingVertical: 20 },

  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalBox: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 14,
  },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  modalInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  modalActions: { flexDirection: "row", gap: 10 },
  modalCancel: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: { fontSize: 14, fontWeight: "500" },
  modalConfirm: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: { fontSize: 14, fontWeight: "600" },
});
