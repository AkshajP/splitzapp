import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Share } from "react-native";
import { Sheet } from "./Sheet";
import { CURRENCY, ACCENT, ACCENT_INK, fmt, initials } from "@/constants/theme";
import type { ArchivedBill } from "@/store/useStore";

type T = typeof import("@/constants/theme").light;

export function ArchivedBillSheet({
  bill,
  onClose,
  onToast,
  t,
}: {
  bill: ArchivedBill;
  onClose: () => void;
  onToast: (msg: string) => void;
  t: T;
}) {
  const buildText = () => {
    const lines: string[] = [];
    lines.push(`💸  ${bill.title}`);
    lines.push(`    ${bill.date}`);
    lines.push("─────────────────");
    bill.perPerson.forEach((p) => {
      lines.push(`${p.name.padEnd(12, " ")}${CURRENCY}${fmt(p.share)}`);
    });
    lines.push("─────────────────");
    lines.push(`${"Total".padEnd(12, " ")}${CURRENCY}${fmt(bill.total)}`);
    return lines.join("\n");
  };

  const copy = async () => {
    try {
      await Share.share({ message: buildText() });
    } catch {}
    onToast("Shared");
  };

  return (
    <Sheet title={bill.title} onClose={onClose} t={t}>
      <Text style={[s.meta, { color: t.ink2 }]}>
        {bill.date} · {bill.peopleCount} people · {bill.items.length} items
      </Text>

      <View
        style={[
          s.card,
          { backgroundColor: t.surface, borderColor: t.border, marginTop: 14 },
        ]}
      >
        <Text style={[s.cardH, { color: t.ink3 }]}>Each person paid</Text>
        {bill.perPerson.map((p, i) => (
          <View
            key={i}
            style={[
              s.oweRow,
              i === 0 ? s.oweRowFirst : null,
              { borderTopColor: t.border },
            ]}
          >
            <View style={[s.avatar, { backgroundColor: p.color }]}>
              <Text style={s.avatarText}>{initials(p.name)}</Text>
            </View>
            <Text style={[s.oweName, { color: t.ink, flex: 1 }]}>{p.name}</Text>
            <Text style={[s.oweAmt, { color: t.ink }]}>
              {CURRENCY}
              {fmt(p.share)}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={[
          s.card,
          { backgroundColor: t.surface, borderColor: t.border, marginTop: 10 },
        ]}
      >
        <Text style={[s.cardH, { color: t.ink3 }]}>Items</Text>
        {bill.items.map((it, i) => (
          <View key={i} style={[s.line, { borderTopColor: t.border }]}>
            <Text style={[s.lineLabel, { color: t.ink2 }]}>{it.name}</Text>
            <Text style={[s.lineAmt, { color: t.ink }]}>
              {CURRENCY}
              {fmt(it.amount)}
            </Text>
          </View>
        ))}
        {(() => {
          const subtotal = bill.items.reduce((s, i) => s + i.amount, 0);
          const taxAmt =
            bill.tax != null
              ? bill.taxType === "amount"
                ? bill.tax
                : subtotal * (bill.tax / 100)
              : 0;
          const serviceAmt =
            bill.service != null
              ? bill.serviceType === "amount"
                ? bill.service
                : subtotal * (bill.service / 100)
              : 0;
          const discountAmt =
            bill.discount != null
              ? bill.discountType === "pct"
                ? subtotal * (bill.discount / 100)
                : bill.discount
              : 0;
          const hasExtras =
            taxAmt !== 0 || serviceAmt !== 0 || discountAmt !== 0;
          return (
            <>
              {hasExtras && (
                <View style={[s.line, { borderTopColor: t.border }]}>
                  <Text
                    style={[s.lineLabel, s.subtotalLabel, { color: t.ink2 }]}
                  >
                    Subtotal
                  </Text>
                  <Text style={[s.lineAmt, { color: t.ink2 }]}>
                    {CURRENCY}
                    {fmt(subtotal)}
                  </Text>
                </View>
              )}
              {taxAmt !== 0 && (
                <View style={[s.line, { borderTopColor: t.border }]}>
                  <Text style={[s.lineLabel, s.indented, { color: t.ink2 }]}>
                    Tax{bill.taxType === "pct" ? ` (${bill.tax}%)` : ""}
                  </Text>
                  <Text style={[s.lineAmt, { color: t.ink2 }]}>
                    {CURRENCY}
                    {fmt(taxAmt)}
                  </Text>
                </View>
              )}
              {serviceAmt !== 0 && (
                <View style={[s.line, { borderTopColor: t.border }]}>
                  <Text style={[s.lineLabel, s.indented, { color: t.ink2 }]}>
                    Service
                    {bill.serviceType === "pct" ? ` (${bill.service}%)` : ""}
                  </Text>
                  <Text style={[s.lineAmt, { color: t.ink2 }]}>
                    {CURRENCY}
                    {fmt(serviceAmt)}
                  </Text>
                </View>
              )}
              {discountAmt !== 0 && (
                <View style={[s.line, { borderTopColor: t.border }]}>
                  <Text style={[s.lineLabel, s.indented, { color: t.ink2 }]}>
                    Discount
                    {bill.discountType === "pct" ? ` (${bill.discount}%)` : ""}
                  </Text>
                  <Text style={[s.lineAmt, { color: "#4CAF50" }]}>
                    −{CURRENCY}
                    {fmt(discountAmt)}
                  </Text>
                </View>
              )}
            </>
          );
        })()}
        <View style={[s.lineTotal, { borderTopColor: t.border }]}>
          <Text style={[s.lineTotalLabel, { color: t.ink }]}>Total</Text>
          <Text style={[s.lineTotalAmt, { color: t.ink }]}>
            {CURRENCY}
            {fmt(bill.total)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[s.primaryBtn, { backgroundColor: ACCENT, marginTop: 14 }]}
        onPress={copy}
      >
        <Text style={[s.primaryBtnText, { color: ACCENT_INK }]}>
          Share split
        </Text>
      </TouchableOpacity>
    </Sheet>
  );
}

const s = StyleSheet.create({
  meta: { fontSize: 12, marginBottom: 4 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14 },
  cardH: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  oweRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  oweRowFirst: { borderTopWidth: 0 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 12, fontWeight: "700", color: "#0f1505" },
  oweName: { fontSize: 14, fontWeight: "600" },
  oweAmt: { fontSize: 16, fontWeight: "700" },
  line: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTopWidth: 1,
  },
  lineLabel: { fontSize: 14 },
  subtotalLabel: { fontWeight: "700" },
  indented: { paddingLeft: 16 },
  lineAmt: { fontSize: 14, fontWeight: "600" },
  lineTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    marginTop: 6,
  },
  lineTotalLabel: { fontSize: 16, fontWeight: "700" },
  lineTotalAmt: { fontSize: 18, fontWeight: "700" },
  primaryBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { fontSize: 15, fontWeight: "700" },
});
