import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Sheet } from './Sheet';
import { CURRENCY, ACCENT, ACCENT_INK, fmt, initials } from '@/constants/theme';
import type { Item, Person } from '@/store/useStore';

type T = typeof import('@/constants/theme').light;

export function ItemEditor({
  itemId, items, activePeople, onSave, onClose, onDelete, t,
}: {
  itemId: string; items: Item[]; activePeople: Person[];
  onSave: (item: Item) => void; onClose: () => void;
  onDelete: (id: string) => void; t: T;
}) {
  const isNew = itemId === 'new';
  const existing = !isNew ? items.find(i => i.id === itemId) : null;

  const nameRef = useRef<TextInput>(null);
  useEffect(() => { const t = setTimeout(() => nameRef.current?.focus(), 300); return () => clearTimeout(t); }, []);

  const [name, setName] = useState(existing?.name || '');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [assigned, setAssigned] = useState<string[]>(
    existing?.assigned || activePeople.map(p => p.id)
  );
  const [mode, setMode] = useState<'equal' | 'percent'>(existing?.mode || 'equal');
  const [amountError, setAmountError] = useState(false);
  // Store as strings so TextInput doesn't fight the user when clearing a field
  const [percentStrs, setPercentStrs] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (existing?.percents) Object.entries(existing.percents).forEach(([k, v]) => { init[k] = String(v); });
    return init;
  });

  const percents: Record<string, number> = {};
  Object.entries(percentStrs).forEach(([k, v]) => { percents[k] = parseFloat(v) || 0; });

  const switchToPercent = () => {
    const ids = assigned.length > 0 ? assigned : activePeople.map(p => p.id);
    const even = Math.floor(100 / ids.length);
    const remainder = 100 - even * ids.length;
    const initial: Record<string, string> = {};
    ids.forEach((id, i) => { initial[id] = String(even + (i === 0 ? remainder : 0)); });
    setPercentStrs(initial);
    setMode('percent');
  };

  const togglePerson = (id: string) => {
    setAssigned(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const allActiveIds = activePeople.map(p => p.id);
  const allOn = allActiveIds.every(id => assigned.includes(id));
  const amtNum = parseFloat(amount) || 0;
  const equalShare = assigned.length > 0 ? amtNum / assigned.length : 0;
  const totalPct = Object.values(percents).reduce((s, v) => s + (Number(v) || 0), 0);

  const save = () => {
    if (amtNum <= 0) {
      setAmountError(true);
      return;
    }
    setAmountError(false);
    onSave({
      id: existing?.id || ('i' + Date.now()),
      name: name.trim(),
      amount: amtNum,
      assigned,
      mode,
      ...(mode === 'percent' ? { percents } : {}),
    });
  };

  return (
    <Sheet
      title={isNew ? 'New item' : 'Edit item'}
      onClose={onClose}
      t={t}
      footer={
        <View style={s.footerRow}>
          {!isNew && (
            <TouchableOpacity style={[s.ghostBtn, { backgroundColor: t.surface2 }]} onPress={() => onDelete(existing!.id)}>
              <Text style={[s.ghostBtnText, { color: t.ink }]}>Delete</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[s.primaryBtn, { backgroundColor: ACCENT, flex: 1 }]}
            onPress={save}
          >
            <Text style={[s.primaryBtnText, { color: ACCENT_INK }]}>{isNew ? 'Add item' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={s.fields}>
        <View style={s.field}>
          <Text style={[s.label, { color: t.ink3 }]}>Item</Text>
          <TextInput
            ref={nameRef}
            style={[s.input, { backgroundColor: t.surface, borderColor: t.border, color: t.ink }]}
            placeholder="e.g. Margherita pizza"
            placeholderTextColor={t.ink3}
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={s.field}>
          <Text style={[s.label, { color: amountError ? '#c2410c' : t.ink3 }]}>
            Amount{amountError ? ' — required' : ''}
          </Text>
          <View style={[s.amountRow, { backgroundColor: t.surface, borderColor: amountError ? '#c2410c' : t.border }]}>
            <Text style={[s.currency, { color: t.ink3 }]}>{CURRENCY}</Text>
            <TextInput
              style={[s.amountInput, { color: t.ink }]}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={t.ink3}
              value={amount}
              onChangeText={(v) => { setAmount(v); if (parseFloat(v) > 0) setAmountError(false); }}
              selectTextOnFocus
            />
          </View>
        </View>
      </View>

      <View style={s.section}>
        <View style={s.sectionH}>
          <Text style={[s.sectionLabel, { color: t.ink3 }]}>Split between</Text>
          <TouchableOpacity onPress={() => setAssigned(allOn ? [] : [...allActiveIds])}>
            <Text style={[s.linkBtn, { color: t.ink2 }]}>{allOn ? 'Clear' : 'Everyone'}</Text>
          </TouchableOpacity>
        </View>
        <View style={s.pickerGrid}>
          {activePeople.map(p => {
            const on = assigned.includes(p.id);
            return (
              <TouchableOpacity
                key={p.id}
                style={[s.pick, { backgroundColor: t.surface, borderColor: on ? ACCENT : t.border }, on && s.pickOn]}
                onPress={() => togglePerson(p.id)}
              >
                <View style={[s.avatarSm, { backgroundColor: p.color }]}>
                  <Text style={s.avatarSmText}>{initials(p.name)}</Text>
                </View>
                <Text style={[s.pickName, { color: t.ink }]} numberOfLines={1}>{p.name}</Text>
                {on && (
                  <View style={[s.pickTick, { backgroundColor: ACCENT }]}>
                    <Text style={{ color: ACCENT_INK, fontSize: 10 }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={s.section}>
        <Text style={[s.sectionLabel, { color: t.ink3 }]}>Split mode</Text>
        <View style={[s.seg, { backgroundColor: t.surface2, marginTop: 8 }]}>
          <TouchableOpacity style={[s.segBtn, mode === 'equal' && [s.segOn, { backgroundColor: t.surface }]]} onPress={() => setMode('equal')}>
            <Text style={[s.segText, { color: mode === 'equal' ? t.ink : t.ink2 }]}>Equal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.segBtn, mode === 'percent' && [s.segOn, { backgroundColor: t.surface }]]} onPress={switchToPercent}>
            <Text style={[s.segText, { color: mode === 'percent' ? t.ink : t.ink2 }]}>Percentage</Text>
          </TouchableOpacity>
        </View>
        {mode === 'equal' && assigned.length > 0 && (
          <Text style={[s.hint, { color: t.ink2 }]}>Each pays {CURRENCY}{fmt(equalShare)}</Text>
        )}
        {mode === 'percent' && (
          <View style={s.pctList}>
            {assigned.map(id => {
              const p = activePeople.find(x => x.id === id);
              if (!p) return null;
              const vStr = percentStrs[id] ?? '0';
              const vNum = parseFloat(vStr) || 0;
              return (
                <View key={id} style={[s.pctRow, { backgroundColor: t.surface, borderColor: t.border }]}>
                  <View style={[s.avatarSm, { backgroundColor: p.color }]}>
                    <Text style={s.avatarSmText}>{initials(p.name)}</Text>
                  </View>
                  <Text style={[s.pctName, { color: t.ink }]}>{p.name}</Text>
                  <TextInput
                    style={[s.pctInput, { backgroundColor: t.bg, borderColor: t.border, color: t.ink }]}
                    keyboardType="decimal-pad"
                    value={vStr}
                    onChangeText={(val) => {
                      setPercentStrs(prev => {
                        const next = { ...prev, [id]: val };
                        const lastId = assigned[assigned.length - 1];
                        if (assigned.length > 1 && id !== lastId) {
                          const othersTotal = assigned.filter(x => x !== lastId).reduce((s, x) => s + (parseFloat(next[x]) || 0), 0);
                          const remaining = 100 - othersTotal;
                          next[lastId] = String(Math.max(0, remaining));
                        }
                        return next;
                      });
                    }}
                    editable={assigned.length < 2 || assigned[assigned.length - 1] !== id}
                    selectTextOnFocus
                  />
                  <Text style={[s.affix, { color: t.ink2 }]}>%</Text>
                  <Text style={[s.pctAmt, { color: t.ink2 }]}>{CURRENCY}{fmt(amtNum * vNum / 100)}</Text>
                </View>
              );
            })}
            <View style={[s.pctTotal, Math.round(totalPct) === 100 ? s.pctOk : s.pctBad]}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: Math.round(totalPct) === 100 ? ACCENT_INK : '#c2410c' }}>
                Total · {totalPct.toFixed(0)}%{Math.round(totalPct) !== 100 ? ' (must be 100%)' : ''}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  fields: { gap: 10, marginBottom: 16 },
  field: { gap: 6 },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 16 },
  amountRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 48 },
  currency: { fontSize: 16, marginRight: 8 },
  amountInput: { flex: 1, fontSize: 18, fontWeight: '700', alignSelf: 'stretch' },
  section: { marginTop: 16 },
  sectionH: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  linkBtn: { fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pick: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingLeft: 6, paddingRight: 10, borderRadius: 26, borderWidth: 1, height: 44,
    position: 'relative', minWidth: 108,
  },
  pickOn: {},
  avatarSm: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  avatarSmText: { fontSize: 10, fontWeight: '700', color: '#0f1505' },
  pickName: { fontSize: 13, fontWeight: '500', flex: 1 },
  pickTick: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff',
  },
  seg: { flexDirection: 'row', gap: 4, borderRadius: 12, padding: 4 },
  segBtn: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
  segOn: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  segText: { fontSize: 13, fontWeight: '600' },
  hint: { fontSize: 12, marginTop: 8, paddingHorizontal: 4 },
  pctList: { marginTop: 10, gap: 6 },
  pctRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 10, borderWidth: 1 },
  pctName: { flex: 1, fontSize: 13, fontWeight: '500' },
  pctInput: { width: 56, height: 30, borderRadius: 8, borderWidth: 1, paddingHorizontal: 6, fontSize: 13, fontWeight: '600', textAlign: 'right' },
  affix: { fontSize: 13 },
  pctAmt: { fontSize: 12, minWidth: 60, textAlign: 'right' },
  pctTotal: { marginTop: 8, padding: 8, borderRadius: 8, alignItems: 'center' },
  pctOk: { backgroundColor: 'rgba(200,255,62,0.18)' },
  pctBad: { backgroundColor: 'rgba(194,65,12,0.10)' },
  footerRow: { flexDirection: 'row', gap: 10 },
  ghostBtn: { height: 44, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ghostBtnText: { fontSize: 14, fontWeight: '600' },
  primaryBtn: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontSize: 15, fontWeight: '700' },
});
