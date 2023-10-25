import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';

const Loader = () => {
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 10); // update every 10 ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <Spin size="large" />
      <div style={{ marginTop: '15px', color: '#fff' }}>
        {Math.floor(elapsedTime / 1000)}s : {elapsedTime % 1000}ms
      </div>
    </div>
  );
};

export default Loader;
