import React, { useMemo, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  useColorScheme, ActivityIndicator, PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore, computeTotals } from '@/store/useStore';
import { ACCENT, ACCENT_INK, light, darkTheme, autoTitle } from '@/constants/theme';
import { Header, type Tab } from '@/components/Header';
import { PeopleStrip } from '@/components/PeopleStrip';
import { ItemsScreen } from '@/components/ItemsScreen';
import { SummaryScreen } from '@/components/SummaryScreen';
import { PeopleScreen } from '@/components/PeopleScreen';
import { ArchiveSheet } from '@/components/ArchiveSheet';
import { ItemEditor } from '@/components/ItemEditor';
import { PeoplePicker } from '@/components/PeoplePicker';
import { NewBillSheet } from '@/components/NewBillSheet';
import { ShareSheet } from '@/components/ShareSheet';
import { ArchivedBillSheet } from '@/components/ArchivedBillSheet';
import { Toast } from '@/components/Toast';
import { SettingsSheet } from '@/components/SettingsSheet';
import type { ArchivedBill } from '@/store/useStore';

const SWIPEABLE_TABS: Tab[] = ['people', 'items', 'summary'];

export default function MainScreen() {
  const scheme = useColorScheme();
  const store = useStore();
  const isDark = store.themeOverride === 'system' ? scheme === 'dark' : store.themeOverride === 'dark';
  const t = isDark ? darkTheme : light;

  const billTitle = store.billTitleLocked ? store.billTitle : autoTitle();
  const [tab, setTab] = useState<Tab | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showPeoplePicker, setShowPeoplePicker] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showNewBill, setShowNewBill] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [viewingBill, setViewingBill] = useState<ArchivedBill | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const resolvedTabRef = useRef<Tab>('people');
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderRelease: (_, g) => {
        const cur = resolvedTabRef.current;
        const i = SWIPEABLE_TABS.indexOf(cur);
        if (i === -1) return;
        if (g.dx < -40 && i < SWIPEABLE_TABS.length - 1) setTab(SWIPEABLE_TABS[i + 1]);
        else if (g.dx > 40 && i > 0) setTab(SWIPEABLE_TABS[i - 1]);
      },
    })
  ).current;

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
  resolvedTabRef.current = resolvedTab;
  const swipeIndex = SWIPEABLE_TABS.indexOf(resolvedTab as Tab);

  return (
    <SafeAreaView style={[s.root, { backgroundColor: t.bg }]}>
      <Header
        tab={resolvedTab}
        setTab={setTab}
        activeCount={store.activePeopleIds.length}
        archiveCount={store.archive.length}
        billTitle={billTitle}
        onNewBill={() => setShowNewBill(true)}
        onArchive={() => setShowArchive(v => !v)}
        archiveOpen={showArchive}
        isEditing={store.items.length > 0}
        t={t}
      />
      <PeopleStrip
        people={store.people}
        activeIds={store.activePeopleIds}
        onPick={() => setShowPeoplePicker(true)}
        t={t}
      />

      <View style={s.swipeArea} {...(swipeIndex !== -1 ? panResponder.panHandlers : {})}>
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
            onDelete={store.deletePeople}
            t={t}
          />
        )}
      </View>

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
          onConfirm={(archiveTitle) => { store.startNewBill(archiveTitle); showToast(store.items.length > 0 ? 'Bill archived' : 'Started fresh'); setShowNewBill(false); setTab('people'); }}
          onClose={() => setShowNewBill(false)}
          willArchive={store.items.length > 0}
          currentTitle={billTitle}
          t={t}
        />
      )}

      {showArchive && (
        <ArchiveSheet
          archive={store.archive}
          onView={(bill) => { setViewingBill(bill); }}
          onDelete={store.deleteArchivedBill}
          onRename={store.renameArchivedBill}
          onClose={() => setShowArchive(false)}
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

      {resolvedTab === 'people' && <TouchableOpacity
        style={[s.gearBtn, { backgroundColor: t.surface2, borderColor: t.border }]}
        onPress={() => setShowSettings(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="settings-sharp" size={20} color={t.ink2} />
      </TouchableOpacity>}

      {showSettings && (
        <SettingsSheet
          themeOverride={store.themeOverride}
          onChangeTheme={(v) => store.update({ themeOverride: v })}
          onResetData={store.resetData}
          onClose={() => setShowSettings(false)}
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
  swipeArea: { flex: 1 },
  gearBtn: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
