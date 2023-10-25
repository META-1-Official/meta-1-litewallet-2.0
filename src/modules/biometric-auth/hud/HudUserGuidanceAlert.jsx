import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { Alert, Spin } from 'antd';
import '../css/user-gudance-text.css'; // Ensure to create this file for the CSS

// Create a mapping of pipeline names to user-friendly text
const pipelineTextMap = {
  face_detection: 'Finding faces in the video frame',
  face_verification: 'Verifying found face',
  face_liveliness: {
    Left: 'Slowly turn your head to left',
    Right: 'Slowly turn your head to right',
    Blink: 'Close your eyes for 1 second',
    Smile: 'Please Smile',
  },
  registration: {
    FrontForRegistrationV2:
      'Look straight into the camera, capturing your face, Please wait...',
  },
};

const parsePipelineData = (data) => {
  if (!data) return { text: '', loading: false }; // handle undefined data

  const { face_detection, face_verification, face_liveliness, registration } =
    data;

  // Check for initial conditions
  if (face_detection === 0)
    return { text: pipelineTextMap.face_detection, loading: true };
  if (face_detection === 100 && face_verification === 0)
    return {
      text: pipelineTextMap.face_verification,
      loading: true,
    };

  // Check for later pipeline conditions
  if (face_detection === 100 && (face_liveliness || registration)) {
    let subPipelines;
    if (face_liveliness) subPipelines = Object.keys(face_liveliness.tasks);
    if (registration) subPipelines = Object.keys(registration.tasks);
    const lastSubPipeline = subPipelines[subPipelines.length - 1];
    return {
      text: registration
        ? pipelineTextMap.registration[lastSubPipeline]
        : pipelineTextMap.face_liveliness[lastSubPipeline],
      loading: false,
    };
  }

  return { text: '', loading: false };
};

const HudUserGuidanceAlert = forwardRef((props, ref) => {
  const [messageData, setMessageData] = useState(parsePipelineData(props.data));

  useEffect(() => {
    setMessageData(parsePipelineData(props.data));
  }, [props.data]);

  useImperativeHandle(ref, () => ({
    updateData: (newData) => {
      const newMessageData = parsePipelineData(newData);
      if (
        newMessageData.text !== messageData.text ||
        newMessageData.loading !== messageData.loading
      ) {
        setMessageData(newMessageData);
      }
    },
    clear: () => {
      setMessageData({ text: '', loading: false });
    },
  }));

  return (
    <div className="hud-user-guidance-text">
      {messageData.text.length > 0 ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Alert
            type={messageData.loading ? 'info' : 'warning'}
            message={
              <div>
                {/* {messageData.loading && <Spin style={{marginRight: '20px'}}/>} */}
                {messageData.text}
              </div>
            }
            style={{ fontSize: 'larger' }}
          />
        </div>
      ) : (
        <div />
      )}
    </div>
  );
});

export default HudUserGuidanceAlert;
