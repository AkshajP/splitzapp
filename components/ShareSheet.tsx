import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { Sheet } from './Sheet';
import { CURRENCY, ACCENT, ACCENT_INK, fmt, initials, fmtDate, fmtTime } from '@/constants/theme';
import type { Item, Person } from '@/store/useStore';

type T = typeof import('@/constants/theme').light;
type Totals = ReturnType<typeof import('@/store/useStore').computeTotals>;

export function ShareSheet({
  totals, activePeople, items, tax, taxType, service, serviceType,
  discount, discountType, billTitle, onClose, onToast, t,
}: {
  totals: Totals; activePeople: Person[]; items: Item[];
  tax: number; taxType: 'amount' | 'pct';
  service: number; serviceType: 'amount' | 'pct';
  discount: number; discountType: 'amount' | 'pct';
  billTitle: string;
  onClose: () => void; onToast: (msg: string) => void; t: T;
}) {
  const now = new Date();

  const buildText = () => {
    const lines: string[] = [];
    lines.push(`💸  Bill Split`);
    lines.push(`    ${billTitle}`);
    lines.push(`    ${fmtDate(now)}  ${fmtTime(now)}`);
    lines.push('─────────────────');
    activePeople.forEach(p => {
      const pp = totals.perPerson[p.id] || { share: 0 };
      lines.push(`${p.name.padEnd(12, ' ')}${CURRENCY}${fmt(pp.share)}`);
    });
    lines.push('─────────────────');
    lines.push(`${'Total'.padEnd(12, ' ')}${CURRENCY}${fmt(totals.grand)}`);
    const taxStr = taxType === 'pct' ? `Tax ${tax}%` : `Tax ${CURRENCY}${fmt(tax)}`;
    const svcStr = serviceType === 'pct' ? `Service ${service}%` : `Service ${CURRENCY}${fmt(service)}`;
    let discStr = '';
    if (discount > 0) {
      discStr = ` · Discount ${discountType === 'pct' ? `${discount}%` : `${CURRENCY}${fmt(discount)}`}`;
    }
    lines.push(`(${taxStr} · ${svcStr}${discStr})`);
    return lines.join('\n');
  };

  const shareText = async () => {
    try {
      await Share.share({ message: buildText() });
    } catch {}
  };

  return (
    <Sheet title="Share split" onClose={onClose} t={t}>
      <View style={s.shareCard}>
        <View style={s.shareH}>
          <Text style={s.shareTitle}>Bill Split</Text>
          <Text style={s.shareSub}>{billTitle} · {activePeople.length} people</Text>
        </View>
        <View style={s.shareTable}>
          {activePeople.map(p => {
            const pp = totals.perPerson[p.id] || { share: 0 };
            return (
              <View key={p.id} style={s.shareRow}>
                <View style={[s.avatarSm, { backgroundColor: p.color }]}>
                  <Text style={s.avatarSmText}>{initials(p.name)}</Text>
                </View>
                <Text style={s.shareName}>{p.name}</Text>
                <Text style={s.shareAmt}>{CURRENCY}{fmt(pp.share)}</Text>
              </View>
            );
          })}
        </View>
        <View style={s.shareFoot}>
          <Text style={s.shareFootLabel}>Total</Text>
          <Text style={[s.shareFootAmt, { color: ACCENT }]}>{CURRENCY}{fmt(totals.grand)}</Text>
        </View>
      </View>

      <View style={s.textSection}>
        <Text style={[s.sectionLabel, { color: t.ink3 }]}>Plain text</Text>
        <View style={[s.shareText, { backgroundColor: t.surface2, borderColor: t.border }]}>
          <Text style={[s.shareTextContent, { color: t.ink }]}>{buildText()}</Text>
        </View>
      </View>

      <TouchableOpacity style={[s.primaryBtn, { backgroundColor: ACCENT, marginTop: 16 }]} onPress={shareText}>
        <Text style={[s.primaryBtnText, { color: ACCENT_INK }]}>Share split</Text>
      </TouchableOpacity>
    </Sheet>
  );
}

const s = StyleSheet.create({
  shareCard: { borderRadius: 16, padding: 18, marginBottom: 16, overflow: 'hidden', backgroundColor: '#181818' },
  shareH: { marginBottom: 14 },
  shareTitle: { fontSize: 18, fontWeight: '700', color: '#f5f5f0' },
  shareSub: { fontSize: 11, color: 'rgba(245,245,240,0.6)', marginTop: 2 },
  shareTable: { gap: 6 },
  shareRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  avatarSm: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  avatarSmText: { fontSize: 10, fontWeight: '700', color: '#0f1505' },
  shareName: { flex: 1, fontSize: 13, fontWeight: '500', color: '#f5f5f0' },
  shareAmt: { fontSize: 13, fontWeight: '700', color: '#f5f5f0' },
  shareFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.18)' },
  shareFootLabel: { fontSize: 12, color: 'rgba(245,245,240,0.7)' },
  shareFootAmt: { fontSize: 20, fontWeight: '700' },
  textSection: { gap: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  shareText: { borderRadius: 12, padding: 14, borderWidth: 1 },
  shareTextContent: { fontFamily: 'monospace', fontSize: 11 },
  primaryBtn: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontSize: 15, fontWeight: '700' },
});
