import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { CURRENCY, ACCENT, ACCENT_INK, fmt, initials } from '@/constants/theme';
import type { Person } from '@/store/useStore';

type T = typeof import('@/constants/theme').light;
type Totals = ReturnType<typeof import('@/store/useStore').computeTotals>;

export function SummaryScreen({
  totals, activePeople, tax, service, discount, discountType,
  onChangeTax, onChangeService, onChangeDiscount, onChangeDiscountType, onShare, t,
}: {
  totals: Totals; activePeople: Person[];
  tax: number; service: number; discount: number; discountType: 'amount' | 'pct';
  onChangeTax: (v: number) => void; onChangeService: (v: number) => void; onChangeDiscount: (v: number) => void;
  onChangeDiscountType: (v: 'amount' | 'pct') => void;
  onShare: () => void; t: T;
}) {
  return (
    <ScrollView style={s.root} contentContainerStyle={[s.content, { gap: 12, paddingBottom: 32 }]}>
      <View style={[s.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Text style={[s.cardH, { color: t.ink3 }]}>Charges</Text>
        <ChargeRow label="Tax" value={tax} onChange={onChangeTax} suffix="%" t={t} />
        <View style={[s.divider, { backgroundColor: t.border }]} />
        <ChargeRow label="Service" value={service} onChange={onChangeService} suffix="%" t={t} />
        <View style={[s.divider, { backgroundColor: t.border }]} />
        <ChargeRow label="Discount" value={discount} onChange={onChangeDiscount}
          discountType={discountType} onChangeDiscountType={onChangeDiscountType} t={t} />
      </View>

      <View style={[s.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Text style={[s.cardH, { color: t.ink3 }]}>Bill</Text>
        <BillLine label="Subtotal" value={`${CURRENCY}${fmt(totals.subtotal)}`} t={t} />
        <BillLine label={`Tax · ${tax}%`} value={`+ ${CURRENCY}${fmt(totals.taxAmt)}`} t={t} />
        <BillLine label={`Service · ${service}%`} value={`+ ${CURRENCY}${fmt(totals.serviceAmt)}`} t={t} />
        {discount > 0 && <BillLine label={`Discount · ${discountType === 'pct' ? `${discount}%` : `${CURRENCY}${fmt(discount)}`}`} value={`− ${CURRENCY}${fmt(totals.discountAmt)}`} neg t={t} />}
        <BillLine label="Total" value={`${CURRENCY}${fmt(totals.grand)}`} total t={t} />
      </View>

      <View style={[s.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Text style={[s.cardH, { color: t.ink3 }]}>Each person owes</Text>
        {activePeople.length === 0 && <Text style={[s.emptyP, { color: t.ink2 }]}>Add people first</Text>}
        {activePeople.map(p => {
          const pp = totals.perPerson[p.id] || { share: 0, items: 0 };
          return (
            <View key={p.id} style={s.oweRow}>
              <View style={[s.avatar, { backgroundColor: p.color }]}>
                <Text style={s.avatarText}>{initials(p.name)}</Text>
              </View>
              <View style={s.oweInfo}>
                <Text style={[s.oweName, { color: t.ink }]}>{p.name}</Text>
                <Text style={[s.oweSub, { color: t.ink3 }]}>items {CURRENCY}{fmt(pp.items)}</Text>
              </View>
              <Text style={[s.oweAmt, { color: t.ink }]}>{CURRENCY}{fmt(pp.share)}</Text>
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        style={[s.primaryBtn, { backgroundColor: ACCENT, opacity: activePeople.length === 0 ? 0.5 : 1 }]}
        onPress={onShare}
        disabled={activePeople.length === 0}
      >
        <Text style={[s.primaryBtnText, { color: ACCENT_INK }]}>Share split</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function ChargeRow({ label, value, onChange, suffix, prefix, discountType, onChangeDiscountType, t }: {
  label: string; value: number; onChange: (v: number) => void;
  suffix?: string; prefix?: string;
  discountType?: 'amount' | 'pct'; onChangeDiscountType?: (v: 'amount' | 'pct') => void;
  t: T;
}) {
  const isDiscount = discountType !== undefined;
  const activeSuffix = isDiscount ? (discountType === 'pct' ? '%' : undefined) : suffix;
  const activePrefix = isDiscount ? (discountType === 'amount' ? CURRENCY : undefined) : prefix;

  return (
    <View style={s.chargeRow}>
      <Text style={[s.chargeLabel, { color: t.ink }]}>{label}</Text>
      <View style={s.chargeRight}>
        {isDiscount && (
          <View style={[s.discountToggle, { backgroundColor: t.surface2 }]}>
            <TouchableOpacity
              style={[s.toggleTab, discountType === 'amount' && { backgroundColor: ACCENT }]}
              onPress={() => onChangeDiscountType?.('amount')}
            >
              <Text style={[s.toggleTabText, { color: discountType === 'amount' ? ACCENT_INK : t.ink3 }]}>{CURRENCY}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.toggleTab, discountType === 'pct' && { backgroundColor: ACCENT }]}
              onPress={() => onChangeDiscountType?.('pct')}
            >
              <Text style={[s.toggleTabText, { color: discountType === 'pct' ? ACCENT_INK : t.ink3 }]}>%</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={[s.chargeInput, { backgroundColor: t.surface2 }]}>
          {activePrefix && <Text style={[s.affix, { color: t.ink2 }]}>{activePrefix}</Text>}
          <TextInput
            style={[s.chargeInputText, { color: t.ink }]}
            keyboardType="decimal-pad"
            value={String(value)}
            onChangeText={(v) => onChange(parseFloat(v) || 0)}
            selectTextOnFocus
          />
          {activeSuffix && <Text style={[s.affix, { color: t.ink2 }]}>{activeSuffix}</Text>}
        </View>
      </View>
    </View>
  );
}

function BillLine({ label, value, neg, total, t }: { label: string; value: string; neg?: boolean; total?: boolean; t: T }) {
  return (
    <View style={[s.billLine, total && s.billTotal]}>
      <Text style={[s.billLabel, { color: total ? t.ink : t.ink2 }, total && s.billTotalLabel]}>{label}</Text>
      <Text style={[s.billValue, { color: neg ? t.neg : t.ink }, total && s.billTotalValue]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14 },
  cardH: { fontSize: 11, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },
  divider: { height: 1, marginVertical: 0 },
  chargeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  chargeRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chargeLabel: { fontSize: 14, fontWeight: '500' },
  chargeInput: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, gap: 6 },
  chargeInputText: { width: 60, fontSize: 14, fontWeight: '600', textAlign: 'right' },
  affix: { fontSize: 13 },
  discountToggle: { flexDirection: 'row', borderRadius: 8, padding: 2, gap: 2, alignItems: 'center' },
  toggleTab: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignItems: 'center', justifyContent: 'center' },
  toggleTabText: { fontSize: 13, fontWeight: '600' },
  billLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  billTotal: { borderTopWidth: 1, marginTop: 6, paddingTop: 12 },
  billLabel: { fontSize: 14 },
  billTotalLabel: { fontSize: 16, fontWeight: '700' },
  billValue: { fontSize: 14, fontWeight: '600' },
  billTotalValue: { fontSize: 18, fontWeight: '700' },
  oweRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderTopWidth: 1 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '700', color: '#0f1505' },
  oweInfo: { flex: 1 },
  oweName: { fontSize: 14, fontWeight: '600' },
  oweSub: { fontSize: 11, marginTop: 2 },
  oweAmt: { fontSize: 16, fontWeight: '700' },
  emptyP: { fontSize: 14, textAlign: 'center', paddingVertical: 8 },
  primaryBtn: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontSize: 15, fontWeight: '700' },
});
