import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowRight, PackageOpen } from 'lucide-react-native';
import { palette } from '../theme';

export function ScreenTitle({ eyebrow, title, subtitle, action }) {
  return (
    <View style={styles.titleRow}>
      <View style={styles.titleCopy}>
        {!!eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {action}
    </View>
  );
}

export function Notice({ children, tone = 'neutral' }) {
  return (
    <View style={[styles.notice, tone === 'error' && styles.noticeError]}>
      <Text style={[styles.noticeText, tone === 'error' && styles.noticeErrorText]}>{children}</Text>
    </View>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}><PackageOpen color={palette.green} size={24} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {action && (
        <Pressable style={styles.emptyAction} onPress={action.onPress} accessibilityRole="button">
          <Text style={styles.emptyActionText}>{action.label}</Text>
          <ArrowRight color={palette.surface} size={16} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  titleCopy: { flex: 1 },
  eyebrow: { marginBottom: 7, color: palette.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: palette.ink, fontSize: 30, lineHeight: 35, fontWeight: '800' },
  subtitle: { marginTop: 5, color: palette.muted, fontSize: 13, lineHeight: 19 },
  notice: { borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, padding: 13, borderRadius: 4 },
  noticeError: { borderColor: '#E8C1B9', backgroundColor: palette.errorSoft },
  noticeText: { color: palette.ink, fontSize: 13, lineHeight: 19 },
  noticeErrorText: { color: palette.error },
  empty: { alignItems: 'center', paddingHorizontal: 28, paddingVertical: 48 },
  emptyIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.greenSoft },
  emptyTitle: { marginTop: 16, color: palette.ink, fontSize: 18, fontWeight: '800' },
  emptyBody: { maxWidth: 270, marginTop: 7, color: palette.muted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  emptyAction: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: palette.green, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 4 },
  emptyActionText: { color: palette.surface, fontSize: 12, fontWeight: '800' },
});