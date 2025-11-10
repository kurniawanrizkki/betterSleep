import React from 'react';
import { View, Text } from 'react-native';

export const TrackingCard = ({ sleepData, maxHours, avgSleep, colors, styles }) => (
  <View style={styles.trackingCard}>
    <View style={styles.trackingHeader}>
      <Text style={styles.trackingTitle}>Tracking 7 Hari</Text>
      <Text style={styles.trackingAvg}>Rata-rata: {avgSleep}h</Text>
    </View>

    <View style={styles.chart}>
      {sleepData.map((day, index) => (
        <View key={index} style={styles.chartBar}>
          <View style={styles.chartBarContainer}>
            <View
              style={[
                styles.chartBarFill,
                {
                  height: `${(day.hours / maxHours) * 100}%`,
                  backgroundColor: day.hours >= 7 ? colors.success : colors.warning,
                },
              ]}
            >
              <Text style={styles.chartBarValue}>{day.hours}h</Text>
            </View>
          </View>
          <Text style={styles.chartBarLabel}>{day.day}</Text>
        </View>
      ))}
    </View>
  </View>
);
