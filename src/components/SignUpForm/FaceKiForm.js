import React, { useState, useRef, useEffect } from "react";
import MetaLoader from "../../UI/loader/Loader";
import Webcam from 'react-webcam';
import { livenessCheck, verify, enroll, remove, getUserKycProfile, postUserKycProfile } from "../../API/API";
import { Button } from "semantic-ui-react";
import OvalImage from '../../images/oval/oval19.png';
import MobileOvalImage from '../../images/oval/oval19.png';
import {isMobile} from "react-device-detect";
import { Icon, Modal } from "semantic-ui-react";
import QRCodeModal from "../../UI/loader/QRCodeModal";
import "./SignUpForm.css";

export default function FaceKiForm(props) {
  const webcamRef = useRef(null);
  const [faceKISuccess, setFaceKISuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [device, setDevice] = React.useState({});
  const [qrOpen, setQrOpen] = useState(false);
  const [mobileScreenSize, setMobileScreenSize] = useState({
    width: '',
    height: ''
  });
  const childDivRef = useRef();

  useEffect(() => {
    loadVideo(true);
  }, []);

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

  const checkAndEnroll = async (photoIndex) => {
    const { privKey, email } = props;
    if (!email || !privKey) return;

    setVerifying(true);

    const imageSrc = webcamRef.current.getScreenshot({
      width: 1280,
      height: 720,
    });

    if (!imageSrc) {
      alert('Please check your camera.');
      setVerifying(false);
      return;
    }

    const file = await dataURL2File(imageSrc, 'a.jpg');
    const response = await livenessCheck(file);

    if (!response) {
      alert('Something went wrong from Biometric server.');
      setVerifying(false);
      return;
    }

    if (response.data.liveness !== 'Genuine' && photoIndex === 5) {
      alert('Try again by changing position or background.');
      setVerifying(false);
    } else if (response.data.liveness === 'Genuine') {
      await faceEnroll(file);
    } else {
      await checkAndEnroll(photoIndex + 1);
    }
  }

  const faceEnroll = async (file) => {
    const { privKey, email } = props;

    const response_verify = await verify(file);
    if (response_verify.status === 'Verify OK') {
      const nameArry = response_verify.name.split(',');

      if (nameArry.includes(email)) {
        alert('You already enrolled and verified successfully.');
        setFaceKISuccess(true);
      } else {
        const response_user = await getUserKycProfile(email);
        if (response_user.error === true) {
          alert('Something went wrong.');
          setVerifying(false);
        } else if (response_user) {
          alert('This email already has been used for another user.');
          setVerifying(false);
        } else {
          const newName = response_verify.name + "," + email;

          if (!newName) {
            alert('Can not generate new name!');
            setVerifying(false);
          } else {
            const response_enroll = await enroll(file, newName);
            if (response_enroll.status === 'Enroll OK') {
              await remove(response_verify.name);
              const add_response = await postUserKycProfile(email, `usr_${email}_${privKey}`);
              if (add_response.result) {
                setFaceKISuccess(true);
              } else {
                alert('Something went wrong.');
                setVerifying(false);
              }
            } else {
              alert('Something went wrong.');
              setVerifying(false);
            }
          }
        }
      }
    } else if (response_verify.status === 'Verify Failed' || response_verify.status === 'No Users') {
      const response_user = await getUserKycProfile(email);
      if (response_user.error === true) {
        alert('Something went wrong.');
        setVerifying(false);
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
                <img src={isMobile ? MobileOvalImage : OvalImage} alt='oval-image' className='oval-image' />
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  mirrored
                />
                <div className='btn-div'>
                  <p className='span-class color-black margin-bottom-zero'>{faceKISuccess === false ? 'Press verify to begin enrollment' : 'Verification Successful!'}</p>
                  <span className={`span-class color-black margin-bottom-zero ${isMobile ? 'camera-text-font-size' : ''}`}>
                    Min camera resolution must be 720p
                  </span>
                  <span className={`span-class color-black margin-bottom-zero ${isMobile ? 'camera-text-font-size' : ''}`}>
                    Verifying will take 10 seconds as maximum.
                  </span>
                  <div className="btn-grp" style={{ marginTop: '5px' }}>
                    {/* {!faceKISuccess && <button className='btn-1' onClick={photo ? resetPhoto : takePhoto} style={{ "marginRight": '20px' }} disabled={takingPhoto}>{photo ? "Reset Photo" : takingPhoto ? "Taking Photo..." : "Take Photo"}</button>} */}
                    {/* {photo && <button className='btn-1' disabled={verifying && !faceKISuccess} onClick={faceKISuccess ? onClickNext : videoEnroll}>{verifying ? "Verifying..." : faceKISuccess ? "Next" : "Verify"}</button>} */}
                    <button className='btn-1' disabled={verifying} onClick={() => checkAndEnroll(0)}>{verifying ? "Verifying..." : "Verify"}</button>
                    {/* {!photo && <button className='btn-1' style={{ "marginLeft": '20px' }} onClick={() => setQrOpen(true)}>Take Photo via Mobile</button>} */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* qrOpen && <QRCodeModal
        open={qrOpen}
        setOpen={(val) => setQrOpen(val)}
        acc={props.accountName}
        email={props.email}
        setPhoto={(val) => setPhoto(val)}
      />*/}
    </>
  )
}
