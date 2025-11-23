import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Bell, ChevronLeft, Moon, Sun, TestTube } from 'lucide-react-native';
import React, { useEffect, useState, useRef } from 'react';
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
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { sleepScheduleService } from '../services/sleepSchedule';
import { notificationService } from '../services/notificationService';
import { Database } from '../types/database.types';
import * as Notifications from 'expo-notifications';

type SleepSchedule = Database['public']['Tables']['sleep_schedules']['Row'];

const colors = {
  primary: '#5B9BD5',
  text: '#2C3E50',
  secondaryText: '#7F8C8D',
  textLight: '#FFFFFF',
  success: '#4CAF50',
  warning: '#FFA726',
};

export default function SleepScheduleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [schedule, setSchedule] = useState<SleepSchedule | null>(null);
  const [bedtime, setBedtime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderType, setReminderType] = useState<'notification' | 'fullscreen'>('notification');
  const [reminderBefore, setReminderBefore] = useState(30);
  const [notificationStatus, setNotificationStatus] = useState<{
    enabled: boolean;
    scheduled: number;
    message: string;
  } | null>(null);

  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    if (user) {
      loadSchedule();
      setupNotificationListeners();
    }

    return () => {
      // Cleanup listeners
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user]);

  const setupNotificationListeners = () => {
    // Handle notifications received while app is in foreground
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('📬 Notification received (app in foreground)');
        console.log('   Title:', notification.request.content.title);
        console.log('   ID:', notification.request.identifier);
        
        // DON'T show anything in UI
        // The system notification handler will decide what to show
        // We just log it for debugging
      }
    );

    // Handle user tapping on notification
    responseListener.current = notificationService.addNotificationResponseListener(
      (response) => {
        console.log('👆 User tapped notification');
        
        const data = response.notification.request.content.data;
        
        // Dismiss the notification
        Notifications.dismissNotificationAsync(response.notification.request.identifier);
        
        if (data.type === 'sleep_reminder') {
          Alert.alert(
            '🌙 Pengingat Tidur',
            `Waktunya mempersiapkan diri untuk tidur pukul ${data.bedtime}!\n\nTidur yang cukup penting untuk kesehatan Anda.`,
            [{ text: 'OK' }]
          );
        } else if (data.type === 'test') {
          Alert.alert(
            '✅ Test Berhasil!',
            'Alarm berfungsi dengan baik! Notifikasi dapat muncul saat aplikasi tertutup.',
            [{ text: 'OK' }]
          );
        }
      }
    );
  };

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

      // Check notification status
      const status = await notificationService.checkNotificationStatus();
      setNotificationStatus(status);
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

  const calculateAlarmTime = () => {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    
    let bedtimeMinutes = bedHour * 60 + bedMin;
    let alarmMinutes = bedtimeMinutes - reminderBefore;
    
    if (alarmMinutes < 0) {
      alarmMinutes += 24 * 60;
    }
    
    const alarmHour = Math.floor(alarmMinutes / 60);
    const alarmMin = alarmMinutes % 60;
    
    return `${alarmHour.toString().padStart(2, '0')}:${alarmMin.toString().padStart(2, '0')}`;
  };

  const getTimeUntilAlarm = () => {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    
    let bedtimeMinutes = bedHour * 60 + bedMin;
    let alarmMinutes = bedtimeMinutes - reminderBefore;
    
    if (alarmMinutes < 0) {
      alarmMinutes += 24 * 60;
    }
    
    const alarmHour = Math.floor(alarmMinutes / 60);
    const alarmMin = alarmMinutes % 60;
    
    const now = new Date();
    const alarmTime = new Date();
    alarmTime.setHours(alarmHour, alarmMin, 0, 0);
    
    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }
    
    const minutesUntil = Math.floor((alarmTime.getTime() - now.getTime()) / 1000 / 60);
    const hoursUntil = Math.floor(minutesUntil / 60);
    const minsUntil = minutesUntil % 60;
    
    return {
      time: alarmTime,
      minutesUntil,
      text: hoursUntil > 0 
        ? `${hoursUntil} jam ${minsUntil} menit lagi`
        : `${minsUntil} menit lagi`,
      isPast: minutesUntil < 1,
    };
  };

  const getSleepQuality = () => {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
    
    let totalMinutes = (wakeHour * 60 + wakeMin) - (bedHour * 60 + bedMin);
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    
    const hours = totalMinutes / 60;
    
    if (hours >= 7 && hours <= 9) return { text: 'Optimal', color: colors.success };
    if (hours >= 6 && hours < 7) return { text: 'Cukup Baik', color: colors.warning };
    return { text: 'Perlu Perbaikan', color: '#EF5350' };
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

      if (schedule) {
        await sleepScheduleService.update(schedule.id, scheduleData);
      } else {
        await sleepScheduleService.upsert(scheduleData);
      }

      await loadSchedule();

      // Show detailed confirmation
      const status = await notificationService.checkNotificationStatus();
      
      Alert.alert(
        '✅ Jadwal Berhasil Disimpan!',
        `Waktu Tidur: ${bedtime}\nWaktu Bangun: ${wakeTime}\nDurasi: ${calculateSleepDuration()}\n\n${
          reminderEnabled 
            ? `🔔 Alarm Aktif:\n• ${status.scheduled} alarm terjadwal\n• Alarm pertama: ${status.nextAlarm || 'Menghitung...'}\n• Pengingat ${reminderBefore} menit sebelum tidur\n\n✅ Alarm sudah aktif! Anda bisa tutup aplikasi kapan saja.\n\n⚠️ PENTING:\n• Jangan force stop aplikasi\n• Matikan mode Hemat Baterai untuk app ini` 
            : '❌ Pengingat dinonaktifkan'
        }`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      Alert.alert('Error', 'Gagal menyimpan jadwal tidur');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    await notificationService.sendTestNotification();
    
    Alert.alert(
      '✅ Test Alarm Dijadwalkan!',
      'Alarm test telah dijadwalkan dan akan berbunyi dalam 10 detik.\n\n' +
      '📱 Anda bisa:\n' +
      '• Tetap di app ini\n' +
      '• Minimize ke home screen\n' +
      '• Buka app lain\n' +
      '• Tutup app sepenuhnya\n\n' +
      'Notifikasi akan muncul dalam 10 detik di mana pun Anda berada!',
      [{ text: 'OK' }]
    );
  };

  const quality = getSleepQuality();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#6B9DC3', '#8FB3D5']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color={colors.textLight} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Jadwal Tidur</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.headerSubtitle}>
            Atur waktu tidur dan bangun yang konsisten 🌙
          </Text>
        </LinearGradient>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat jadwal...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6B9DC3', '#8FB3D5']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Jadwal Tidur</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.testButton}
              onPress={handleTestNotification}
            >
              <TestTube size={20} color={colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.testButton}
              onPress={() => router.push('/debug-alarm' as any)}
            >
              <Text style={styles.debugText}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Atur waktu tidur dan bangun yang konsisten 🌙
        </Text>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Notification Status Card */}
        {notificationStatus && (
          <View style={[
            styles.statusCard,
            { 
              backgroundColor: notificationStatus.enabled 
                ? (notificationStatus.scheduled > 0 ? '#E8F5E9' : '#FFF3E0')
                : '#FFEBEE' 
            }
          ]}>
            <Text style={styles.statusTitle}>
              {notificationStatus.enabled 
                ? (notificationStatus.scheduled > 0 ? '✅ Alarm Aktif' : '⚠️ Belum Ada Alarm')
                : '❌ Izin Notifikasi Belum Diberikan'
              }
            </Text>
            <Text style={styles.statusMessage}>
              {notificationStatus.message}
            </Text>
            {notificationStatus.nextAlarm && (
              <Text style={styles.statusNextAlarm}>
                🔔 Alarm berikutnya: {notificationStatus.nextAlarm}
              </Text>
            )}
            {!notificationStatus.enabled && (
              <TouchableOpacity 
                style={styles.statusButton}
                onPress={() => Linking.openSettings()}
              >
                <Text style={styles.statusButtonText}>Buka Pengaturan</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Alarm Preview Card */}
        {reminderEnabled && (
          <View style={styles.alarmPreviewCard}>
            <Text style={styles.alarmPreviewTitle}>⏰ Preview Alarm</Text>
            <View style={styles.alarmPreviewContent}>
              <Text style={styles.alarmPreviewLabel}>Alarm akan berbunyi:</Text>
              <Text style={styles.alarmPreviewTime}>{calculateAlarmTime()}</Text>
              <Text style={styles.alarmPreviewCountdown}>
                {(() => {
                  const info = getTimeUntilAlarm();
                  return info.isPast 
                    ? '⚠️ Waktu sudah lewat! Pilih waktu yang lebih lama.'
                    : `📍 ${info.text}`;
                })()}
              </Text>
              <Text style={styles.alarmPreviewDetail}>
                ({reminderBefore} menit sebelum tidur pukul {bedtime})
              </Text>
            </View>
          </View>
        )}

        {/* Sleep Duration Card */}
        <View style={styles.durationCard}>
          <Text style={styles.durationLabel}>Durasi Tidur</Text>
          <Text style={styles.durationValue}>{calculateSleepDuration()}</Text>
          <View style={styles.qualityBadge}>
            <View style={[styles.qualityDot, { backgroundColor: quality.color }]} />
            <Text style={[styles.qualityText, { color: quality.color }]}>
              {quality.text}
            </Text>
          </View>
        </View>

        {/* Bedtime Setting */}
        <View style={styles.timeCard}>
          <View style={styles.timeCardHeader}>
            <View style={styles.timeIcon}>
              <Moon size={24} color={colors.primary} />
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Waktu Tidur</Text>
              <Text style={styles.timeDescription}>Atur jam tidur ideal Anda</Text>
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
                    bedtime === time && styles.timeOptionSelected
                  ]}
                  onPress={() => setBedtime(time)}
                >
                  <Text style={[
                    styles.timeOptionText,
                    bedtime === time && styles.timeOptionTextSelected
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Wake Time Setting */}
        <View style={styles.timeCard}>
          <View style={styles.timeCardHeader}>
            <View style={[styles.timeIcon, { backgroundColor: '#FFF9E6' }]}>
              <Sun size={24} color="#FFA726" />
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Waktu Bangun</Text>
              <Text style={styles.timeDescription}>Atur jam bangun ideal Anda</Text>
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
                    wakeTime === time && styles.timeOptionSelected
                  ]}
                  onPress={() => setWakeTime(time)}
                >
                  <Text style={[
                    styles.timeOptionText,
                    wakeTime === time && styles.timeOptionTextSelected
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Reminder Settings */}
        <View style={styles.reminderCard}>
          <View style={styles.reminderHeader}>
            <Bell size={20} color={colors.primary} />
            <Text style={styles.reminderTitle}>Pengingat Tidur (Alarm)</Text>
          </View>
          
          <View style={styles.reminderOption}>
            <Text style={styles.reminderOptionLabel}>Aktifkan Pengingat</Text>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor={colors.textLight}
            />
          </View>

          {reminderEnabled && (
            <>
              <View style={styles.reminderOption}>
                <Text style={styles.reminderOptionLabel}>Ingatkan Sebelum</Text>
                <View style={styles.reminderTimeButtons}>
                  {[15, 30, 60].map((min) => (
                    <TouchableOpacity
                      key={min}
                      style={[
                        styles.reminderTimeButton,
                        reminderBefore === min && styles.reminderTimeButtonSelected
                      ]}
                      onPress={() => setReminderBefore(min)}
                    >
                      <Text style={[
                        styles.reminderTimeButtonText,
                        reminderBefore === min && styles.reminderTimeButtonTextSelected
                      ]}>
                        {min}m
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.reminderTypeSection}>
                <Text style={styles.reminderTypeTitle}>Tipe Pengingat</Text>
                
                <TouchableOpacity
                  style={[
                    styles.reminderTypeCard,
                    reminderType === 'notification' && styles.reminderTypeCardSelected
                  ]}
                  onPress={() => setReminderType('notification')}
                >
                  <View style={styles.reminderTypeRadio}>
                    {reminderType === 'notification' && (
                      <View style={styles.reminderTypeRadioInner} />
                    )}
                  </View>
                  <View style={styles.reminderTypeInfo}>
                    <Text style={styles.reminderTypeLabel}>Notifikasi Biasa</Text>
                    <Text style={styles.reminderTypeDesc}>
                      Tampil di atas layar HP dengan suara
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.reminderTypeCard,
                    reminderType === 'fullscreen' && styles.reminderTypeCardSelected
                  ]}
                  onPress={() => setReminderType('fullscreen')}
                >
                  <View style={styles.reminderTypeRadio}>
                    {reminderType === 'fullscreen' && (
                      <View style={styles.reminderTypeRadioInner} />
                    )}
                  </View>
                  <View style={styles.reminderTypeInfo}>
                    <Text style={styles.reminderTypeLabel}>Alarm Prioritas Tinggi</Text>
                    <Text style={styles.reminderTypeDesc}>
                      Suara lebih keras, vibrate kuat (Recommended)
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  ℹ️ Alarm akan berbunyi setiap hari pada waktu yang sama.{'\n\n'}
                  📌 Pastikan:{'\n'}
                  • Notifikasi BetterSleep diizinkan{'\n'}
                  • Baterai tidak dalam mode hemat ekstrim{'\n'}
                  • Aplikasi tidak di-force stop{'\n'}
                  • Mode "Jangan Ganggu" dimatikan saat waktu alarm
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSaveSchedule}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.textLight} size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Simpan Jadwal & Aktifkan Alarm</Text>
          )}
        </TouchableOpacity>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Cara Kerja Alarm</Text>
          <Text style={styles.tipsText}>
            <Text style={{fontWeight: 'bold'}}>✅ Alarm Otomatis Aktif</Text>{'\n'}
            Setelah disimpan, alarm sudah langsung aktif! Anda bisa:{'\n'}
            • Tutup aplikasi{'\n'}
            • Minimize ke background{'\n'}
            • Restart HP{'\n'}
            • Buka aplikasi lain{'\n\n'}
            
            <Text style={{fontWeight: 'bold'}}>🔔 Kapan Alarm Berbunyi?</Text>{'\n'}
            Alarm akan otomatis berbunyi sesuai waktu yang Anda set, bahkan kalau:{'\n'}
            • Aplikasi tertutup{'\n'}
            • HP dalam mode silent (tergantung pengaturan){'\n'}
            • Anda sedang pakai aplikasi lain{'\n\n'}
            
            <Text style={{fontWeight: 'bold'}}>⚠️ Yang TIDAK Boleh:</Text>{'\n'}
            • Force stop aplikasi dari pengaturan{'\n'}
            • Hapus aplikasi dari RAM secara paksa{'\n'}
            • Aktifkan Battery Saver yang agresif
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FC',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  testButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  debugText: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textLight,
  },
  placeholder: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.secondaryText,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  durationCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  durationLabel: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.9,
    marginBottom: 8,
  },
  durationValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textLight,
    marginBottom: 12,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.textLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  qualityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  qualityText: {
    fontSize: 13,
    fontWeight: '700',
  },
  timeCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  timeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  timeDescription: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  timePicker: {
    marginTop: 12,
  },
  timePickerContent: {
    gap: 8,
    paddingHorizontal: 4,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  timeOptionSelected: {
    backgroundColor: colors.primary,
  },
  timeOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  timeOptionTextSelected: {
    color: colors.textLight,
  },
  reminderCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  reminderOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  reminderOptionLabel: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  reminderTimeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  reminderTimeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  reminderTimeButtonSelected: {
    backgroundColor: colors.primary,
  },
  reminderTimeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  reminderTimeButtonTextSelected: {
    color: colors.textLight,
  },
  reminderTypeSection: {
    marginTop: 16,
  },
  reminderTypeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  reminderTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 10,
  },
  reminderTypeCardSelected: {
    backgroundColor: '#E8F4F8',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  reminderTypeRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderTypeRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  reminderTypeInfo: {
    flex: 1,
  },
  reminderTypeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  reminderTypeDesc: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  infoText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textLight,
  },
  tipsCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  statusMessage: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  statusNextAlarm: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 12,
  },
  statusButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusButtonText: {
    color: colors.textLight,
    fontWeight: '600',
    fontSize: 14,
  },
});
