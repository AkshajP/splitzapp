import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  useColorScheme, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore, computeTotals } from '@/store/useStore';
import { ACCENT, ACCENT_INK, light, darkTheme, autoTitle } from '@/constants/theme';
import { Header, type Tab } from '@/components/Header';
import { PeopleStrip } from '@/components/PeopleStrip';
import { ItemsScreen } from '@/components/ItemsScreen';
import { SummaryScreen } from '@/components/SummaryScreen';
import { PeopleScreen } from '@/components/PeopleScreen';
import { ArchiveScreen } from '@/components/ArchiveScreen';
import { ItemEditor } from '@/components/ItemEditor';
import { PeoplePicker } from '@/components/PeoplePicker';
import { NewBillSheet } from '@/components/NewBillSheet';
import { ShareSheet } from '@/components/ShareSheet';
import { ArchivedBillSheet } from '@/components/ArchivedBillSheet';
import { Toast } from '@/components/Toast';
import type { ArchivedBill } from '@/store/useStore';

export default function MainScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const t = isDark ? darkTheme : light;

  const store = useStore();
  const billTitle = store.billTitleLocked ? store.billTitle : autoTitle();
  const [tab, setTab] = useState<Tab | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showPeoplePicker, setShowPeoplePicker] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showNewBill, setShowNewBill] = useState(false);
  const [viewingBill, setViewingBill] = useState<ArchivedBill | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const activePeople = store.activePeopleIds
    .map(id => store.people.find(p => p.id === id)!)
    .filter(Boolean);

  const totals = useMemo(
    () => computeTotals(store.items, store.activePeopleIds, store.tax, store.service, store.discount, store.discountType, store.taxType, store.serviceType),
    [store.items, store.activePeopleIds, store.tax, store.service, store.discount, store.discountType, store.taxType, store.serviceType]
  );

  if (!store.loaded) {
    return (
      <View style={[s.center, { backgroundColor: t.bg }]}>
        <ActivityIndicator />
      </View>
    );
  }

  const resolvedTab = tab ?? (store.items.length > 0 ? 'items' : 'people');

  return (
    <SafeAreaView style={[s.root, { backgroundColor: t.bg }]}>
      <Header
        tab={resolvedTab}
        setTab={setTab}
        activeCount={store.activePeopleIds.length}
        archiveCount={store.archive.length}
        billTitle={billTitle}
        onNewBill={() => setShowNewBill(true)}
        isEditing={store.items.length > 0}
        t={t}
      />
      <PeopleStrip
        people={store.people}
        activeIds={store.activePeopleIds}
        onPick={() => setShowPeoplePicker(true)}
        t={t}
      />

      {resolvedTab === 'items' && (
        <ItemsScreen
          items={store.items}
          people={store.people}
          activePeople={activePeople}
          onEdit={(id) => setEditingItem(id)}
          onDelete={store.deleteItem}
          onAdd={() => setEditingItem('new')}
          totals={totals}
          t={t}
        />
      )}
      {resolvedTab === 'summary' && (
        <SummaryScreen
          totals={totals}
          activePeople={activePeople}
          tax={store.tax}
          taxType={store.taxType}
          service={store.service}
          serviceType={store.serviceType}
          discount={store.discount}
          discountType={store.discountType}
          onChangeTax={(v) => store.update({ tax: v })}
          onChangeTaxType={(v) => store.update({ taxType: v })}
          onChangeService={(v) => store.update({ service: v })}
          onChangeServiceType={(v) => store.update({ serviceType: v })}
          onChangeDiscount={(v) => store.update({ discount: v })}
          onChangeDiscountType={(v) => store.update({ discountType: v })}
          onShare={() => setShowShare(true)}
          t={t}
        />
      )}
      {resolvedTab === 'people' && (
        <PeopleScreen
          people={store.people}
          activeIds={store.activePeopleIds}
          onToggle={store.togglePersonActive}
          onAdd={store.addPerson}
          onUpdateTags={store.updatePersonTags}
          t={t}
        />
      )}
      {resolvedTab === 'archive' && (
        <ArchiveScreen
          archive={store.archive}
          onView={(bill) => setViewingBill(bill)}
          onDelete={store.deleteArchivedBill}
          t={t}
        />
      )}

      {editingItem && (
        <ItemEditor
          itemId={editingItem}
          items={store.items}
          activePeople={activePeople}
          recentItems={store.recentItems}
          onSave={(item) => { store.upsertItem(item); setEditingItem(null); }}
          onClose={() => setEditingItem(null)}
          onDelete={(id) => { store.deleteItem(id); setEditingItem(null); }}
          t={t}
        />
      )}

      {showPeoplePicker && (
        <PeoplePicker
          people={store.people}
          activeIds={store.activePeopleIds}
          onToggle={store.togglePersonActive}
          onAdd={store.addPerson}
          onClose={() => setShowPeoplePicker(false)}
          t={t}
        />
      )}

      {showNewBill && (
        <NewBillSheet
          onConfirm={() => { store.startNewBill(); showToast(store.items.length > 0 ? 'Bill archived' : 'Started fresh'); setShowNewBill(false); }}
          onClose={() => setShowNewBill(false)}
          willArchive={store.items.length > 0}
          currentTitle={billTitle}
          t={t}
        />
      )}

      {viewingBill && (
        <ArchivedBillSheet
          bill={viewingBill}
          onClose={() => setViewingBill(null)}
          onToast={showToast}
          t={t}
        />
      )}

      {showShare && (
        <ShareSheet
          totals={totals}
          activePeople={activePeople}
          items={store.items}
          tax={store.tax}
          taxType={store.taxType}
          service={store.service}
          serviceType={store.serviceType}
          discount={store.discount}
          discountType={store.discountType}
          billTitle={billTitle}
          onClose={() => setShowShare(false)}
          onToast={showToast}
          t={t}
        />
      )}

      {toast && <Toast message={toast} />}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
