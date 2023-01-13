import React, { useState, useRef, useEffect } from "react";
import MetaLoader from "../../UI/loader/Loader";
import Webcam from 'react-webcam';
import { liveLinessCheck, verify, enroll, remove, getUserKycProfile, postUserKycProfile } from "../../API/API";
import { Button } from "semantic-ui-react";
import OvalImage from '../../images/oval/oval19.png';
import MobileOvalImage from '../../images/oval/oval11.png';
import { Icon, Modal } from "semantic-ui-react";
import "./SignUpForm.css";

export default function FaceKiForm(props) {
  const webcamRef = useRef(null);
  const [faceKISuccess, setFaceKISuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [device, setDevice] = React.useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [mobileScreenSize, setMobileScreenSize] = useState({
    width: '',
    height: ''
  });
  const childDivRef = useRef();

  useEffect(() => {
    loadVideo(true);
  }, []);

  useEffect(() => {
    if (childDivRef?.current?.clientWidth && childDivRef?.current?.clientHeight) {
      setMobileScreenSize({
        width: childDivRef.current.clientWidth,
        height: childDivRef.current.clientHeight
      });
    }
  }, [childDivRef.current]);

  const loadVideo = (flag) => {
    const videoTag = document.querySelector('video');
    console.log('[loadVideo] @10 - ', flag, videoTag);
    const features = {audio: false, video: true};

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
        console.log('[loadVideo] @104 - ', err);
      }

      return Promise.resolve();
    }
  }

  const isMobileHandler = () => {
    const { innerWidth: width } = window;
    const isMobile = width <= 767;
    setIsMobile(isMobile);
  }

  const onClickNext = () => {
    loadVideo(false).then(() => {
      props.onClick();
    });
  }

  const dataURLtoFile = (dataurl, filename) => {
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

    setVerifying(true);
    // const imageSrc = device.width? webcamRef.current.getScreenshot({width: device.width, height: device.height}) : webcamRef.current.getScreenshot();
    const imageSrc = webcamRef.current.getScreenshot({ width: 1270, height: 720 });

    if (!imageSrc) {
      alert('Check your camera');
      setVerifying(false);
      return;
    };

    setImageSrc(imageSrc);

    var file = dataURLtoFile(imageSrc, 'a.jpg');

    const response = await liveLinessCheck(file);

    if (!response || response.error === true) {
      alert('Something went wrong from Biometric server.');
      setVerifying(false);
      return;
    }

    if (response.data.liveness === 'Genuine') {
      const response_verify = await verify(file);
      if (response_verify.status === 'Verify OK') {
        const nameArry = response_verify.name.split(',');

        if (nameArry.includes(email)) {
          alert('You already enrolled and verified successfully.');
          setFaceKISuccess(true);
          setVerifying(false);
        } else {
          const response_user = await getUserKycProfile(email);
          if (response_user.error === true) {
            alert('Something went wrong.');
          } else if (response_user) {
            alert('This email already has been used for another user.');
            setVerifying(false);
          } else {
            const newName = response_verify.name + "," + email;
            const response_remove = await remove(response_verify.name);

            if (!response_remove) {
              alert('Something went wrong.');
              setVerifying(false);
            } else {
              const response_enroll = await enroll(file, newName);
              if (response_enroll.status === 'Enroll OK') {
                const add_response = await postUserKycProfile(email, `usr_${email}_${privKey}`);
                if (add_response.result) {
                  alert('Successfully enrolled.');
                  setVerifying(false);
                  setFaceKISuccess(true);
                }
                else {
                  alert('Something went wrong.');
                  setVerifying(false);
                }
              }
            }
          }
        }
      } else if (response_verify.status === 'Verify Failed' || response_verify.status === 'No Users') {
        const response_user = await getUserKycProfile(email);
        if (response_user.error === true) {
          alert('Something went wrong.');
        } else if (response_user) {
          alert('This email already has been used for another user.');
          setVerifying(false);
        } else {
          const response_enroll = await enroll(file, email);
          if (response_enroll.status === 'Enroll OK') {
            const add_response = await postUserKycProfile(email, `usr_${email}_${privKey}`);
            if (add_response.result) {
              alert('Successfully enrolled.');
              setFaceKISuccess(true);
              setVerifying(false);
            }
            else {
              await remove(email);
              alert('Something went wrong.');
              setVerifying(false);
            }
          }
        }
      } else {
        alert('Please try again.');
        setVerifying(false);
      }
    } else {
      alert('Try again by changing position or background.');
      setVerifying(false);
    }
  } 

  return (
    <div style={{ marginLeft: "3rem" }} className={"totalSumBlock"}>
      <div className='under-div'>
        <div className='header_tag'>
          <div className="webcam_div">
            <div className='header_p'>
              <h6 style={{ fontSize: '24px' }}>Bio-Metric 2 Factor Authentication</h6>
              <p className='header_ptag'>Next, we will setup your Biometric two factor authentication, to ensure the security of your wallet</p>
            </div>
            <div className='child-div' ref={childDivRef}>
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
                <div className="btn-grp">
                  <button className={!faceKISuccess ? 'btn-1' : 'btn-1 btn-disabled'} disabled={verifying ? true : faceKISuccess ? true : false} onClick={videoEnroll}>{verifying ? "Verifying..." : "Verify"}</button>
                  <Button
                    onClick={onClickNext}
                    className={faceKISuccess ? 'btn-2' : 'btn-disabled'}
                    disabled={faceKISuccess === false}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {imageSrc && props.email.includes('antman-kok') && (
            <img
              src={imageSrc}
            />
          )}
          {/* {renderQRModal()} */}
        </div>
      </div>
    </div>
  )
}
