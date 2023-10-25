import React, { useImperativeHandle, useState } from 'react';
import { CheckCircleOutlined } from '@ant-design/icons';
import '../css/task-icon.css';

const TaskSuccess = React.forwardRef((props, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [styles, setStyles] = useState({});
  const {
    color = 'lightgreen',
    zoomDuration = 300,
    fadeDuration = 500,
  } = props;

  useImperativeHandle(ref, () => ({
    animate: (cx, cy, maxSize) => {
      setIsVisible(true);
      setStyles({
        position: 'absolute',
        left: cx,
        top: cy,
        animation: `zoomIn ${zoomDuration}ms cubic-bezier(0.7, 0, 1, 1) forwards, 
                    fadeOut ${fadeDuration}ms cubic-bezier(0.7, 0, 1, 1) ${zoomDuration}ms forwards`,
      });

      setTimeout(() => {
        setIsVisible(false);
        setStyles({});
      }, zoomDuration + fadeDuration);
    },
  }));

  return isVisible ? (
    <CheckCircleOutlined style={{ color, ...styles }} />
  ) : null;
});

export default TaskSuccess;
