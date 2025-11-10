import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, CheckCircle, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ColorsProps {
    primary: string;
    accent: string;
    text: string;
    card: string;
    success: string;
    background: string;
    secondaryText: string;
}

interface ProgressCardProps {
    colors: ColorsProps;
    targetHours: number;
    actualHours: number;
    windDownTime: string;
    onStartWindDown: () => void;
}

const SleepProgressCard: React.FC<ProgressCardProps> = ({ 
    colors, 
    targetHours, 
    actualHours, 
    windDownTime, 
    onStartWindDown 
}) => {
    const progressPercentage = (actualHours / targetHours) * 100;
    const isGoalMet = progressPercentage >= 100;
    const progressColor = isGoalMet ? colors.success : colors.accent;
    const styles = progressCardStyles(colors);

    return (
        <View style={styles.cardContainer}>
            {/* Gradient Overlay for Premium Feel */}
            <View style={styles.gradientOverlay} />
            
            {/* Header with Icon Animation Potential */}
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.cardTitle}>Kualitas Tidur Malam Ini</Text>
                    <Text style={styles.cardSubtitle}>Target harian Anda</Text>
                </View>
                <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                    <Clock color={colors.accent} size={24} />
                </View>
            </View>
            
            {/* Enhanced Progress Display with Circle */}
            <View style={styles.progressSection}>
                <View style={styles.progressCircle}>
                    <View style={[styles.progressRing, { borderColor: colors.secondaryText + '20' }]}>
                        <View style={[
                            styles.progressRingFill, 
                            { 
                                borderColor: progressColor,
                                borderTopColor: progressColor,
                                borderRightColor: progressPercentage > 25 ? progressColor : 'transparent',
                                borderBottomColor: progressPercentage > 50 ? progressColor : 'transparent',
                                borderLeftColor: progressPercentage > 75 ? progressColor : 'transparent',
                            }
                        ]} />
                        <View style={styles.progressInner}>
                            <Text style={styles.actualTime}>{actualHours}</Text>
                            <Text style={styles.timeUnit}>Jam</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{targetHours}h</Text>
                        <Text style={styles.statLabel}>Target</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.secondaryText + '30' }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: progressColor }]}>
                            {Math.round(progressPercentage)}%
                        </Text>
                        <Text style={styles.statLabel}>Progress</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.secondaryText + '30' }]} />
                    <View style={styles.statItem}>
                        <TrendingUp color={colors.success} size={16} />
                        <Text style={styles.statLabel}>On Track</Text>
                    </View>
                </View>
            </View>

            {/* Status Badge */}
            {isGoalMet && (
                <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
                    <CheckCircle color={colors.success} size={16} />
                    <Text style={[styles.badgeText, { color: colors.success }]}>
                        Target Tercapai! 🎉
                    </Text>
                </View>
            )}

            {/* Enhanced Action Button with Gradient */}
            <TouchableOpacity 
                style={styles.actionButtonWrapper}
                onPress={onStartWindDown}
                activeOpacity={0.8}
            >
                <View style={[styles.actionButton, { backgroundColor: colors.accent }]}>
                    <Clock color={colors.card} size={20} style={{ marginRight: 8 }} />
                    <View>
                        <Text style={styles.actionText}>Mulai Wind-Down</Text>
                        <Text style={styles.actionSubtext}>Waktu: {windDownTime}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const progressCardStyles = (colors) => StyleSheet.create({
    cardContainer: {
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 24,
        marginVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
        overflow: 'hidden',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: colors.accent,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.primary,
        letterSpacing: -0.5,
    },
    cardSubtitle: {
        fontSize: 13,
        color: colors.secondaryText,
        marginTop: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressSection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    progressCircle: {
        marginBottom: 24,
    },
    progressRing: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 12,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    progressRingFill: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 12,
        borderColor: 'transparent',
    },
    progressInner: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    actualTime: {
        fontSize: 48,
        fontWeight: '800',
        color: colors.primary,
        letterSpacing: -2,
    },
    timeUnit: {
        fontSize: 14,
        color: colors.accent,
        fontWeight: '600',
        marginTop: -4,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 20,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
    },
    statLabel: {
        fontSize: 12,
        color: colors.secondaryText,
        marginTop: 4,
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        height: 30,
        marginHorizontal: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 16,
        alignSelf: 'center',
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    actionButtonWrapper: {
        marginTop: 8,
    },
    actionButton: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    actionSubtext: {
        color: '#FFFFFF',
        fontSize: 12,
        opacity: 0.9,
        marginTop: 2,
    },
});

export default SleepProgressCard;