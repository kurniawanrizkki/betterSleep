import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Bell, ChevronLeft, Moon, Sun, TestTube } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Linking,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { sleepScheduleService } from '../services/sleepSchedule';
import { alarmService } from '../services/alarmService';
import { Database } from '../types/database.types';

type SleepSchedule = Database['public']['Tables']['sleep_schedules']['Row'];

export default function SleepScheduleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [schedule, setSchedule] = useState<SleepSchedule | null>(null);
  const [bedtime, setBedtime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderType, setReminderType] = useState<'notification' | 'fullscreen'>('fullscreen');
  const [reminderBefore, setReminderBefore] = useState(30);
  const [alarmStatus, setAlarmStatus] = useState<{
    enabled: boolean;
    scheduled: number;
    message: string;
    nextAlarm?: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadSchedule();
    }
  }, [user]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const data = await sleepScheduleService.getActive(user!.id);
      
      if (data) {
        setSchedule(data);
        setBedtime(data.bedtime);
        setWakeTime(data.wake_time);
        setReminderEnabled(data.reminder_enabled);
        setReminderType(data.reminder_type);
        setReminderBefore(data.reminder_before);
      }

      const status = await alarmService.checkAlarmStatus();
      setAlarmStatus(status);
      
      console.log('📊 Alarm Status:', status);
    } catch (error: any) {
      console.error('Error loading schedule:', error);
      if (!error.message?.includes('no rows')) {
        Alert.alert('Error', 'Gagal memuat jadwal tidur');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateSleepDuration = () => {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
    
    let totalMinutes = (wakeHour * 60 + wakeMin) - (bedHour * 60 + bedMin);
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours} jam ${minutes} menit`;
  };

  const getSleepQuality = () => {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
    let totalMinutes = (wakeHour * 60 + wakeMin) - (bedHour * 60 + bedMin);
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    const hours = totalMinutes / 60;
    if (hours >= 7 && hours <= 9) return { text: 'Optimal', color: colors.success };
    if (hours >= 6 && hours < 7) return { text: 'Cukup Baik', color: colors.warning };
    return { text: 'Perlu Perbaikan', color: colors.danger };
  };

  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      timeOptions.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }

  const handleSaveSchedule = async () => {
    if (!user) {
      Alert.alert('Error', 'User tidak ditemukan');
      return;
    }

    setSaving(true);
    try {
      const scheduleData = {
        user_id: user.id,
        bedtime,
        wake_time: wakeTime,
        reminder_enabled: reminderEnabled,
        reminder_type: reminderType,
        reminder_before: reminderBefore,
        active: true,
      };
      await alarmService.saveAlarmMetadata(
        user.id,
        bedtime,
        wakeTime // ✅ Pass wake_time yang sudah ada
      );
      if (schedule) {
        await sleepScheduleService.update(schedule.id, scheduleData);
      } else {
        await sleepScheduleService.upsert(scheduleData);
      }

      await loadSchedule();
      
      const status = await alarmService.checkAlarmStatus();
      const timeInfo = alarmService.calculateTimeUntilAlarm(bedtime, reminderBefore);
      
      Alert.alert(
        '✅ Jadwal Berhasil Disimpan!',
        `⏰ Waktu Tidur: ${bedtime}\n⏰ Waktu Bangun: ${wakeTime}\n🕐 Durasi: ${calculateSleepDuration()}\n\n${
          reminderEnabled 
            ? `🔔 ALARM AKTIF!\n\n` +
              `📍 Alarm akan berbunyi: ${timeInfo.alarmTimeString}\n` +
              `⏳ Waktu tersisa: ${timeInfo.text}\n` +
              `📊 Total alarm terjadwal: ${status.scheduled}\n\n` +
              `✅ Alarm sudah aktif dengan suara KERAS!\n` +
              `✅ Anda bisa tutup aplikasi sekarang.\n\n` +
              `⚠️ PENTING:\n` +
              `• Jangan force stop aplikasi\n` +
              `• Matikan Battery Saver untuk app ini\n` +
              `• Pastikan volume tidak silent`
            : '❌ Pengingat dinonaktifkan'
        }`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      Alert.alert('Error', 'Gagal menyimpan jadwal tidur: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestAlarm = async () => {
    try {
      await alarmService.sendTestAlarm();
    } catch (error) {
      console.error('Test alarm error:', error);
    }
  };

  const quality = getSleepQuality();
  const headerGradient = theme === 'dark'
    ? ['#1A2A3A', '#253746']
    : ['#6B9DC3', '#8FB3D5'];

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SafeAreaView style={styles.container}>
          <LinearGradient colors={headerGradient} style={styles.header}>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                onPress={() => router.back()}
              >
                <ChevronLeft size={24} color={colors.textLight} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.textLight }]}>Jadwal Tidur</Text>
              <View style={styles.placeholder} />
            </View>
          </LinearGradient>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
              Memuat jadwal...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const alarmPreview = reminderEnabled 
    ? alarmService.calculateTimeUntilAlarm(bedtime, reminderBefore)
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={headerGradient} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color={colors.textLight} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.textLight }]}>Jadwal Tidur</Text>
            <TouchableOpacity 
              style={[styles.testButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              onPress={handleTestAlarm}
            >
              <TestTube size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textLight }]}>
            Atur waktu tidur dengan alarm yang keras 🔔
          </Text>
        </LinearGradient>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Alarm Status Card */}
          {alarmStatus && (
            <View style={[
              styles.statusCard,
              { 
                backgroundColor: alarmStatus.enabled 
                  ? colors.success + '20'
                  : colors.warning + '20',
                borderLeftColor: alarmStatus.enabled 
                  ? colors.success
                  : colors.warning,
              }
            ]}>
              <Text style={[styles.statusTitle, { color: colors.text }]}>
                {alarmStatus.enabled ? '✅ Alarm Aktif' : '⚠️ Belum Ada Alarm'}
              </Text>
              <Text style={[styles.statusMessage, { color: colors.text }]}>
                {alarmStatus.message}
              </Text>
              {alarmStatus.nextAlarm && (
                <Text style={[styles.statusNextAlarm, { color: colors.text }]}>
                  🔔 Alarm berikutnya: {alarmStatus.nextAlarm}
                </Text>
              )}
            </View>
          )}

          {/* Alarm Preview */}
          {reminderEnabled && alarmPreview && (
            <View style={[styles.alarmPreviewCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.alarmPreviewTitle, { color: colors.text }]}>⏰ Preview Alarm</Text>
              <View style={styles.alarmPreviewContent}>
                <Text style={[styles.alarmPreviewLabel, { color: colors.text }]}>
                  Alarm akan berbunyi dengan SUARA KERAS:
                </Text>
                <Text style={[styles.alarmPreviewTime, { color: colors.primary }]}>
                  {alarmPreview.alarmTimeString}
                </Text>
                <Text style={[
                  styles.alarmPreviewCountdown,
                  { color: alarmPreview.isPast ? colors.danger : colors.success }
                ]}>
                  {alarmPreview.isPast 
                    ? '⚠️ Waktu sudah lewat! Pilih waktu yang lebih lama.'
                    : `🕐 ${alarmPreview.text}`
                  }
                </Text>
                <Text style={[styles.alarmPreviewDetail, { color: colors.secondaryText }]}>
                  ({reminderBefore} menit sebelum tidur pukul {bedtime})
                </Text>
              </View>
            </View>
          )}

          {/* Duration Card */}
          <View style={[styles.durationCard, { backgroundColor: colors.primary }]}>
            <Text style={[styles.durationLabel, { color: colors.textLight }]}>Durasi Tidur</Text>
            <Text style={[styles.durationValue, { color: colors.textLight }]}>
              {calculateSleepDuration()}
            </Text>
            <View style={styles.qualityBadge}>
              <View style={[styles.qualityDot, { backgroundColor: quality.color }]} />
              <Text style={[styles.qualityText, { color: quality.color }]}>
                {quality.text}
              </Text>
            </View>
          </View>

          {/* Bedtime Picker */}
          <View style={[styles.timeCard, { backgroundColor: colors.card }]}>
            <View style={styles.timeCardHeader}>
              <View style={[styles.timeIcon, { backgroundColor: colors.secondaryButton }]}>
                <Moon size={24} color={colors.primary} />
              </View>
              <View style={styles.timeInfo}>
                <Text style={[styles.timeLabel, { color: colors.text }]}>Waktu Tidur</Text>
                <Text style={[styles.timeDescription, { color: colors.secondaryText }]}>
                  Atur jam tidur ideal Anda
                </Text>
              </View>
            </View>
            <View style={styles.timePicker}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.timePickerContent}
              >
                {timeOptions.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeOption,
                      { backgroundColor: colors.inputBackground },
                      bedtime === time && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setBedtime(time)}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      { color: colors.text },
                      bedtime === time && { color: colors.textLight }
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Wake Time Picker */}
          <View style={[styles.timeCard, { backgroundColor: colors.card }]}>
            <View style={styles.timeCardHeader}>
              <View style={[styles.timeIcon, { backgroundColor: colors.warning + '20' }]}>
                <Sun size={24} color={colors.warning} />
              </View>
              <View style={styles.timeInfo}>
                <Text style={[styles.timeLabel, { color: colors.text }]}>Waktu Bangun</Text>
                <Text style={[styles.timeDescription, { color: colors.secondaryText }]}>
                  Atur jam bangun ideal Anda
                </Text>
              </View>
            </View>
            <View style={styles.timePicker}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.timePickerContent}
              >
                {timeOptions.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeOption,
                      { backgroundColor: colors.inputBackground },
                      wakeTime === time && { backgroundColor: colors.warning }
                    ]}
                    onPress={() => setWakeTime(time)}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      { color: colors.text },
                      wakeTime === time && { color: colors.textLight }
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Reminder Settings */}
          <View style={[styles.reminderCard, { backgroundColor: colors.card }]}>
            <View style={styles.reminderHeader}>
              <Bell size={20} color={colors.primary} />
              <Text style={[styles.reminderTitle, { color: colors.text }]}>Pengingat Alarm</Text>
            </View>
            
            <View style={styles.reminderOption}>
              <Text style={[styles.reminderOptionLabel, { color: colors.text }]}>
                Aktifkan Alarm
              </Text>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.textLight}
              />
            </View>

            {reminderEnabled && (
              <>
                <View style={styles.reminderOption}>
                  <Text style={[styles.reminderOptionLabel, { color: colors.text }]}>
                    Ingatkan Sebelum
                  </Text>
                  <View style={styles.reminderTimeButtons}>
                    {[15, 30, 60].map((min) => (
                      <TouchableOpacity
                        key={min}
                        style={[
                          styles.reminderTimeButton,
                          { backgroundColor: colors.inputBackground },
                          reminderBefore === min && { backgroundColor: colors.primary }
                        ]}
                        onPress={() => setReminderBefore(min)}
                      >
                        <Text style={[
                          styles.reminderTimeButtonText,
                          { color: colors.text },
                          reminderBefore === min && { color: colors.textLight }
                        ]}>
                          {min}m
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={[styles.infoBox, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.infoText, { color: colors.text }]}>
                    🔔 Ini adalah ALARM SEJATI dengan suara keras seperti alarm clock, bukan notifikasi biasa!{'\n\n'}
                    ✅ Alarm akan berbunyi otomatis setiap hari{'\n'}
                    ✅ Bekerja meskipun aplikasi ditutup{'\n'}
                    ✅ Suara keras dan terus loop sampai di-dismiss{'\n\n'}
                    ⚠️ Pastikan:{'\n'}
                    • Volume HP tidak di-silent{'\n'}
                    • Izin alarm sudah diberikan{'\n'}
                    • Jangan force-stop aplikasi
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              { backgroundColor: colors.primary }, 
              saving && styles.saveButtonDisabled
            ]}
            onPress={handleSaveSchedule}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.textLight} size="small" />
            ) : (
              <Text style={[styles.saveButtonText, { color: colors.textLight }]}>
                💾 Simpan Jadwal & Aktifkan Alarm
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: { 
    paddingTop: 50, 
    paddingBottom: 30, 
    paddingHorizontal: 20 
  },
  headerContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 10 
  },
  backButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  testButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '700' 
  },
  placeholder: { 
    width: 40 
  },
  headerSubtitle: { 
    fontSize: 14, 
    textAlign: 'center', 
    opacity: 0.9 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 16, 
    paddingTop: 100 
  },
  loadingText: { 
    fontSize: 16, 
    fontWeight: '500' 
  },
  content: { 
    flex: 1 
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 120, // ✅ Extra padding untuk button tidak terhalang
  },
  statusCard: { 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 20, 
    borderLeftWidth: 4 
  },
  statusTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 8 
  },
  statusMessage: { 
    fontSize: 14, 
    lineHeight: 20 
  },
  statusNextAlarm: { 
    fontSize: 13, 
    fontWeight: '600', 
    marginTop: 8 
  },
  alarmPreviewCard: { 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 20, 
    borderLeftWidth: 4, 
    borderLeftColor: '#4CAF50' 
  },
  alarmPreviewTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 12 
  },
  alarmPreviewContent: { 
    gap: 8 
  },
  alarmPreviewLabel: { 
    fontSize: 14 
  },
  alarmPreviewTime: { 
    fontSize: 28, 
    fontWeight: '800' 
  },
  alarmPreviewCountdown: { 
    fontSize: 14, 
    fontWeight: '600' 
  },
  alarmPreviewDetail: { 
    fontSize: 12, 
    opacity: 0.8 
  },
  durationCard: { 
    borderRadius: 20, 
    padding: 24, 
    alignItems: 'center', 
    marginBottom: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 10, 
    elevation: 8 
  },
  durationLabel: { 
    fontSize: 14, 
    opacity: 0.9, 
    marginBottom: 8 
  },
  durationValue: { 
    fontSize: 32, 
    fontWeight: '800', 
    marginBottom: 12 
  },
  qualityBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 6, 
    borderRadius: 20, 
    gap: 6 
  },
  qualityDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4 
  },
  qualityText: { 
    fontSize: 13, 
    fontWeight: '700' 
  },
  timeCard: { 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 8, 
    elevation: 3 
  },
  timeCardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  timeIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  timeInfo: { 
    flex: 1 
  },
  timeLabel: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 2 
  },
  timeDescription: { 
    fontSize: 13 
  },
  timePicker: { 
    marginTop: 12 
  },
  timePickerContent: { 
    gap: 8, 
    paddingHorizontal: 4 
  },
  timeOption: { 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 12 
  },
  timeOptionText: { 
    fontSize: 15, 
    fontWeight: '600' 
  },
  reminderCard: { 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 8, 
    elevation: 3 
  },
  reminderHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginBottom: 16 
  },
  reminderTitle: { 
    fontSize: 16, 
    fontWeight: '700' 
  },
  reminderOption: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0' 
  },
  reminderOptionLabel: { 
    fontSize: 15, 
    fontWeight: '600' 
  },
  reminderTimeButtons: { 
    flexDirection: 'row', 
    gap: 8 
  },
  reminderTimeButton: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 10 
  },
  reminderTimeButtonText: { 
    fontSize: 14, 
    fontWeight: '600' 
  },
  infoBox: { 
    borderRadius: 12, 
    padding: 16, 
    marginTop: 16 
  },
  infoText: { 
    fontSize: 13, 
    lineHeight: 20 
  },
  saveButton: { 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginBottom: 40, // ✅ Extra margin bottom
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 5 
  },
  saveButtonDisabled: { 
    opacity: 0.6 
  },
  saveButtonText: { 
    fontSize: 16, 
    fontWeight: '700' 
  },
});
