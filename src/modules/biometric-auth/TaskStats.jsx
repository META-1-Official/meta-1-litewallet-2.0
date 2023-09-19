import React from 'react';
import { Progress } from 'antd';

const processData = (data, parentKey = '') => {
  // console.log(data)
  const entries = Object.entries(data);

  return entries.flatMap(([key, value]) => {
    let _value =
      typeof value === 'number'
        ? parseInt(String(value))
        : value === null
        ? 0
        : value;
    // Direct numeric value
    if (
      typeof _value === 'number' &&
      [
        'face_detection',
        'face_verification',
        'face_liveliness',
        'current_score',
        'registration',
      ].indexOf(key) !== -1
    ) {
      const progressStatus =
        _value > 75 ? 'success' : _value > 50 ? 'active' : 'exception';
      const progressBarKey = parentKey ? `${parentKey} (${key})` : key;

      return (
        <div key={progressBarKey} style={{ margin: '0' }}>
          <label style={{ color: '#ffffff' }}>{progressBarKey}</label>
          <Progress
            percent={_value}
            status={progressStatus}
            strokeWidth={10}
            strokeColor={{
              '0%': '#ff4d4f',
              '100%': '#52c41a',
            }}
          />
        </div>
      );
    }

    // Object with 'current_score' subkey
    if (
      typeof value === 'object' &&
      value !== null &&
      'current_score' in value
    ) {
      return processData(value, `${parentKey ? `${parentKey} > ` : ''}${key}`);
    }

    // Recursively process 'tasks' object
    if (typeof value === 'object' && value !== null && key === 'tasks') {
      return processData(value, `${parentKey ? `${parentKey} > ` : ''}${key}`);
    }

    return null;
  });
};

const ProgressBarComponent = ({ data }) => {
  return <div>{processData(data)}</div>;
};

export default ProgressBarComponent;
