import React from 'react';
import Svg, { Ellipse } from 'react-native-svg';

export const CloudSvg = ({ size = 100, opacity = 0.8 }) => (
  <Svg width={size} height={size * 0.6} viewBox="0 0 100 60" style={{ opacity }}>
    <Ellipse cx="25" cy="40" rx="20" ry="18" fill="#FFFFFF" />
    <Ellipse cx="45" cy="30" rx="25" ry="22" fill="#FFFFFF" />
    <Ellipse cx="70" cy="38" rx="22" ry="20" fill="#FFFFFF" />
    <Ellipse cx="50" cy="45" rx="30" ry="15" fill="#FFFFFF" />
  </Svg>
);
