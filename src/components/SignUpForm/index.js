import React, { useEffect, useState } from "react";
import { UserInformationForm } from "./UserInformationForm.js";
import SubmitForm from "./SubmitForm.js";
import createAccountWithPassword, { generateKeyFromPassword } from "../../lib/createAccountWithPassword.js";
import { Button } from "semantic-ui-react";
import RightSideHelpMenuFirstType from "../RightSideHelpMenuFirstType/RightSideHelpMenuFirstType";

import { checkOldUser, updateUserKycProfile, getUserKycProfile, getESigToken } from "../../API/API";
import OpenLogin from '@toruslabs/openlogin';

import "./SignUpForm.css";
import FaceKiForm from "./FaceKiForm.js";
import MigrationForm from "./MigrationForm.js";
import { createPaperWalletAsPDF } from "../PaperWalletLogin/CreatePdfWallet.js";
import { sleepHandler } from "../../utils/common.js";
import Meta1 from "meta1-vision-dex";
import ModalTemplate from "./Modal.jsx";
import MetaLoader from "../../UI/loader/Loader.js";

export default function SignUpForm(props) {
  const {
    onRegistration,
    onClickExchangeEOSHandler,
    onClickExchangeUSDTHandler,
    portfolio,
    isSignatureProcessing,
    signatureResult,
    onBackClick
  } = props;

  const [accountName, setAccountName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [phoneFormat, setPhoneFormat] = useState('');
  const [country, setCountry] = useState("");
  const [selectedCountryObj, setSelectedCountryObj] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState('userform');
  const [authData, setAuthData] = useState(null);
  const [privKey, setPrivKey] = useState(null);
  const [downloadPaperWalletModal, setDownloadPaperWalletModal] = useState(false);
  const [copyPasskeyModal, setCopyPasskeyModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { innerWidth: width } = window;
  const [loader, setLoader] = useState(false);
  const isMobile = width <= 678;
  useEffect(() => {
    if (isSignatureProcessing) {
      setAccountName(localStorage.getItem('login'));
      setPassword(localStorage.getItem('password'));
      setFirstName(localStorage.getItem('firstname'));
      setLastName(localStorage.getItem('lastname'));
      setPhone(localStorage.getItem('phone'));
      setEmail(localStorage.getItem('email'));
      setStep('signature');
    }
  }, []);

  const openLogin = new OpenLogin({
    clientId: process.env.REACT_APP_TORUS_PROJECT_ID,
    network: process.env.REACT_APP_TORUS_NETWORK,
    uxMode: 'popup',
    whiteLabel: {
      name: 'META1'
    },
  });

  const stepUserInfoSubmit = async (
    accName,
    pass,
    newPhone,
    newLastName,
    newFirstName,
    newPhoneFormat,
    newCountry,
    newSelectedCountryObj
  ) => {
    setLoader(true);
    setAccountName(accName);
    setFirstName(newFirstName);
    setPassword(pass);
    setLastName(newLastName);
    setPhone(newPhone);
    setPhoneFormat(newPhoneFormat);
    setCountry(newCountry);
    setSelectedCountryObj(newSelectedCountryObj);
    localStorage.removeItem('access');
    localStorage.removeItem('recover');
    localStorage.removeItem('stored');
    localStorage.removeItem('living');
    localStorage.removeItem('isMigrationUser');
    const response = await checkOldUser(accName);

    if (response?.found === true) {
      setLoader(false);
      setStep('migration');
    }
    else renderTorusStep();
  };

  const stepGoToTorus = (
    accName,
    pass,
    newPhone,
    newLastName,
    newFirstName
  ) => {
    setAccountName(accName);
    setFirstName(newFirstName);
    setPassword(pass);
    setLastName(newLastName);
    setPhone(newPhone);
    renderTorusStep();
  };

  const stepGoToEsignature = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('recover');
    localStorage.removeItem('stored');
    localStorage.removeItem('living');
    setStep('submit');
  };

  const stepLastSubmit = async () => {
    setCopyPasskeyModal(false);
    const response_user = await getUserKycProfile(email);
    const token = await getESigToken(email);

    if (!token) return;
    if (!response_user) return;

    try {
      console.log("innnnnnnnnnnnnnnnnn1")
      await createAccountWithPassword(
        accountName,
        password,
        false,
        "",
        1,
        "",
        phone,
        email,
        lastName,
        firstName
      );
      console.log("innnnnnnnnnnnnnnnnn2")
      const member1Name = response_user.member1Name ? response_user.member1Name + "," + accountName : accountName;
      console.log("innnnnnnnnnnnnnnnnn3")
      const res_update = await updateUserKycProfile(email, { "member1Name": member1Name }, token);

      localStorage.removeItem('password');
      localStorage.removeItem('firstname');
      localStorage.removeItem('lastname');
      localStorage.removeItem('phone');
      localStorage.removeItem('email');
      localStorage.removeItem('access');
      localStorage.removeItem('recover');
      localStorage.removeItem('stored');
      localStorage.removeItem('living');
      setDownloadPaperWalletModal(true);
    } catch (e) { }
  };

  const createPaperWalletHandler = async () => {
    setDownloadPaperWalletModal(false);
    // Generate owner, memo and active Key
    let { privKey: owner_private } = generateKeyFromPassword(
      accountName,
      "owner",
      password
    );
    let { privKey: active_private } = generateKeyFromPassword(
      accountName,
      "active",
      password
    );
    let { privKey: memo_private } = generateKeyFromPassword(
      accountName,
      "memo",
      password
    );
    await sleepHandler(5000);
    await Meta1.login(accountName, password);
    createPaperWalletAsPDF(
      accountName,
      owner_private,
      active_private,
      memo_private
    );
    onRegistration(accountName, password, email);
  }

  const renderStep = () => {
    switch (step) {
      case 'userform':
        return <UserInformationForm
          {...props}
          onSubmit={stepUserInfoSubmit}
          accountName={accountName}
          lastName={lastName}
          firstName={firstName}
          password={password}
          phone={phone}
          phoneFormat={phoneFormat}
          country={country}
          selectedCountryObj={selectedCountryObj}
        />
      case 'faceki':
        return <FaceKiForm
          {...props}
          onClick={stepGoToEsignature}
          accountName={accountName}
          lastName={lastName}
          firstName={firstName}
          password={password}
          email={email}
          privKey={privKey}
          phone={phone}
          setStep={setStep}
        />
      case 'migration':
        return <MigrationForm
          {...props}
          onClick={stepGoToTorus}
          accountName={accountName}
          lastName={lastName}
          firstName={firstName}
          password={password}
          email={email}
          privKey={privKey}
          phone={phone}
        />
      case 'submit':
        return <SubmitForm
          {...props}
          onSubmit={() => {
            setCopyPasskeyModal(true)
          }}
          accountName={accountName}
          lastName={lastName}
          firstName={firstName}
          password={password}
          privKey={privKey}
          email={email}
          phone={phone}
          isSubmitted={isSubmitted}
          setIsSubmitted={setIsSubmitted} />
      case 'signature':
        return <SubmitForm
          {...props}
          onSubmit={() => {
            setCopyPasskeyModal(true)
          }}
          accountName={accountName}
          lastName={lastName}
          firstName={firstName}
          password={password}
          privKey={privKey}
          email={email}
          signatureResult={signatureResult}
          phone={phone}
          isSubmitted={isSubmitted}
          setIsSubmitted={setIsSubmitted} />
      default:
        return null;
    }
  }

  const renderTorusStep = async () => {
    if (
      !openLogin
    ) {
      return;
    }

    try {
      await openLogin.init();
      await openLogin.login();
      if (openLogin.privKey) {
        const privKey = openLogin.privKey;
        const data = await openLogin.getUserInfo();

        setAuthData(data);
        setPrivKey(privKey);
        setEmail(data?.email);
        setLoader(false);
        console.log('User logged in');
        setStep('faceki');
      }
    } catch (error) {
      console.log('Error in Torus Render', error);
      setLoader(false);
    }
  }

  const handleBackBtn = (e) => {
    if (step == "userform") {
      onBackClick(e);
    } else if (step == "migration") {
      setStep("userform");
    } else {
      setStep("userform");
    }
  }

  if (loader) {
    return <MetaLoader size={"large"} />;
  }

  return (
    <>
      <div>
        <div
          style={{
            background: "#fff",
            width: "100%",
            height: "3.7rem",
            padding: "1.1rem 2rem",
            boxShadow: "0 9px 10px 0 rgba(0,0,0,0.11)",
            fontSize: "1.3rem",
            fontWeight: "bold",
          }}
        >
          <span style={{ color: "#240000" }}>META Lite Wallet</span>
        </div>
        <div className={"createWalletForm"}>
          <div className={"justFlexAndDirect"}>
            <div className={`regForm ${step === 'faceki' ? 'mobileRegForm' : ''}`}>
              {step !== 'signature' && <Button
                style={{ color: "#fdc000", fontSize: ".9rem" }}
                labelPosition="left"
                onClick={handleBackBtn}
              >
                <i
                  className="fal fa-arrow-left"
                  style={{ marginRight: ".5rem" }}
                />
                <span
                  style={{
                    borderBottom: "1px solid #fdc000",
                    color: "#fdc000",
                  }}
                >
                  Back
                </span>
              </Button>}
              {renderStep()}
            </div>
            <div className={"adaptThing"}>
              <RightSideHelpMenuFirstType
                onClickExchangeEOSHandler={onClickExchangeEOSHandler}
                onClickExchangeUSDTHandler={onClickExchangeUSDTHandler}
                portfolio={portfolio}
              />
            </div>
          </div>
        </div>
        {/* paper wallet modal */}
        <ModalTemplate
          onOpen={downloadPaperWalletModal}
          onClose={() => createPaperWalletHandler()}
          onSubmit={() => createPaperWalletHandler()}
          accountName={accountName}
          continueBtnText=''
          okBtnText='Download'
          text="Click Download to save your paper wallet and complete the wallet creation process."
          className="paper_wallet_modal"
          isCloseIcon={false}
        />
        {/* Copy Passkey Msg Modal modal */}
        <ModalTemplate
          onOpen={copyPasskeyModal}
          onClose={() => {
            setIsSubmitted(false);
            setCopyPasskeyModal(false);
          }}
          onContinue={() => stepLastSubmit()}
          continueBtnText='Acknowledge and Continue'
          accountName={accountName}
          text='If you forget your passkey you will NOT be able to access your wallet or your funds. We are NO LONGER able to restore, reset, or redistribute lost coins, or help with lost passkeys. Please MAKE SURE you copy your wallet name and passkey on to your computer and then transfer it to an offline storage location for easy access like a USB drive! Check our passkey storage tips knowledge article for more info <a target="__blank" href="https://support.meta1coin.vision/password-storage-tips">here</a>'
          className={`${!isMobile ? 'copy_passkey_modal' : 'copy_passkey_mobile_modal'}`}
          isCloseIcon={true}
        />
      </div>
    </>
  );
}
