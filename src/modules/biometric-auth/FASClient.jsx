import 'webrtc-adapter';

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import {
  Button,
  message,
  Select
} from 'antd';
import Webcam from 'react-webcam';
import JWTAuth from './services/JWTAuth';
import CircleProgressBar from './CircleProgressBar';
import ProgressScores from './ProgressScores';
import Loader from './LoaderComponent';
import parseTurnServer from './helpers/parseTurnServer';
import calculateCompletionPercentage from './helpers/calculateTasksProgress';
import loadingImage from './helpers/loadingImage';
import getDevices from "./helpers/getDevices";
import { _black, setCanvasToDefault } from "./helpers/canvas";
import { DEFAULT_COLOR, CAMERA_CONTRAINTS, camOptions } from "./constants/constants";


const WSSignalingServer = process.env.REACT_APP_SIGNALIG_SERVER;

const IceServer = parseTurnServer();

let black = (...args) => new MediaStream([_black(...args)]);

const minCamera = CAMERA_CONTRAINTS['720p'];

const FASClient = forwardRef((props, ref) => {
  const webcamRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [progress, setProgress] = useState(0.0);
  const { token, username, task, activeDeviceId, onComplete, onFailure = () => {} } = props;

  const updateWindowWidth = () => {
    setWindowWidth(window.innerWidth);
  };

  const polite = true; // Set whether this peer is the polite peer

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(activeDeviceId || null);
  const [makingOffer, setMakingOffer] = useState(false);
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState([]);
  const [shouldCloseCamera, setShouldCloseCamera] = useState(false);

  const [loading, setLoading] = useState(false);
  const [currentStream, setCurrentStream] = useState('empty');

  const ws = useRef(null);
  const pc = useRef(null);
  const dc = useRef(null);

  const processingCanvasRef = useRef(null);
  const preloadCanvasRef = useRef(null);
  const emptyStreamRef = useRef(null);
  const localTrackRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteVideoDisplayRef = useRef(null);

  let jwtTokenRef = useRef(token);

  const jwtAuth = new JWTAuth();

  const checkAndAddDir = (description) => {
    // if (!description.sdp.includes('a=sendrecv')) {
    //     description.sdp = description.sdp.replace(/(m=application[\s\S]*?)(a=)/, '$1a=sendrecv\r\n$2');
    // }
    return description;
  };

  const bindWSEvents = () => {
    ws.current.onclose = (event) => console.log('WS Closed', event);
    ws.current.onerror = (event) => console.log('WS error', event);

    ws.current.onopen = (event) => {
      console.log('WS Opened', event);
      pc.current = new RTCPeerConnection({
        iceServers: IceServer,
        // iceTransportPolicy: 'relay',
        // iceCandidatePoolSize: 10,
      });

      emptyStreamRef.current = black(preloadCanvasRef.current);
      // if (shouldCloseCamera) {
      addOrReplaceTrack(
        emptyStreamRef.current.getTracks()[0],
        emptyStreamRef.current,
      );
      setCurrentStream('empty');
      // } else {
      // @todo
      // }

      const sender = pc.current
        .getSenders()
        .find((s) => s.track.kind === 'video');
      const parameters = sender.getParameters();

      if (!parameters.encodings) {
        parameters.encodings = [{}];
      }

      if (parameters.encodings && parameters.encodings.length > 0) {
        parameters.encodings[0].active = true;
        parameters.encodings[0].maxBitrate = 30000000; // e.g., 30 Mbps
        parameters.encodings[0].scaleResolutionDownBy = 1;
        parameters.encodings[0].priority = 'high';
      } else {
        console.warn('Encodings is not defined or empty.');
      }

      sender
        .setParameters(parameters)
        .then((success) => console.log(success))
        .catch((err) => console.log('Failed to set params'));

      openAndBindDCEvents();
      bindRTCEvents();

      // Get user media and add track to the connection
    };

    ws.current.onmessage = async (event) => {
      const msg = JSON.parse(event.data);

      if (msg.description) {
        const offerCollision =
          msg.description.type === 'offer' &&
          (makingOffer || (!polite && pc.current.signalingState !== 'stable'));

        setMakingOffer(false);

        if (offerCollision) {
          return;
        }

        const remoteOffer = new RTCSessionDescription(msg.description);
        await pc.current.setRemoteDescription(remoteOffer);

        if (msg.description.type === 'offer') {
          await pc.current.setLocalDescription();
          ws.current.send(
            JSON.stringify({
              description: checkAndAddDir(pc.current.localDescription),
              token: jwtTokenRef.current,
              task: task,
            }),
          );
        }
      } else if (msg.candidate) {
        try {
          await pc.current.addIceCandidate(msg.candidate);
        } catch (err) {
          if (!polite) {
            console.error(err);
          }
        }
      } else if (typeof msg.type !== 'undefined') {
        handleFASData(msg);
      }
    };
  };

  const handleFASData = (msg) => {
    if (
      typeof msg.type !== 'undefined' &&
      ['success', 'error', 'info', 'warning'].indexOf(String(msg.type)) !== -1
    ) {
      message[msg.type.toLowerCase()](msg.message);
      if (msg.type === 'success' && ['Verification successful!!', 'Registration successful!!!'].includes(msg.message)) {
        console.log('Message: ', msg);
        onComplete();
      } else if (msg.type === 'error' && msg.message === 'Registration failure') {
        onFailure();
      }
    } else if (typeof msg.type !== 'undefined' && msg.type === 'data') {
      console.log('log', msg);
      setLogs((prevLogs) => [...prevLogs, { msg, timestamp: new Date() }]);
    }

    if (
      typeof msg.type !== 'undefined' &&
      msg.type === 'info' &&
      msg.message === 'Session completed!!!'
    ) {
      forceCleanUp();
      setConnected(false);
    }
  };

  const openAndBindDCEvents = () => {
    dc.current = pc.current.createDataChannel('hotline', {
      ordered: false,
      maxPacketLifetime: 500,
    });

    dc.current.onclose = () => console.log('data channel closed');

    dc.current.onopen = () => console.log('data channel opened');

    dc.current.onmessage = function (event) {
      // console.log(evt.data);
      try {
        const msg = JSON.parse(event.data);
        console.log(JSON.stringify(msg));

        if (typeof msg.type !== 'undefined') {
          handleFASData(msg);
        }
      } catch (e) {
        console.error(e);
      }
    };
  };

  const bindRTCEvents = () => {
    pc.current.onsignalingstatechange = (event) => {
      console.log('Current signaling state', pc.current.signalingState);

      // if (pc.current.signalingState === "stable") {
      //     openAndBindDCEvents()
      // }
    };
    pc.current.onicegatheringstatechange = (event) =>
      console.log('Current icegathering state', pc.current.iceGatheringState);
    pc.current.oniceconnectionstatechange = (event) =>
      console.log('Current iceconnection state', pc.current.iceConnectionState);

    pc.current.onicecandidateerror = (event) =>
      console.error('ICE candidate error', event);

    pc.current.onconnectionstatechange = (event) => {
      console.log('Current connection state', pc.current.connectionState);

      if (pc.current.connectionState === 'connected') {
        setLoading(false);
        // localVideoRef.current.srcObject = localTrackRef.current;
      }
    };

    pc.current.ontrack = (event) => {
      console.log('Track received', event);
      // if (remoteVideoRef.current.srcObject) {return;
      remoteVideoRef.current = event.streams[0];
    };

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('New local candidate', event.candidate);
        ws.current.send(JSON.stringify({ candidate: event.candidate }));
      }
    };

    pc.current.onnegotiationneeded = async () => {
      console.log('Negotiations needed!!!');
      try {
        if (!makingOffer) {
          setMakingOffer(true);
          await pc.current.setLocalDescription();
          ws.current.send(
            JSON.stringify({
              description: checkAndAddDir(pc.current.localDescription),
              token: jwtTokenRef.current,
              task: task,
            }),
          );
        }
      } catch (err) {
        console.error(err);
      }
    };
  };

  const connect = () => {
    setLoading(true);
    ws.current = new WebSocket(WSSignalingServer);
    bindWSEvents();
  };

  const addWebCamToPeer = () => {
    if (currentStream !== 'usercam') {
      console.time('get track');
      navigator.mediaDevices
        .getUserMedia({
          video: {
            ...camOptions,
            deviceId: selectedDevice,
          },
        })
        .then((stream) => {
          localTrackRef.current = stream;
          addOrReplaceTrack(stream.getVideoTracks()[0], stream);
          setCurrentStream('usercam');
          remoteVideoDisplayRef.current.srcObject = stream;
          // remoteVideoDisplayRef.current.srcObject = remoteVideoRef.current
          remoteVideoDisplayRef.current.play();
          console.timeEnd('get track');
        })
        .catch((error) => console.log(error));
    } else {
      remoteVideoDisplayRef.current.srcObject = localTrackRef.current;
      remoteVideoDisplayRef.current.play();
      // remoteVideoDisplayRef.current.srcObject = remoteVideoRef.current
    }
  };

  const addOrReplaceTrack = (track, stream) => {
    const senders = pc.current.getSenders();

    const videoSender = senders.find(
      (sender) => sender.track && sender.track.kind === 'video',
    );
    if (videoSender) {
      console.log('Replacing track!!!!', track.readyState);
      videoSender
        .replaceTrack(track)
        .then((r) => {
          console.log('Track replaced');
        })
        .catch((e) => console.log(e));
    } else {
      // If there was no previous video track to replace, just add the new one
      console.log('Adding track!!!!', track.readyState);
      pc.current.addTrack(track, stream);
    }
  };

  const stop = () => {
    console.log('@1 STOP');
    setLoading(false);
    remoteVideoDisplayRef.current.srcObject = null;
    setCanvasToDefault(processingCanvasRef);

    if (pc.current && emptyStreamRef.current) {
      sendMessageToServer({ type: 'msg', message: { fas: 'stop' } });
      let currentTrack = null;
      const currentSender = pc.current
        .getSenders()
        .find((sender) => sender.track && sender.track.kind === 'video');
      if (currentSender) {
        currentTrack = currentSender.track;
      }

      if (shouldCloseCamera) {
        addOrReplaceTrack(
          emptyStreamRef.current.getTracks()[0],
          emptyStreamRef.current,
        );
      }

      if (currentTrack) {
        // Close current webcam video track
        if (shouldCloseCamera) {
          currentTrack.stop();
        }
      }
    }
  };

  const start = () => {
    setLoading(true);
    // remoteVideoDisplayRef.current.srcObject = remoteVideoRef.current
    requestAnimationFrame(renderFrame);
    if (pc.current) {
      if (pc.current.connectionState === 'connected') {
        addWebCamToPeer();
        sendMessageToServer({
          type: 'msg',
          message: { fas: 'start', token: jwtTokenRef.current, task: task },
        });
      } else {
        pc.current.onconnectionstatechange = (event) => {
          console.log('Current connection state', pc.current.connectionState);

          if (pc.current.connectionState === 'connected') {
            addWebCamToPeer();
            sendMessageToServer({
              type: 'msg',
              message: { fas: 'start', token: jwtTokenRef.current, task: task },
            });
          }
        };
      }
    }
  };

  const disconnect = () => {
    // Close ws connection
    if (ws.current !== null) {
      ws.current.close();
      ws.current = null;
    }

    if (dc.current !== null) {
      dc.current.close();
      dc.current = null;
    }

    // Close RTC
    if (pc.current !== null) {
      pc.current.getSenders().forEach((sender) => {
        if (sender.track) sender.track.stop();
      });
      pc.current.getReceivers().forEach((receiver) => {
        if (receiver.track) receiver.track.stop();
      });

      // Close all transceivers
      pc.current.getTransceivers().forEach((transceiver) => {
        if (transceiver.stop) transceiver.stop();
      });

      // Close the peer connection (including ICE)
      pc.current.close();
      pc.current = null;

      setLoading(false);
    }

    if (jwtTokenRef.current !== null) {
      jwtTokenRef.current = null;
    }
  };

  const sendMessageToServer = (message) => {
    message = JSON.stringify(message);
    if (dc.current && dc.current.readyState === 'open') {
      dc.current.send(message);
    } else if (ws.current) {
      ws.current.send(message);
    } else {
      console.log(`Couldn't send message, no channel open: ${message}`);
    }
  };

  function forceCleanUp() {
    // disconnect();
    message.info('Disconnected forcefully, Please reload!!!', 9999999);
  }

  function renderFrame() {
    const canvasContext = processingCanvasRef.current.getContext('2d');

    if (
      remoteVideoDisplayRef.current.networkState ===
      remoteVideoDisplayRef.current.NETWORK_LOADING
    ) {
      // console.count("The user agent is actively trying to download data.")
    }

    if (
      remoteVideoDisplayRef.current.readyState <
      remoteVideoDisplayRef.current.HAVE_FUTURE_DATA
    ) {
      // console.count("There is not enough data to keep playing from this point")
    }

    if (
      remoteVideoDisplayRef.current.readyState ===
      remoteVideoDisplayRef.current.HAVE_ENOUGH_DATA
    ) {
      canvasContext.clearRect(
        0,
        0,
        processingCanvasRef.current.width,
        processingCanvasRef.current.height,
      );
      // console.count("Rendered Frames")
      canvasContext.drawImage(
        remoteVideoDisplayRef.current,
        0,
        0,
        processingCanvasRef.current.width,
        processingCanvasRef.current.height,
      );

      // Get if the image is static or what
      const imageData = canvasContext.getImageData(
        0,
        0,
        processingCanvasRef.current.width,
        processingCanvasRef.current.height,
      );
      const pixels = imageData.data;

      let redTotal = 0;
      const pixelCount = pixels.length / 4; // Since each pixel is represented by 4 values (R, G, B, A)

      for (let i = 0; i < pixels.length; i += 4) {
        redTotal += pixels[i];
      }

      const avgRed = redTotal / pixelCount;

      // console.log(`Average Color: r(${Math.round(avgRed)})`);

      if (avgRed !== DEFAULT_COLOR) {
        // Get the transformation matrix
        const transform = canvasContext.getTransform
          ? canvasContext.getTransform()
          : canvasContext.currentTransform;

        // Check if it's flipped horizontally
        const isFlipped = transform.a === -1;

        if (!isFlipped) {
          canvasContext.translate(processingCanvasRef.current.width, 0);
          canvasContext.scale(-1, 1);
        }

        // console.log("Frame Arrived!!!!!")
        setLoading(false);
      }

      // Draw the oval

      let ovalWidth = 400; // Configurable width of the oval
      let ovalHeight = 600; // Configurable height of the oval

      // Draw the translucent overlay
      canvasContext.beginPath();
      canvasContext.rect(
        0,
        0,
        processingCanvasRef.current.width,
        processingCanvasRef.current.height,
      );

      // Draw the inner oval
      canvasContext.moveTo(
        processingCanvasRef.current.width / 2 + ovalWidth / 2,
        processingCanvasRef.current.height / 2,
      );
      canvasContext.ellipse(
        processingCanvasRef.current.width / 2,
        processingCanvasRef.current.height / 2,
        ovalWidth / 2,
        ovalHeight / 2,
        0,
        0,
        Math.PI * 2,
        false,
      );

      // Set translucent fill style and fill using evenodd rule
      canvasContext.fillStyle = 'rgba(255, 255, 255, 0.7)';
      canvasContext.fill('evenodd');
    }
    setTimeout(() => {
      requestAnimationFrame(renderFrame);
    }, 50);
  }

  const toggleConnected = () => {
    setConnected(!connected);
  };

  const handleKeepWebCamOpenSwitchChange = (value, event) => {
    setShouldCloseCamera(value);
  };

  const __load = () => {
    getDevices(setDevices, setSelectedDevice, shouldCloseCamera).then((r) => {
      console.log(devices);
    });
    connect();
    setCanvasToDefault(processingCanvasRef);

    setTimeout(() => {
      forceCleanUp();
    }, 30000); // 5 Mins
  };

  const __start = () => {
    console.log('Connecting');

    if (!selectedDevice) {
      message['error']('No camera selected/found');
      return toggleConnected();
    }

    if (!username) {
      message['error'](
        'Username required, Username should be at-least 3 char long',
      );
      return toggleConnected();
    }

    if (username.length < 3) {
      message['error'](
        'Invalid username, Username should be at-least 3 char long',
      );
      return toggleConnected();
    } else {
      jwtAuth.createToken(username).then((token) => {
        jwtTokenRef.current = token;
        console.log('Token Generated and set', token);
        start();
      });
    }
  };

  const __stop = () => {
    console.log('Disconnecting');
    stop();
  };

  useImperativeHandle(ref, () => ({
    load: __load,
    start: __start,
    stop: __stop,
  }));

  useEffect(() => {
    window.addEventListener('resize', updateWindowWidth);
    return () => {
      window.removeEventListener('resize', updateWindowWidth);
    };
  }, []);

  useEffect(() => {
    if (connected) {
      __start();
    } else {
      __stop();
    }
  }, [connected]);

  useEffect(() => {
    if (selectedDevice && !shouldCloseCamera) {
      setCurrentStream('altcam');
      addWebCamToPeer();
    }
  }, [selectedDevice]);

  useEffect(() => {
    const data = logs[logs.length - 1]?.msg;
    if (data && data?.type === 'data') {
      const tasks = data?.message;
      const progress = calculateCompletionPercentage(tasks);
      console.log('SCORE: ', progress);
      console.log('!!!!!!!!!!!!!!', tasks);
      setProgress(progress);
    }
  }, [logs]);

  return (
    <div>
      <div className="FASClient" style={{ maxWidth: '100vw', margin: '0 auto' }}>
        <div style={{ width: '100%' }}>
          <div>
            <div style={{ marginTop: 15, position: 'relative', zIndex: 1 }}>
              {devices.length > 0 ? (
                <Select
                  style={{ width: 200 }}
                  placeholder="Please select a camera"
                  value={selectedDevice}
                  onChange={(value) => setSelectedDevice(value)}
                  options={devices.map((device, index) => {
                    return {
                      value: device.deviceId,
                      label: device.label || `Camera #${index + 1}`,
                    };
                  })}
                />
              ) : null}
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                zIndex: 1,
                width: '100%',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Button
                type="primary"
                icon={
                  connected ? <PauseCircleOutlined /> : <PlayCircleOutlined />
                }
                onClick={toggleConnected}
              >
                {connected ? 'Stop' : 'Start'}
              </Button>
            </div>

            <div style={{ display: 'none' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: 360,
                  height: 640,
                  backgroundColor: '#f0f0f0',
                }}
              >
                <video
                  poster={
                    'https://designhub.co/wp-content/uploads/2020/09/startingsoon13-1.jpg'
                  }
                  ref={remoteVideoDisplayRef}
                  // autoPlay
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  hidden
                  muted
                  playsInline
                ></video>
                <canvas
                  ref={processingCanvasRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  width={360}
                  height={640}
                ></canvas>
                {loading && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 1000,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                    }}
                  >
                    <Loader />
                  </div>
                )}
              </div>
            </div>

            <div
              className="camera-container"
              style={{
                display: 'flex',
                justifyContent: 'center',
                height: 640,
                backgroundColor: '#f0f0f0',
                position: 'relative',
                margin: '0 auto',
                top: -25
              }}
            >
              <Webcam
                audio={false}
                ref={webcamRef}
                mirrored
                screenshotFormat="image/jpeg"
                className="cropped-video"
                style={{
                  width: '100%',
                  maxHeight: '100%',
                  objectFit: 'cover',
                }}
              />
              <CircleProgressBar
                width={windowWidth}
                height={640}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  objectFit: 'cover',
                }}
                progress={progress}
                backgroundLineColor="#e9e9e9"
                progressLineColor="#00DA60"
                backgroundLineSize={2}
                progressLineSize={4}
                backgroundLineLength={10}
                progressLineLength={16}
                progressLineSpacing={3}
              />
            </div>
            <div
              className="aspect-3-2"
              style={{ position: 'absolute', bottom: 0, left: 0 }}
            >
              <ProgressScores logs={logs}></ProgressScores>
            </div>
          </div>
        </div>
      </div>
      <canvas
        ref={preloadCanvasRef}
        width={360}
        height={640}
        style={{ display: 'none' }}
      ></canvas>
    </div>
  );
});

export default FASClient;
