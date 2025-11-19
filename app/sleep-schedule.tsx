import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Bell, ChevronLeft, Moon, Sun } from 'lucide-react-native';
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
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { sleepScheduleService } from '../services/sleepSchedule';
import { Database } from '../types/database.types';

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
    } catch (error: any) {
      console.error('Error loading schedule:', error);
      // Don't show error for no schedule found
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
        // Update existing schedule
        await sleepScheduleService.update(schedule.id, scheduleData);
      } else {
        // Create new schedule
        await sleepScheduleService.upsert(scheduleData);
      }

      // Reload schedule
      await loadSchedule();

      Alert.alert(
        'Jadwal Tersimpan! ✨',
        `Jadwal tidur Anda:\n\nTidur: ${bedtime}\nBangun: ${wakeTime}\nDurasi: ${calculateSleepDuration()}\n\n${reminderEnabled ? 'Pengingat diaktifkan' : 'Pengingat dinonaktifkan'}`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      Alert.alert('Error', 'Gagal menyimpan jadwal tidur');
    } finally {
      setSaving(false);
    }
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
          <View style={styles.placeholder} />
        </View>
        <Text style={styles.headerSubtitle}>
          Atur waktu tidur dan bangun yang konsisten 🌙
        </Text>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
            <Text style={styles.reminderTitle}>Pengingat Tidur</Text>
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
                    <Text style={styles.reminderTypeLabel}>Layar Penuh</Text>
                    <Text style={styles.reminderTypeDesc}>
                      Tampil 1 layar penuh dengan animasi
                    </Text>
                  </View>
                </TouchableOpacity>
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
            <Text style={styles.saveButtonText}>Simpan Jadwal</Text>
          )}
        </TouchableOpacity>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips Tidur Konsisten</Text>
          <Text style={styles.tipsText}>
            • Tidur dan bangun pada waktu yang sama setiap hari{'\n'}
            • Hindari tidur siang terlalu lama{'\n'}
            • Hindari kafein 6 jam sebelum tidur{'\n'}
            • Ciptakan rutinitas sebelum tidur
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
});