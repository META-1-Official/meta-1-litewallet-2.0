import React, { useState, useRef, useEffect } from "react";
import MetaLoader from "../../UI/loader/Loader";
import Webcam from 'react-webcam';
import { liveLinessCheck, verify, getUserKycProfile } from "../../API/API";
import { Button } from "semantic-ui-react";
import OvalImage from '../../images/oval/oval19.png';
import MobileOvalImage from '../../images/oval/oval12.png';
import "./login.css";

export default function FaceKiForm(props) {
  const webcamRef = useRef(null);
  const [faceKISuccess, setFaceKISuccess] = useState(false);
  const [device, setDevice] = React.useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [mobileScreenSize, setMobileScreenSize] = useState({
    width: '',
    height: ''
  });
  const childDivRef = useRef();
  useEffect(
    async () => {
      let features = {
        audio: false,
        video: true
      };
      let display = await navigator.mediaDevices.getUserMedia(features);
      setDevice(display?.getVideoTracks()[0]?.getSettings());
      isMobileHandler();
      window.addEventListener('resize', isMobileHandler);
    },
    []
  );

  const isMobileHandler = () => {
    const { innerWidth: width } = window;
    const isMobile = width <= 767;
    setMobileScreenSize({
      width: childDivRef.current.clientWidth,
      height: childDivRef.current.clientHeight
    });
    setIsMobile(isMobile);
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

  const videoVerify = async () => {
    const { email, accountName, onSubmit } = props;

    setVerifying(true);
    const imageSrc = webcamRef.current.getScreenshot();
    const response_user = await getUserKycProfile(email);

    if (!response_user?.member1Name) {
      alert('Email and wallet name are not matched.');
      setVerifying(false);
      return;
    } 
    else {
      const walletArry = response_user.member1Name.split(',');

      if (!walletArry.includes(accountName)) {
        alert('Email and wallet name are not matched.');
        setVerifying(false);
        return;
      }
    };

    if (!imageSrc) {
      alert('Check your camera.');
      setVerifying(false);
      return;
    };

    var file = dataURLtoFile(imageSrc, 'a.jpg');
    const response = await liveLinessCheck(file);

    if (response.data.liveness !== 'Genuine') {
        alert('Try again by changing position or background.');
        setVerifying(false);
    } else {
      const response_verify = await verify(file);
      if (response_verify.status === 'Verify OK') {
        const nameArry = response_verify.name.split(',');

        if (nameArry.includes(email)) {
          setFaceKISuccess(true);
          setVerifying(false);
          onSubmit();
        } else {
          alert('Bio-metric verification failed for this email. Please use an email that has been linked to your biometric verification / enrollment.');
          setVerifying(false);
        }
      } else if (response_verify.status === 'Verify Failed') {
        alert('We can not verify you because you never enrolled with your face yet.');
        setVerifying(false);
      } else {
        alert('Please try again.');
        setVerifying(false);
      }
    }
  }

  return (
    <div style={{ height: "110%" }} className={"totalSumBlock"}>
      <div className='under-div'>
        <div className='header_tag'>
          <div className="webcam_div">
            <div className='header_p'>
              <h6 style={{ fontSize: '24px' }}>Authenticate Your Face</h6>
              <p className='header_ptag'>To log into your wallet, please complete biometric authentication.</p>
            </div>
            <div className='child-div' ref={childDivRef} >
              <div style={{ width: '100%', display: 'flex', height: '30px', zIndex: '5' }}>
                <div className="position-head color-black">Position your face in the oval</div>
                <button className='btn_x' onClick={() => props.setStep('userform')}>X</button>
              </div>
              {!isMobile && <img src={OvalImage} alt='oval-image' className='oval-image' />}
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={isMobile ? {
                  width: mobileScreenSize.width-10,
                  height: mobileScreenSize.height-10,
                } : { deviceId: device?.deviceId }}
                width={isMobile ? mobileScreenSize.width-20 : 500}
                height={isMobile ? mobileScreenSize.height-50 : device?.aspectRatio ? 500 / device?.aspectRatio : 385}
                mirrored
              />
              <div className='btn-div'>
                <p className='span-class color-black'>{faceKISuccess === false ? 'Press verify to log complete authentication' : 'Verification Successful!'}</p>
                <div className="btn-grp">
                  <button className={!faceKISuccess ? 'btn-1' : 'btn-disabled'} onClick={videoVerify} disabled={verifying ? true : faceKISuccess ? true : false}>{verifying ? "Verifying..." : "Verify"}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
