import React from 'react';
import { Progress, Tooltip } from 'antd';

const processData = (data, parentKey = '') => {
  const entries = Object.entries(data);

  return entries.flatMap(([key, value]) => {
    let _value =
      typeof value === 'number'
        ? parseInt(String(value))
        : value === null
        ? 0
        : value;

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
      const tooltipTitle = `${progressBarKey}: ${_value}% (${progressStatus})`;

      return (
        <Tooltip title={tooltipTitle} key={progressBarKey}>
          <div
            style={{
              flex: 1,
              marginRight: '2px',
              transition: 'transform 0.3s',
              cursor: 'pointer',
            }}
          >
            <Progress
              percent={_value}
              status={progressStatus}
              strokeWidth={15}
              strokeColor={{
                '0%': '#ff4d4f',
                '100%': '#52c41a',
              }}
              style={{
                margin: 0,
                lineHeight: 0,
              }}
            />
          </div>
        </Tooltip>
      );
    }

    if (
      typeof value === 'object' &&
      value !== null &&
      'current_score' in value
    ) {
      return processData(value, `${parentKey ? `${parentKey} > ` : ''}${key}`);
    }

    if (typeof value === 'object' && value !== null && key === 'tasks') {
      return processData(value, `${parentKey ? `${parentKey} > ` : ''}${key}`);
    }

    return null;
  });
};

const ProgressBarComponent = ({ data }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
      {processData(data)}
    </div>
  );
};

export default ProgressBarComponent;
