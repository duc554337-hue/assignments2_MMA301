import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Cloud, ShieldCheck } from 'lucide-react-native';
import { Notice, ScreenTitle } from '../../components/Primitives';
import { useStore } from '../../context/StoreContext';
import { isFirebaseConfigured } from '../../services/firebase';
import { getNotificationPermission, sendTestNotification } from '../../services/notifications';
import { pagePadding, palette } from '../../theme';

function SettingRow({ icon: Icon, title, detail, status }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}><Icon size={18} color={palette.green} /></View>
      <View style={styles.settingCopy}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingDetail}>{detail}</Text></View>
      {status ? <View style={[styles.status, status.tone === 'error' && styles.statusError]}><Text style={[styles.statusText, status.tone === 'error' && styles.statusErrorText]}>{status.label}</Text></View> : null}
    </View>
  );
}

export default function SettingsScreen() {
  const { cloudStatus, cloudError } = useStore();
  const [permission, setPermission] = useState(null);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState('');

  async function refreshPermission() {
    try {
      setPermission(await getNotificationPermission());
    } catch {
      setPermission({ granted: false, status: 'unavailable' });
    }
  }

  useEffect(() => {
    let active = true;
    getNotificationPermission()
      .then((status) => { if (active) setPermission(status); })
      .catch(() => { if (active) setPermission({ granted: false, status: 'unavailable' }); });
    return () => { active = false; };
  }, []);

  async function runTest() {
    setWorking(true);
    setMessage('');
    try {
      const result = await sendTestNotification();
      setMessage(result === 'sent' ? 'Test notification sent.' : result === 'unsupported' ? 'Notifications are unavailable on web.' : 'Permission was denied. You can change it in system settings.');
      await refreshPermission();
    } catch (error) {
      setMessage(error.message || 'Could not send a notification.');
    } finally {
      setWorking(false);
    }
  }

  const notificationLabel = permission?.granted ? 'Allowed' : permission?.status === 'unsupported' ? 'Web only' : permission ? 'Not allowed' : 'Checking';
  const firebaseLabel = cloudStatus === 'connected' ? 'Connected' : cloudStatus === 'error' ? 'Error' : isFirebaseConfigured() ? 'Connecting' : 'Local only';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenTitle eyebrow="PREFERENCES & INTEGRATIONS" title="Settings" subtitle="Connection and permission status for this device." />
        <View style={styles.group}>
          <Text style={styles.groupTitle}>BUSINESS SERVICES</Text>
          <SettingRow icon={Cloud} title="Saved items" detail="Anonymous Firebase account + Firestore" status={{ label: firebaseLabel, tone: cloudStatus === 'error' ? 'error' : 'neutral' }} />
          {cloudStatus === 'error' ? <View style={styles.inlineNotice}><Notice tone="error">{cloudError}</Notice></View> : null}
          {!isFirebaseConfigured() ? <View style={styles.inlineNotice}><Notice>Local favorites stay available. Add Firebase project settings to turn on cloud sync.</Notice></View> : null}
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>DEVICE NOTIFICATIONS</Text>
          <SettingRow icon={Bell} title="Cart activity" detail="A local alert when a product is added." status={{ label: notificationLabel, tone: permission && !permission.granted && permission.status !== 'unsupported' ? 'error' : 'neutral' }} />
          <Pressable onPress={runTest} disabled={working} style={[styles.actionButton, working && styles.disabled]} accessibilityRole="button">
            {working ? <ActivityIndicator color={palette.surface} /> : <><Bell color={palette.surface} size={16} /><Text style={styles.actionText}>Request permission & send test</Text></>}
          </Pressable>
          {message ? <View style={styles.inlineNotice}><Notice tone={message.includes('denied') || message.includes('Could not') ? 'error' : 'neutral'}>{message}</Notice></View> : null}
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>PRIVACY</Text>
          <SettingRow icon={ShieldCheck} title="No payment or secrets" detail="This demo collects no payment. Gemini credentials must stay on a server." />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.paper },
  content: { paddingHorizontal: pagePadding, paddingTop: 25, paddingBottom: 32 },
  group: { marginTop: 29 },
  groupTitle: { marginBottom: 11, color: palette.green, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  settingRow: { minHeight: 69, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 11, borderTopWidth: 1, borderTopColor: palette.line },
  settingIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.greenSoft, borderRadius: 18 },
  settingCopy: { flex: 1 },
  settingTitle: { color: palette.ink, fontSize: 12, fontWeight: '800' },
  settingDetail: { marginTop: 3, color: palette.muted, fontSize: 10, lineHeight: 15 },
  status: { paddingHorizontal: 8, paddingVertical: 5, backgroundColor: palette.greenSoft, borderRadius: 3 },
  statusError: { backgroundColor: palette.errorSoft },
  statusText: { color: palette.green, fontSize: 9, fontWeight: '900' },
  statusErrorText: { color: palette.error },
  inlineNotice: { marginTop: 9, marginBottom: 5 },
  actionButton: { minHeight: 45, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: palette.green, borderRadius: 4 },
  actionText: { color: palette.surface, fontSize: 11, fontWeight: '800' },
  disabled: { opacity: 0.6 },
});