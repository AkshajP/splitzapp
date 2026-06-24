import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { CURRENCY, ACCENT, ACCENT_INK, fmt, initials } from "@/constants/theme";
import type { Person } from "@/store/useStore";

type T = typeof import("@/constants/theme").light;
type Totals = ReturnType<typeof import("@/store/useStore").computeTotals>;

export function SummaryScreen({
  totals,
  activePeople,
  tax,
  taxType,
  service,
  serviceType,
  discount,
  discountType,
  onChangeTax,
  onChangeTaxType,
  onChangeService,
  onChangeServiceType,
  onChangeDiscount,
  onChangeDiscountType,
  onShare,
  t,
}: {
  totals: Totals;
  activePeople: Person[];
  tax: number;
  taxType: "amount" | "pct";
  service: number;
  serviceType: "amount" | "pct";
  discount: number;
  discountType: "amount" | "pct";
  onChangeTax: (v: number) => void;
  onChangeTaxType: (v: "amount" | "pct") => void;
  onChangeService: (v: number) => void;
  onChangeServiceType: (v: "amount" | "pct") => void;
  onChangeDiscount: (v: number) => void;
  onChangeDiscountType: (v: "amount" | "pct") => void;
  onShare: () => void;
  t: T;
}) {
  const taxLabel =
    taxType === "pct" ? `Tax · ${tax}%` : `Tax · ${CURRENCY}${fmt(tax)}`;
  const serviceLabel =
    serviceType === "pct"
      ? `Service · ${service}%`
      : `Service · ${CURRENCY}${fmt(service)}`;
  const discountLabel =
    discountType === "pct"
      ? `Discount · ${discount}%`
      : `Discount · ${CURRENCY}${fmt(discount)}`;

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={[s.content, { gap: 12, paddingBottom: 32 }]}
    >
      <View
        style={[s.card, { backgroundColor: t.surface, borderColor: t.border }]}
      >
        <Text style={[s.cardH, { color: t.ink3 }]}>Charges</Text>
        <ChargeRow
          label="Tax"
          value={tax}
          onChange={onChangeTax}
          chargeType={taxType}
          onChangeChargeType={onChangeTaxType}
          t={t}
        />
        <View style={[s.divider, { backgroundColor: t.border }]} />
        <ChargeRow
          label="Service"
          value={service}
          onChange={onChangeService}
          chargeType={serviceType}
          onChangeChargeType={onChangeServiceType}
          t={t}
        />
        <View style={[s.divider, { backgroundColor: t.border }]} />
        <ChargeRow
          label="Discount"
          value={discount}
          onChange={onChangeDiscount}
          chargeType={discountType}
          onChangeChargeType={onChangeDiscountType}
          t={t}
        />
      </View>

      <View
        style={[s.card, { backgroundColor: t.surface, borderColor: t.border }]}
      >
        <Text style={[s.cardH, { color: t.ink3 }]}>Bill</Text>
        <BillLine
          label="Subtotal"
          value={`${CURRENCY}${fmt(totals.subtotal)}`}
          t={t}
        />
        <BillLine
          label={taxLabel}
          value={`+ ${CURRENCY}${fmt(totals.taxAmt)}`}
          t={t}
        />
        <BillLine
          label={serviceLabel}
          value={`+ ${CURRENCY}${fmt(totals.serviceAmt)}`}
          t={t}
        />
        {discount > 0 && (
          <BillLine
            label={discountLabel}
            value={`− ${CURRENCY}${fmt(totals.discountAmt)}`}
            neg
            t={t}
          />
        )}
        <BillLine
          label="Total"
          value={`${CURRENCY}${fmt(totals.grand)}`}
          total
          t={t}
        />
      </View>

      <View
        style={[s.card, { backgroundColor: t.surface, borderColor: t.border }]}
      >
        <Text style={[s.cardH, { color: t.ink3 }]}>Each person owes</Text>
        {activePeople.length === 0 && (
          <Text style={[s.emptyP, { color: t.ink2 }]}>Add people first</Text>
        )}
        {activePeople.map((p) => {
          const pp = totals.perPerson[p.id] || { share: 0, items: 0 };
          return (
            <View key={p.id} style={s.oweRow}>
              <View style={[s.avatar, { backgroundColor: p.color }]}>
                <Text style={s.avatarText}>{initials(p.name)}</Text>
              </View>
              <View style={s.oweInfo}>
                <Text style={[s.oweName, { color: t.ink }]}>{p.name}</Text>
                <Text style={[s.oweSub, { color: t.ink3 }]}>
                  items {CURRENCY}
                  {fmt(pp.items)}
                </Text>
              </View>
              <Text style={[s.oweAmt, { color: t.ink }]}>
                {CURRENCY}
                {fmt(pp.share)}
              </Text>
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        style={[
          s.primaryBtn,
          {
            backgroundColor: ACCENT,
            opacity: activePeople.length === 0 ? 0.5 : 1,
          },
        ]}
        onPress={onShare}
        disabled={activePeople.length === 0}
      >
        <Text style={[s.primaryBtnText, { color: ACCENT_INK }]}>
          Share split
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function ChargeRow({
  label,
  value,
  onChange,
  chargeType,
  onChangeChargeType,
  t,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  chargeType: "amount" | "pct";
  onChangeChargeType: (v: "amount" | "pct") => void;
  t: T;
}) {
  const [text, setText] = useState(String(value));
  const activeSuffix = chargeType === "pct" ? "%" : undefined;
  const activePrefix = chargeType === "amount" ? CURRENCY : undefined;

  useEffect(() => {
    if (text === String(value)) return;
    const parsed = parseFloat(text);
    if (
      (!Number.isNaN(parsed) && parsed === value && text.includes(".")) ||
      text === "."
    )
      return;
    setText(String(value));
  }, [value, text]);

  const handleChangeText = (v: string) => {
    const filtered = v.replace(/[^0-9.]/g, "");
    const parts = filtered.split(".");
    const normalized =
      parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : filtered;
    setText(normalized);

    const parsed = parseFloat(normalized);
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    } else if (normalized === "") {
      onChange(0);
    }
  };

  return (
    <View style={s.chargeRow}>
      <Text style={[s.chargeLabel, { color: t.ink }]}>{label}</Text>
      <View style={s.chargeRight}>
        <TouchableOpacity
          style={[s.zeroBtn, { backgroundColor: t.surface2 }]}
          onPress={() => onChange(0)}
        >
          <Text style={[s.zeroBtnText, { color: t.ink3 }]}>0</Text>
        </TouchableOpacity>
        <View style={[s.discountToggle, { backgroundColor: t.surface2 }]}>
          <TouchableOpacity
            style={[
              s.toggleTab,
              chargeType === "amount" && { backgroundColor: ACCENT },
            ]}
            onPress={() => onChangeChargeType("amount")}
          >
            <Text
              style={[
                s.toggleTabText,
                { color: chargeType === "amount" ? ACCENT_INK : t.ink3 },
              ]}
            >
              {CURRENCY}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              s.toggleTab,
              chargeType === "pct" && { backgroundColor: ACCENT },
            ]}
            onPress={() => onChangeChargeType("pct")}
          >
            <Text
              style={[
                s.toggleTabText,
                { color: chargeType === "pct" ? ACCENT_INK : t.ink3 },
              ]}
            >
              %
            </Text>
          </TouchableOpacity>
        </View>
        <View style={[s.chargeInput, { backgroundColor: t.surface2 }]}>
          {activePrefix && (
            <Text style={[s.affix, { color: t.ink2 }]}>{activePrefix}</Text>
          )}
          <TextInput
            style={[s.chargeInputText, { color: t.ink }]}
            keyboardType="decimal-pad"
            value={text}
            onChangeText={handleChangeText}
            selectTextOnFocus
          />
          {activeSuffix && (
            <Text style={[s.affix, { color: t.ink2 }]}>{activeSuffix}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

function BillLine({
  label,
  value,
  neg,
  total,
  t,
}: {
  label: string;
  value: string;
  neg?: boolean;
  total?: boolean;
  t: T;
}) {
  return (
    <View style={[s.billLine, total && s.billTotal]}>
      <Text
        style={[
          s.billLabel,
          { color: total ? t.ink : t.ink2 },
          total && s.billTotalLabel,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          s.billValue,
          { color: neg ? t.neg : t.ink },
          total && s.billTotalValue,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14 },
  cardH: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  divider: { height: 1, marginVertical: 0 },
  chargeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  chargeRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  chargeLabel: { fontSize: 14, fontWeight: "500" },
  chargeInput: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  chargeInputText: {
    width: 60,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },
  affix: { fontSize: 13 },
  zeroBtn: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  zeroBtnText: { fontSize: 16, fontWeight: "600" },
  discountToggle: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 2,
    gap: 2,
    alignItems: "center",
  },
  toggleTab: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleTabText: { fontSize: 15, fontWeight: "600" },
  billLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  billTotal: { borderTopWidth: 1, marginTop: 6, paddingTop: 12 },
  billLabel: { fontSize: 14 },
  billTotalLabel: { fontSize: 16, fontWeight: "700" },
  billValue: { fontSize: 14, fontWeight: "600" },
  billTotalValue: { fontSize: 18, fontWeight: "700" },
  oweRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 12, fontWeight: "700", color: "#0f1505" },
  oweInfo: { flex: 1 },
  oweName: { fontSize: 14, fontWeight: "600" },
  oweSub: { fontSize: 11, marginTop: 2 },
  oweAmt: { fontSize: 16, fontWeight: "700" },
  emptyP: { fontSize: 14, textAlign: "center", paddingVertical: 8 },
  primaryBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { fontSize: 15, fontWeight: "700" },
});
