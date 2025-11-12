import { BookOpen, Heart, Save, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';

const journalTypes = [
    { id: 1, name: 'Gratitude List', icon: Heart, color: '#FF6B6B' },
    { id: 2, name: 'Reflection', icon: BookOpen, color: '#4ECDC4' },
];

const prompts = {
    'Gratitude List': 'Hal kecil apa yang membuatmu tersenyum hari ini?',
    'Reflection': 'Pelajaran apa yang kamu dapat hari ini?',
    'Today s Wins': 'Apa pencapaianmu hari ini, sekecil apapun?',
};

const GratitudeNotesScreen = () => {
  const [selectedType, setSelectedType] = useState(journalTypes[0].name);
  const [note, setNote] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleSave = () => {
    console.log(`Menyimpan jurnal tipe: ${selectedType}`, note);
    // Implement save logic here
    setNote('');
    setCharCount(0);
  };

  const handleTextChange = (text) => {
    setNote(text);
    setCharCount(text.length);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
            {/* Enhanced Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Gratitude Notes 📝</Text>
                    <Text style={styles.subtitle}>Tulis pikiran positifmu</Text>
                </View>
                <View style={styles.streakBadge}>
                    <Sparkles color={Colors.accent} size={16} />
                    <Text style={styles.streakText}>5 hari</Text>
                </View>
            </View>

            {/* Enhanced Type Selector with Icons */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.typeSelector}
                contentContainerStyle={styles.typeSelectorContent}
            >
                {journalTypes.map(type => {
                    const IconComponent = type.icon;
                    const isActive = selectedType === type.name;
                    return (
                        <TouchableOpacity
                            key={type.id}
                            style={[
                                styles.typeButton,
                                isActive && styles.typeButtonActive,
                            ]}
                            onPress={() => setSelectedType(type.name)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.typeIconContainer,
                                isActive && { backgroundColor: type.color + '20' }
                            ]}>
                                <IconComponent 
                                    color={isActive ? type.color : Colors.secondaryText} 
                                    size={20} 
                                />
                            </View>
                            <Text
                                style={[
                                    styles.typeButtonText,
                                    isActive && styles.typeButtonTextActive,
                                ]}
                            >
                                {type.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Enhanced Prompt Box */}
            <View style={styles.promptBox}>
                <View style={styles.promptHeader}>
                    <Sparkles color={Colors.accent} size={18} />
                    <Text style={styles.promptLabel}>Prompt Hari Ini</Text>
                </View>
                <Text style={styles.promptText}>{prompts[selectedType]}</Text>
            </View>

            {/* Enhanced Writing Area */}
            <View style={styles.textAreaContainer}>
                <TextInput
                    style={styles.textArea}
                    placeholder="Mulai menulis di sini..."
                    placeholderTextColor={Colors.secondaryText + '80'}
                    multiline
                    value={note}
                    onChangeText={handleTextChange}
                    textAlignVertical="top"
                />
                <View style={styles.textAreaFooter}>
                    <Text style={styles.charCount}>{charCount} karakter</Text>
                    <View style={styles.toolBar}>
                        <TouchableOpacity style={styles.toolButton}>
                            <Text>😊</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.toolButton}>
                            <Text>💡</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.toolButton}>
                            <Text>🎯</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Enhanced Save Button */}
            <TouchableOpacity 
                style={[
                    styles.saveButton,
                    !note.trim() && styles.saveButtonDisabled
                ]} 
                onPress={handleSave}
                disabled={!note.trim()}
                activeOpacity={0.8}
            >
                <Save color={Colors.textLight} size={20} style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>Simpan & Tenangkan Pikiran</Text>
            </TouchableOpacity>

            {/* Quick Tips */}
            <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>💡 Tips:</Text>
                <Text style={styles.tipsText}>
                    Menulis jurnal sebelum tidur membantu menenangkan pikiran dan meningkatkan kualitas tidur
                </Text>
            </View>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondaryText,
    marginTop: 4,
    fontWeight: '500',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.accent,
  },
  typeSelector: {
    marginBottom: 20,
    maxHeight: 90,
  },
  typeSelectorContent: {
    paddingRight: 20,
  },
  typeButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: Colors.card,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: Colors.background,
  },
  typeButtonText: {
    color: Colors.textDark,
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  typeButtonTextActive: {
    color: Colors.textLight,
    fontWeight: '700',
  },
  promptBox: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: Colors.accent + '10',
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.accent,
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptText: {
    color: Colors.textDark,
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 24,
  },
  textAreaContainer: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: Colors.accent + '20',
  },
  textArea: {
    flex: 1,
    padding: 20,
    fontSize: 16,
    color: Colors.textDark,
    lineHeight: 24,
  },
  textAreaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.secondaryText + '20',
  },
  charCount: {
    fontSize: 13,
    color: Colors.secondaryText,
    fontWeight: '500',
  },
  toolBar: {
    flexDirection: 'row',
    gap: 8,
  },
  toolButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: Colors.success,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.secondaryText,
    opacity: 0.5,
  },
  saveButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tipsCard: {
    backgroundColor: Colors.primary + '10',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
  },
  tipsText: {
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 18,
  },
});

export default GratitudeNotesScreen;