import React, { useEffect, useState } from "react";
import { UserInformationForm } from "./UserInformationForm.js";
import SubmitForm from "./SubmitForm.js";
import createAccountWithPassword, { generateKeyFromPassword } from "../../lib/createAccountWithPassword.js";
import { Button } from "semantic-ui-react";
import RightSideHelpMenuFirstType from "../RightSideHelpMenuFirstType/RightSideHelpMenuFirstType";
import { PrivateKey, ChainStore } from "meta1-vision-js";
import { checkOldUser, updateUserKycProfile, getUserKycProfile, getESigToken } from "../../API/API";

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
    onBackClick,
    openLogin
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
      setAccountName(localStorage.getItem('loginData'));
      setPassword(localStorage.getItem('password'));
      setFirstName(localStorage.getItem('firstname'));
      setLastName(localStorage.getItem('lastname'));
      setPhone(localStorage.getItem('phone'));
      setEmail(localStorage.getItem('email'));
      setStep('signature');
    }
  }, []);

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

    if (!token || token.error === true) return;
    if (!response_user) return;

    let member1Name = "";

    if (response_user.member1Name) {
      let nameArry = response_user.member1Name.split(',');
      if (nameArry.includes(accountName)) {
        member1Name = response_user.member1Name;
      } else {
        member1Name = response_user.member1Name + "," + accountName
      }
    } else {
      member1Name = accountName;
    }

    try {
      const res_update = await updateUserKycProfile(email, { member1Name }, token);
      if (res_update.error === true) {
        return;
      } else if (res_update) {
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
      } else {
        return;
      }

    } catch (e) {
      console.error('[stepLastSubmit]', e);
    }
  };

  const getPrivateKeys = (accountName, password) => {
    let passwordKeys = {};
    const acc = ChainStore.getAccount(accountName, false);
    let fromWif;
    try {
      fromWif = PrivateKey.fromWif(password);
    } catch (err) {
      console.log('Err in validate', err);
    }

    if (fromWif) {
      const key = {
        privKey: fromWif,
        pubKey: fromWif.toPublicKey().toString()
      };

      if (acc)
        ['active', 'owner', 'memo'].forEach((role) => {
          if (acc) {
            if (role === 'memo') {
              if (acc.getIn(['options', 'memo_key']) == key.pubKey)
                passwordKeys[role] = key;
              else {
                passwordKeys[role] = {
                  pubKey: acc.getIn(['options', 'memo_key'])
                };
              }
            } else {
              acc.getIn([role, 'key_auths']).forEach((auth) => {
                if (auth.get(0) == key.pubKey)
                  passwordKeys[role] = key;
                else {
                  passwordKeys[role] = {
                    pubKey: auth.get(0)
                  };
                }
              });
            }
          }
        });
    } else {
      passwordKeys['active'] = generateKeyFromPassword(
        accountName,
        "active",
        password
      );
      passwordKeys['owner'] = generateKeyFromPassword(
        accountName,
        "owner",
        password
      );
      passwordKeys['memo'] = generateKeyFromPassword(
        accountName,
        "memo",
        password
      );
    }
    return passwordKeys;
  }

  const createPaperWalletHandler = async () => {
    setDownloadPaperWalletModal(false);
    await sleepHandler(5000);
    // Generate owner, memo and active Key
    await Meta1.login(accountName, password);
    let keys = getPrivateKeys(accountName, password);
    createPaperWalletAsPDF(
      accountName,
      keys['owner'],
      keys['active'],
      keys['memo']
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
          setIsSubmitted={setIsSubmitted}
          setStep={setStep} />
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
          setIsSubmitted={setIsSubmitted}
          setStep={setStep} />
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
      const { privKey } = await openLogin.login({
        loginProvider: "",
      });

      if (privKey && typeof privKey === "string") {
        const data = await openLogin.getUserInfo();

        setAuthData(data);
        setPrivKey(privKey);
        setEmail(data?.email.toLowerCase());
        setLoader(false);
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
