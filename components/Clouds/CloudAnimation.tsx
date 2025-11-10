import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Dimensions } from 'react-native';
import { CloudSvg } from './CloudSvg';

const { width: screenWidth } = Dimensions.get('window');

export const CloudAnimation = ({ style, duration, size }) => {
  const animatedValue = useRef(new Animated.Value(style.left || -100)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: screenWidth + 100,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();

    return () => animatedValue.stopAnimation();
  }, [animatedValue, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateX: animatedValue }],
          position: 'absolute'
        }
      ]}
    >
      <CloudSvg size={size} opacity={style.opacity} />
    </Animated.View>
  );
};
