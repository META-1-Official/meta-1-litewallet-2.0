import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { Alert } from 'antd';
import '../css/notification.css'; // Ensure to create this file for the CSS
import { toast } from 'react-toastify';

const HudNotification = forwardRef((props, ref) => {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);
  const timeoutRef = React.useRef(null);

  const resetTimeout = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(
      () => setVisible(false),
      props.duration || 1000,
    );
  };

  useImperativeHandle(ref, () => ({
    showNotification: (content, type) => {
      if (
        notification &&
        notification.content === content &&
        notification.type === type
      ) {
        resetTimeout(); // Reset the timeout if the notification is the same
        return;
      } else {
        toast(content, { type });
        setNotification({ content, type });
        resetTimeout();
      }
      // setNotification({ content, type });
      // setVisible(true);
      // resetTimeout();
    },
  }));

  const handleMessageEvent = (message) => {
    console.log('onMessage', message.data);
    toast(JSON.parse(message.data), { type: 'info' });
  };

  useEffect(() => {
    document.addEventListener('message', handleMessageEvent);
    return () => {
      document.removeEventListener('message', handleMessageEvent);
    };
  }, []);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current); // Clear timeout on component unmount
  }, []);

  useEffect(() => {
    if (!visible) setNotification(null); // Reset notification state when it's hidden
  }, [visible]);

  return (
    <div className="hud-notification">
      {/* {notification && visible && (
        <Alert
          message={notification.content}
          type={notification.type}
          showIcon
        />
      )} */}
    </div>
  );
});

export default HudNotification;
