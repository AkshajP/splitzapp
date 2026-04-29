import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { Sheet } from './Sheet';
import { CURRENCY, ACCENT, ACCENT_INK, fmt, initials } from '@/constants/theme';
import type { ArchivedBill } from '@/store/useStore';

type T = typeof import('@/constants/theme').light;

export function ArchivedBillSheet({
  bill, onClose, onToast, t,
}: {
  bill: ArchivedBill; onClose: () => void; onToast: (msg: string) => void; t: T;
}) {
  const buildText = () => {
    const lines: string[] = [];
    lines.push(`💸  ${bill.title}`);
    lines.push(`    ${bill.date}`);
    lines.push('─────────────────');
    bill.perPerson.forEach(p => {
      lines.push(`${p.name.padEnd(12, ' ')}${CURRENCY}${fmt(p.share)}`);
    });
    lines.push('─────────────────');
    lines.push(`${'Total'.padEnd(12, ' ')}${CURRENCY}${fmt(bill.total)}`);
    return lines.join('\n');
  };

  const copy = async () => {
    try {
      await Share.share({ message: buildText() });
    } catch {}
    onToast('Shared');
  };

  return (
    <Sheet title={bill.title} onClose={onClose} t={t}>
      <Text style={[s.meta, { color: t.ink2 }]}>{bill.date} · {bill.peopleCount} people · {bill.items.length} items</Text>

      <View style={[s.card, { backgroundColor: t.surface, borderColor: t.border, marginTop: 14 }]}>
        <Text style={[s.cardH, { color: t.ink3 }]}>Each person paid</Text>
        {bill.perPerson.map((p, i) => (
          <View key={i} style={[s.oweRow, i === 0 ? s.oweRowFirst : null, { borderTopColor: t.border }]}>
            <View style={[s.avatar, { backgroundColor: p.color }]}>
              <Text style={s.avatarText}>{initials(p.name)}</Text>
            </View>
            <Text style={[s.oweName, { color: t.ink, flex: 1 }]}>{p.name}</Text>
            <Text style={[s.oweAmt, { color: t.ink }]}>{CURRENCY}{fmt(p.share)}</Text>
          </View>
        ))}
      </View>

      <View style={[s.card, { backgroundColor: t.surface, borderColor: t.border, marginTop: 10 }]}>
        <Text style={[s.cardH, { color: t.ink3 }]}>Items</Text>
        {bill.items.map((it, i) => (
          <View key={i} style={[s.line, { borderTopColor: t.border }]}>
            <Text style={[s.lineLabel, { color: t.ink2 }]}>{it.name}</Text>
            <Text style={[s.lineAmt, { color: t.ink }]}>{CURRENCY}{fmt(it.amount)}</Text>
          </View>
        ))}
        <View style={[s.lineTotal, { borderTopColor: t.border }]}>
          <Text style={[s.lineTotalLabel, { color: t.ink }]}>Total</Text>
          <Text style={[s.lineTotalAmt, { color: t.ink }]}>{CURRENCY}{fmt(bill.total)}</Text>
        </View>
      </View>

      <TouchableOpacity style={[s.primaryBtn, { backgroundColor: ACCENT, marginTop: 14 }]} onPress={copy}>
        <Text style={[s.primaryBtnText, { color: ACCENT_INK }]}>Share split</Text>
      </TouchableOpacity>
    </Sheet>
  );
}

const s = StyleSheet.create({
  meta: { fontSize: 12, marginBottom: 4 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14 },
  cardH: { fontSize: 11, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },
  oweRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderTopWidth: 1 },
  oweRowFirst: { borderTopWidth: 0 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '700', color: '#0f1505' },
  oweName: { fontSize: 14, fontWeight: '600' },
  oweAmt: { fontSize: 16, fontWeight: '700' },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1 },
  lineLabel: { fontSize: 14 },
  lineAmt: { fontSize: 14, fontWeight: '600' },
  lineTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, marginTop: 6 },
  lineTotalLabel: { fontSize: 16, fontWeight: '700' },
  lineTotalAmt: { fontSize: 18, fontWeight: '700' },
  primaryBtn: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontSize: 15, fontWeight: '700' },
});
