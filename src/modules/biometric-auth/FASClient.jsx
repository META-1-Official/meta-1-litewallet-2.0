import 'webrtc-adapter';
import './css/style.css';

import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState,} from 'react';
import {CloseCircleOutlined, PauseCircleOutlined, PlayCircleOutlined, SyncOutlined,} from '@ant-design/icons';
import {Button, message, Select} from 'antd';
import Webcam from 'react-webcam';
import useDevices from './hooks/useDevices';
import parseTurnServer from './helpers/parseTurnServer';
import calculateCompletionPercentage from './helpers/calculateTasksProgress';
import HudNotification from './hud/HudNotification';
import HudUserGuidanceAlert from './hud/HudUserGuidanceAlert';
import HudFaceMagnetProgress from './hud/HudFaceMagnetProgress';
import HudBitrateMonitor from './hud/HudBitrateMonitor';
import ProcessingCanvasComponent from './ProcessingCanvasComponent';
import DetectRTC from 'detectrtc';

const WSSignalingServer = process.env.REACT_APP_SIGNALIG_SERVER;

const IceServer = parseTurnServer();

console.log('ICE Turn Server', IceServer);

const FASClient = forwardRef((props, ref) => {
  message.config({
    duration: 2,
    maxCount: 1,
    rtl: true,
    getContainer: () => {
      return document.getElementById('notification-container');
    },
  });

  const webcamRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [progress, setProgress] = useState(0.0);
  const [isSupported, setIsSupported] = useState(false);

  const [dcpcbinded, setDcPcBinded] = useState(false);

  const {
    token,
    username,
    task,
    activeDeviceId,
    onComplete = () => {},
    onCancel = () => {},
    onFailure = () => {},
  } = props;

  const updateWindowWidth = () => {
    setWindowWidth(window.innerWidth);
  };

  const polite = true; // Set whether this peer is the polite peer

  const [devices, selectedDevice, setSelectedDevice] =
      useDevices(activeDeviceId);

  const [makingOffer, setMakingOffer] = useState(false);
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState([]);
  const [shouldCloseCamera, setShouldCloseCamera] = useState(false);
  const [dataChannelOpened, setDataChannelOpened] = useState(false);
  const [webCamStream, setWebCamStream] = useState(false);
  const [wsOpened, setWsOpened] = useState(false);

  const [loading, setLoading] = useState(false);
  const [currentStream, setCurrentStream] = useState('empty');

  const ws = useRef(null);
  const pc = useRef(null);
  const dc = useRef(null);
  const notificationRef = useRef();
  const hudUserGuidanceAlertRef = useRef();
  const hudFacemagnetRef = useRef();
  const hudBirateMonitorRef = useRef();

  const processingCanvasComponentref = useRef(null);
  // const preloadCanvasRef = useRef(null);
  const emptyStreamRef = useRef(null);

  const checkAndAddDir = (description) => {
    // if (!description.sdp.includes('a=sendrecv')) {
    //     description.sdp = description.sdp.replace(/(m=application[\s\S]*?)(a=)/, '$1a=sendrecv\r\n$2');
    // }
    return description;
  };

  useEffect(() => {
    if (emptyStreamRef.current && wsOpened) {
      beginSession();
    }
  }, [webCamStream, wsOpened]);

  const bindWSEvents = () => {
    ws.current.onclose = (event) => {
      console.log('WS Closed', event);
      setWsOpened(false);
    };
    ws.current.onerror = (event) => {
      console.log('WS error', event);
      setWsOpened(false);
    };

    ws.current.onopen = (event) => {
      console.log('WS Opened', event);
      pc.current = new RTCPeerConnection({
        iceServers: IceServer,
        // iceTransportPolicy: 'relay',
        iceCandidatePoolSize: 10,
      });

      setWsOpened(true);
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
                token: token,
                task: task,
              }),
          );
        }
      } else if (msg.candidate) {
        try {
          if (Boolean(String(msg.candidate.candidate).trim().length))
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
    console.log('MSG: ', msg);
    if (
        typeof msg.type !== 'undefined' &&
        ['success', 'error', 'info', 'warning'].indexOf(String(msg.type)) !== -1
    ) {
      notificationRef.current.showNotification(
          msg.message,
          msg.type.toLowerCase(),
      );
      if (
          msg.type === 'success' &&
          ['Verification successful!!', 'Biometric Enrollment Successful'].includes(
              msg.message,
          )
      ) {
        console.log('Message: ', msg);
        // message.success(msg.message, 10000);
        hudUserGuidanceAlertRef.current.clear();
        onComplete(msg.token);
      } else if (
          (msg.type === 'error' &&
              (msg.message === 'Timed out, try again' ||
                  msg.message === 'Liveness failed, move your face')) ||
          (msg.type === 'warning' && msg.message === 'Liveliness check failed!!!')
      ) {
        hudUserGuidanceAlertRef.current.clear();
        // message.error(msg.message, 10000);
        onFailure(msg.message);
      }
    } else if (typeof msg.type !== 'undefined' && msg.type === 'data') {
      console.log('log', msg);
      hudUserGuidanceAlertRef.current.updateData(msg.message);

      if (webcamRef.current && webcamRef.current.video) {
        const video = webcamRef.current.video;
        if (video.videoWidth && video.videoHeight) {
          hudFacemagnetRef.current.setOriginalWidth(video.videoWidth);
          hudFacemagnetRef.current.setOriginalHeight(video.videoHeight);
        }
      }

      hudFacemagnetRef.current.setData(msg.message);
      setLogs((prevLogs) => [...prevLogs, { msg, timestamp: new Date() }]);
    } else if (typeof msg.type !== 'undefined' && msg.type === 'task-state') {
      hudFacemagnetRef.current.setTaskState(msg.state);
    }

    if (
        typeof msg.type !== 'undefined' &&
        msg.type === 'msg' &&
        msg.message.fas === 'stop'
    ) {
      forceCleanUp();
      hudUserGuidanceAlertRef.current.clear();
      setConnected(false);
    }

    if (
        typeof msg.type !== 'undefined' &&
        msg.type === 'info' &&
        msg.message === 'Session completed!!!'
    ) {
      forceCleanUp();
      hudUserGuidanceAlertRef.current.clear();
      setConnected(false);
    }
  };

  const openAndBindDCEvents = () => {
    dc.current = pc.current.createDataChannel('hotline', {
      ordered: false,
      maxPacketLifetime: 500,
    });

    dc.current.onclose = () => {
      setDataChannelOpened(false);
      __unload();
      __load();
      console.log('data channel closed');
    };

    dc.current.onopen = () => {
      setDataChannelOpened(true);
      console.log('data channel opened');
    };

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
      // remoteVideoRef.current = event.streams[0];
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
                token: token,
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

  const addOrReplaceTrack = async (track, stream) => {
    console.log(track);

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
    if (pc.current) {
      if (pc.current.connectionState === 'connected') {
        sendMessageToServer({
          type: 'msg',
          message: { fas: 'start', token: token, task: task },
        });
      } else {
        pc.current.onconnectionstatechange = (event) => {
          console.log('Current connection state', pc.current.connectionState);

          if (pc.current.connectionState === 'connected') {
            sendMessageToServer({
              type: 'msg',
              message: { fas: 'start', token: token, task: task },
            });
          }
        };
      }
    }
  };

  const __unload = () => {
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

    // if (token !== null) {
    // 	token = null;
    // }
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
    // message.info('Disconnected forcefully, Please reload!!!', 9999999);
  }

  const toggleConnected = () => {
    setConnected(!connected);
  };

  const loadDetectRTC = () => {
    return new Promise((resolve) => {
      DetectRTC.load(() => {
        resolve();
      });
    });
  };

  const checkForSupport = async () => {
    console.log(DetectRTC);
    if (
        DetectRTC.isWebRTCSupported === false ||
        DetectRTC.isWebSocketsSupported === false ||
        DetectRTC.isCanvasSupportsStreamCapturing === false
    ) {
      notificationRef.current.showNotification(
          'Biometric is not supported on this browser',
          'error',
      );
      return false;
    }

    if (DetectRTC.hasWebcam === false) {
      notificationRef.current.showNotification(
          "Your device doesn't seems to have a camera, We need camera enabled device to proceed with biometric authentication",
          'error',
      );
      return false;
    }

    if (DetectRTC.isWebSocketsBlocked === true) {
      notificationRef.current.showNotification(
          'Your device seems to be blocking websocket connections, please restart your browser and your system if the problem persists',
          'error',
      );
      return false;
    }

    try {
      await navigator.mediaDevices
          .getUserMedia({video: true})
    } catch (e) {
      console.log("Video device issue ==> ", e)
      notificationRef.current.showNotification(
          'Failed to get video stream from your webcam, please restart your browser and your system if the problem persists',
          'error',
      );
      return false
    }
    await loadDetectRTC();

    if (DetectRTC.isWebsiteHasWebcamPermissions === false) {
      notificationRef.current.showNotification(
          "We don't have camera permissions yet, please allow camera permissions to proceed",
          'warning',
      );
      return false;
    }

    return true;
  };

  const __load = () => {
    loadDetectRTC().then(() => {
      checkForSupport().then((supported) => {
        if (supported) {
          setIsSupported(supported);
          // Wait for camera permissions, then begin
          connect();

          console.log('Started FAS Loading!!!');

          setTimeout(() => {
            forceCleanUp();
          }, 30000); // 5 Mins
        } else {
          __unload();
        }
      });
    });
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
      console.log('Token set', token);
      start();
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
    unload: __unload,
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

  const onProcessingTrackReady = (track, stream) => {
    console.log('FASC', 'processing track is ready');
    addOrReplaceTrack(track, stream).then(() => {
      setCurrentStream('empty');

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

      if (!dcpcbinded) {
        openAndBindDCEvents();
        bindRTCEvents();

        setDcPcBinded(true);
      }
    });
  };

  const beginSession = () => {
    console.log('Beginning session', emptyStreamRef.current);

    processingCanvasComponentref.current.updateOriginalStream(
        emptyStreamRef.current,
    );

    hudBirateMonitorRef.current.setPc(pc.current);
  };

  const getCanvasWidth = () => {
    if (!document.getElementsByClassName('camera-container').length) return 0;
    const width = parseInt(
        getComputedStyle(document.getElementsByClassName('camera-container')[0])
            .width,
    );
    // console.log("Canvas Width", width)
    return width;
  };

  const getCanvasHeight = () => {
    if (!document.getElementsByClassName('camera-container').length) return 0;
    const height = parseInt(
        getComputedStyle(document.getElementsByClassName('camera-container')[0])
            .height,
    );
    // console.log("Canvas Height", height)
    return height;
  };

  return (
      <div>
        <div className="FASClient" style={{ maxWidth: '900px', margin: 'auto' }}>
          <div
              style={{ maxWidth: '900px', margin: 'auto', position: 'relative' }}
          >
            <div>
              <div style={{ marginTop: 15, position: 'relative', zIndex: 1 }}>
                {devices.length > 0 ? (
                    <Select
                        style={{ width: '100%' }}
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
                    bottom: 10,
                    left: 0,
                    zIndex: 1,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
              >
                <Button
                    // type="success"
                    icon={
                      connected ? <PauseCircleOutlined /> : <PlayCircleOutlined />
                    }
                    onClick={toggleConnected}
                    style={{
                      background: '#07bc0c',
                      outline: 'none',
                      width: 100,
                      color: 'white',
                      border: 'none',
                      height: 40,
                      fontWeight: 600,
                    }}
                    disabled={!dataChannelOpened}
                >
                  {connected ? 'Stop' : 'Start'}
                </Button>
              </div>

              {/* {!!progress && (
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
                }}
              >
                <Loader />
              </div>
            )} */}

              <div
                  className="camera-container"
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    height: 640,
                    backgroundColor: '#f0f0f0',
                    position: 'relative',
                    margin: '0 auto',
                  }}
              >
                <Button
                    className="btn_refresh"
                    icon={<SyncOutlined />}
                    onClick={() => {
                      const currentUrl = window.location.href;
                      window.location.href = currentUrl;
                    }}
                ></Button>
                <Button
                    className="btn_close"
                    icon={<CloseCircleOutlined />}
                    onClick={() => onCancel()}
                ></Button>
                {isSupported && (
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
                        videoConstraints={{
                          deviceId: selectedDevice,
                        }}
                        onUserMedia={() => {
                          console.log('On user media called');
                          const interval = setInterval(() => {
                            console.log(webcamRef.current);
                            if (typeof webcamRef.current.video === 'undefined') {
                              console.log('Video element not rendered');
                              return;
                            }

                            const video = webcamRef.current.video;

                            if (
                                typeof video === 'undefined' ||
                                !video ||
                                typeof video.srcObject === 'undefined' ||
                                !video.srcObject.active
                            ) {
                              console.log('Video element is not ready yet');
                              return;
                            }

                            const stream = video.srcObject;

                            if (
                                typeof stream === 'undefined' ||
                                !stream ||
                                stream.getVideoTracks().length <= 0
                            ) {
                              console.log('Stream is not ready yet');
                              return;
                            }

                            const track = stream.getVideoTracks()[0];

                            if (
                                typeof track === 'undefined' ||
                                track.readyState !== 'live'
                            ) {
                              console.log('Track is not ready yet');
                              return;
                            }

                            console.log(
                                'Video, Stream and Track is ready, Hooking stream to WebRTC',
                            );

                            clearInterval(interval);

                            const currentSettings = track.getSettings();

                            console.log('Video:', video);
                            console.log('Current stream:', stream);
                            console.log('Current track:', track);
                            console.log('Current settings:', currentSettings);
                            emptyStreamRef.current = stream;

                            setTimeout(() => {
                              hudFacemagnetRef.current.setCanvasWidth(
                                  getCanvasWidth(),
                              );
                              hudFacemagnetRef.current.setCanvasHeight(
                                  getCanvasHeight(),
                              );
                            }, 1000);

                            setWebCamStream(stream);
                          }, 100);
                        }}
                        onUserMediaError={() => {
                          setWebCamStream(false);
                        }}
                    />
                )}

                <div id="hud-bitrate-monitor">
                  <HudBitrateMonitor
                      ref={hudBirateMonitorRef}
                  ></HudBitrateMonitor>
                </div>

                <div
                    id="hud-facemagnet-container"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                    }}
                >
                  <HudFaceMagnetProgress ref={hudFacemagnetRef} />
                </div>
                <div
                    id="notification-container"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      paddingTop: '7%',
                      width: '100%',
                      height: '100%',
                    }}
                ></div>
                <div
                    id="hud-notification-container"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                    }}
                >
                  <HudNotification ref={notificationRef} duration={1000} />
                </div>
                <div
                    id="hud-user-guidance-text-container"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                    }}
                >
                  <HudUserGuidanceAlert ref={hudUserGuidanceAlertRef} />
                </div>

                <div
                    id="hud-processing-canvas-component"
                    style={{
                      display: 'none',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                    }}
                >
                  <ProcessingCanvasComponent
                      onTrackReady={onProcessingTrackReady}
                      ref={processingCanvasComponentref}
                  />
                </div>
              </div>
              {/* <div
              className="aspect-3-2"
              style={{ position: 'absolute', top: 40, left: 0, width: '100%' }}
            >
              <ProgressScores logs={logs}></ProgressScores>
            </div> */}
            </div>
          </div>
        </div>
      </div>
  );
});

export default FASClient;
