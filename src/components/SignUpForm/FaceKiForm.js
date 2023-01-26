import React, { useState, useRef, useEffect } from "react";
import MetaLoader from "../../UI/loader/Loader";
import Webcam from 'react-webcam';
import { livenessCheck, verify, enroll, remove, getUserKycProfile, postUserKycProfile } from "../../API/API";
import { Button } from "semantic-ui-react";
import OvalImage from '../../images/oval/oval19.png';
import MobileOvalImage from '../../images/oval/oval11.png';
import { Icon, Modal } from "semantic-ui-react";
import QRCodeModal from "../../UI/loader/QRCodeModal";
import { useInterval } from "../../lib/useInterval";
import "./SignUpForm.css";

export default function FaceKiForm(props) {
  const webcamRef = useRef(null);
  const [faceKISuccess, setFaceKISuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [device, setDevice] = React.useState({});
  const [qrOpen, setQrOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [counter, setCounter] = useState(0);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState(null);
  const [mobileScreenSize, setMobileScreenSize] = useState({
    width: '',
    height: ''
  });
  const childDivRef = useRef();

  useEffect(() => {
    loadVideo(true);
  }, []);

  useInterval(async () => {
    if (verifying && !photo && error === "" && counter < 10) {
      await takePhoto();
    }
  }, 300);

  useEffect(() => {
    if (error !== "") {
      alert(error);
      setCounter(0);
      setPhoto(null);
      setVerifying(false);
    }
  }, [error]);

  useEffect(() => {
    verifying && setError("") && setPhoto(null);
  }, [verifying]);

  useEffect(() => {
    if (counter === 10) {
      if (!photo) {
        setError("Try again by changing position or background.");
      }
      setCounter(0);
    }
  }, [counter])

  useEffect(async () => {
    if (photo) {
      await videoEnroll();
    }
  }, [photo]);

  useEffect(() => {
    if (childDivRef?.current?.clientWidth && childDivRef?.current?.clientHeight) {
      setMobileScreenSize({
        width: childDivRef.current.clientWidth,
        height: childDivRef.current.clientHeight
      });
    }
  }, [childDivRef.current]);

  useEffect(async () => {
    if (faceKISuccess === true) {
      loadVideo(false).then(() => {
        props.onClick();
      });
    }
  }, [faceKISuccess])

  const loadVideo = async (flag) => {
    const videoTag = document.querySelector('video');
    console.log('[loadVideo]', flag, videoTag);
    const features = { audio: false, video: true };

    if (flag) {
      return navigator.mediaDevices
        .getUserMedia(features)
        .then((display) => {
          setDevice(display?.getVideoTracks()[0]?.getSettings());
          isMobileHandler();
          window.addEventListener('resize', isMobileHandler);
        })
        .finally(() => {
          return true;
        });
    } else {
      try {
        for (const track of videoTag.srcObject.getTracks()) track.stop();
        videoTag.srcObject = null;
      } catch (err) {
        console.log('[loadVideo]', err);
      }

      return Promise.resolve();
    }
  }

  const isMobileHandler = () => {
    const { innerWidth: width } = window;
    const isMobile = width <= 767;
    setIsMobile(isMobile);
  }

  const dataURL2File = async (dataurl, filename) => {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const videoEnroll = async () => {
    const { privKey, email } = props;

    var file = await dataURL2File(photo, 'a.jpg');
    const response_verify = await verify(file);
    
    if (response_verify.status === 'Verify OK') {
      const nameArry = response_verify.name.split(',');

      if (nameArry.includes(email)) {
        alert('You already enrolled and verified successfully.');
        setFaceKISuccess(true);
      } else {
        const response_user = await getUserKycProfile(email);
        if (response_user.error === true) {
          setError('Something went wrong.');
        } else if (response_user) {
          setError('This email already has been used for another user.');
        } else {
          const newName = response_verify.name + "," + email;

          if (!newName) {
            setError('Can not generate new name!');
          } else {
            const response_enroll = await enroll(file, newName);
            if (response_enroll.status === 'Enroll OK') {
              const add_response = await postUserKycProfile(email, `usr_${email}_${privKey}`);
              if (add_response.result) {
                const response_remove = await remove(response_verify.name);
                if (!response_remove) {
                  setError('Something went wrong.');
                } else {
                  alert('Successfully enrolled.');
                  setFaceKISuccess(true);
                }
              }
              else {
                setError('Something went wrong.');
              }
            } else {
              setError('Something went wrong.');
            }
          }
        }
      }
    } else if (response_verify.status === 'Verify Failed' || response_verify.status === 'No Users') {
      const response_user = await getUserKycProfile(email);
      if (response_user.error === true) {
        setError('Something went wrong.');
      } else if (response_user) {
        setError('This email already has been used for another user.');
      } else {
        const response_enroll = await enroll(file, email);
        if (response_enroll.status === 'Enroll OK') {
          const add_response = await postUserKycProfile(email, `usr_${email}_${privKey}`);
          if (add_response.result) {
            alert('Successfully enrolled.');
            setFaceKISuccess(true);
          }
          else {
            await remove(email);
            setError('Something went wrong.');
          }
        }
      }
    } else {
      setError('Please try again.');
    }
  }

  const takePhoto = async () => {
    // const imageSrc = device.width ? webcamRef.current.getScreenshot({ width: device.width, height: device.height }) : webcamRef.current.getScreenshot();
    const imageSrc = webcamRef.current.getScreenshot({ width: 1280, height: 720 });

    if (!imageSrc) {
      setError('Check your camera.');
      return;
    };

    var file = await dataURL2File(imageSrc, 'a.jpg');
    const response = file && await livenessCheck(file);

    if (!response || response.error === true) {
      setError('Biometric server is busy. Please try again after 2 or 3 seconds.');
      return;
    }

    if (response.data.liveness === 'Genuine') {
      setPhoto(imageSrc);
      // setVerifying(false);
    }

    setCounter(counter + 1);
  }

  return (
    <>
      <div style={{ marginLeft: "3rem" }} className={"totalSumBlock"}>
        <div className='under-div'>
          <div className='header_tag'>
            <div className="webcam_div">
              <div className='header_p'>
                <h6 style={{ fontSize: '24px' }}>Bio-Metric 2 Factor Authentication</h6>
                <p className='header_ptag'>Next, we will setup your Biometric two factor authentication, to ensure the security of your wallet</p>
              </div>
              <div className='child-div' ref={childDivRef} style={{ borderRadius: '5px', padding: '1px' }}>
                <div style={{ width: '100%', display: 'flex', height: '30px', zIndex: '5' }}>
                  <div className="position-head color-black">{!isMobile ? 'Position your face in the oval' : ''}</div>
                  <button className='btn_x' onClick={() => props.setStep('userform')}>X</button>
                </div>
                {!isMobile && <img src={OvalImage} alt='oval-image' className='oval-image' />}
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  const videoConstraints={isMobile ? {
                    width: mobileScreenSize.width - 10,
                    height: mobileScreenSize.height - 10,
                  } : { deviceId: device?.deviceId }}
                  width={isMobile ? mobileScreenSize.width - 20 : 550}
                  height={isMobile ? mobileScreenSize.height - 50 : device?.aspectRatio ? 550 / device?.aspectRatio : 385}
                  mirrored
                />
                <div className='btn-div'>
                  <p className='span-class color-black margin-bottom-zero'>{faceKISuccess === false ? 'Press verify to begin enrollment' : 'Verification Successful!'}</p>
                  <span className={`span-class color-black margin-bottom-zero ${isMobile ? 'camera-text-font-size' : ''}`}>
                    Min camera resolution must be 720p
                  </span>
                  <div className="btn-grp" style={{ marginTop: '5px' }}>
                    {/* {!faceKISuccess && <button className='btn-1' onClick={photo ? resetPhoto : takePhoto} style={{ "marginRight": '20px' }} disabled={takingPhoto}>{photo ? "Reset Photo" : takingPhoto ? "Taking Photo..." : "Take Photo"}</button>} */}
                    {/* {photo && <button className='btn-1' disabled={verifying && !faceKISuccess} onClick={faceKISuccess ? onClickNext : videoEnroll}>{verifying ? "Verifying..." : faceKISuccess ? "Next" : "Verify"}</button>} */}
                    <button className='btn-1' disabled={verifying} onClick={() => setVerifying(true)}>{verifying ? "Verifying..." : "Verify"}</button>
                    {/* {!photo && <button className='btn-1' style={{ "marginLeft": '20px' }} onClick={() => setQrOpen(true)}>Take Photo via Mobile</button>} */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {qrOpen && <QRCodeModal
        open={qrOpen}
        setOpen={(val) => setQrOpen(val)}
        acc={props.accountName}
        email={props.email}
        setPhoto={(val) => setPhoto(val)}
      />
      }
    </>
  )
}
