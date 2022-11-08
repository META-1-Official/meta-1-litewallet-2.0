import React, { useState, useEffect } from "react";
import "./login.css";
import styles from "./login.module.scss";
import RightSideHelpMenuFirstType from "../RightSideHelpMenuFirstType/RightSideHelpMenuFirstType";
import { useDispatch, useSelector } from "react-redux";
import { checkAccountSignatureReset, checkTransferableModelAction, logoutRequest } from "../../store/account/actions";
import { accountsSelector, isLoginSelector, isSignatureValidSelector, loginErrorMsgSelector, oldUserSelector, signatureErrorSelector } from "../../store/account/selector";
import { checkMigrationable, migrate } from "../../API/API";
import OpenLogin from '@toruslabs/openlogin';
import FaceKiForm from "./FaceKiForm";

export default function LoginScreen(props) {
  const {
    error,
    loginDataError,
    onSubmit,
    onSignUpClick,
    portfolio,
    onClickExchangeEOSHandler,
    onClickExchangeUSDTHandler,
    setLoginDataError
  } = props;
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openVideoModal, setOpenVideoModal] = useState(false);
  const [migratable, setMigratable] = useState(false);
  const [errorAttr, setErrorAttr] = useState({login: false});
  const [checkTransfer, setCheckTransfer] = useState({
    password: '',
    showPasswordColumn: false,
    errorMsg: '',
    error: false
  });
  const [step, setStep] = useState('userform');
  const [authData, setAuthData] = useState(null);
  const [privKey, setPrivKey] = useState(null);

  const accountState = useSelector(accountsSelector);
  const isLoginState = useSelector(isLoginSelector);
  const oldUserState = useSelector(oldUserSelector);
  const signatureErrorState = useSelector(signatureErrorSelector);
  const isSignatureValidState = useSelector(isSignatureValidSelector);
  const loginErrorMsgState = useSelector(loginErrorMsgSelector);
  const dispatch = useDispatch();

  const openLogin = new OpenLogin({
    clientId: process.env.REACT_APP_TORUS_PROJECT_ID,
    network: process.env.REACT_APP_TORUS_NETWORK,
    uxMode: 'popup',
    whiteLabel: {
      name: 'META1'
    },
  });

  useEffect(() => {
    if (signatureErrorState) {
      checkTransferStateHandler('error', true);
      checkTransferStateHandler('errorMsg', "Invalid Signature ");
      dispatch(checkAccountSignatureReset());
    }
    if (isSignatureValidState) {
      dispatch(checkTransferableModelAction(true));
      checkTransferStateHandler('reset');
    }
  }, [signatureErrorState, isSignatureValidState])

  useEffect(async () => {
    await checkTransferableAccount();
  }, []);

  const checkTransferableAccount = async () => {
    if (accountState) {
      const response = await checkMigrationable(accountState);

      if (response?.snapshot?.transfer_status === 'PENDING' || response?.snapshot?.transfer_status === 'PARTIALLY_DONE') {
        setMigratable(true);
      }
    }
  }

  const handleSignUpClick = (e) => {
    e.preventDefault();
    onSignUpClick();
  };

  const validationHandler = () => {
    let isValid = true;
    const data = { login: false };
    if (login.trim().length === 0) {
      data.login = true;
      isValid = false;
    } else {
      if (login.trim().length === 0) {
        data.login = true;
        isValid = false;
      }
    }
    setErrorAttr(prev => {
      return { ...prev, ...data };
    })
    return isValid;
  };

  const checkTransferStateHandler = (attr, value) => {
    if (attr === 'reset') {
      setCheckTransfer({
        showPasswordColumn: false,
        errorMsg: '',
        error: false
      });
      return;
    }
    setCheckTransfer(prev => {
      return { ...prev, [attr]: value }
    })
    if (attr === 'errorMsg') {
      setTimeout(() => {
        setCheckTransfer(prev => {
          return { ...prev, errorMsg: '', error: false }
        })
      }, 3000)
    }
  };

  const checkTransferSubmitHandler = async () => {
    const response = await migrate(accountState, checkTransfer.password);
    if (response.error === false) {
      alert(response.msg);
    } else {
      alert('Something went wrong');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validationHandler()) {
      setLoginDataError(false);
      return;
    }
    if (login.length !== 0) {
      renderTorusLogin();
    }
  };

  const handleFaceKiClick = () => {
    onSubmit(login, true, email);
  }

  const renderFaceKi = () => {
    return (
      <FaceKiForm
        {...props}
        onClick={handleFaceKiClick}
        accountName={login}
        email={email}
        privKey={privKey}
      />
    )
  }

  const renderTorusLogin = async () => {
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

        setStep('faceki');       
      }
    } catch (error) {
      console.log('Error in Torus Render', error);
    }
  };

  const renderLoginScreen = () => {
    return (
      <div className={styles.mainBlockContent}>
        <div className={styles.leftBlockContent}>
          <div className={styles.createMeta}>
            <h5>
              <strong>
                This section provides access to your META Lite Wallet.
              </strong>
            </h5>
            <span>
              If you have not yet created a META wallet, please click the Get
              Started button to on the right hand side of the screen. Then click
              the 'Create META Wallet' button below to create your wallet
            </span>
            <br />
            <button
              onClick={handleSignUpClick}
              style={{ marginTop: "1rem" }}
              className={styles.Button}
            >
              Create {portfolio != null ? "new" : null} META Wallet
            </button>
          </div>

          {portfolio === null ? (
            <div className={styles.linkMeta}>
              <span>
                For those already having a META Wallet, to enable functionality,
                you must 'link' your wallet by typing in your wallet 'Wallet
                Name' in the box below and clicking the 'Link META Wallet'
                button.
              </span>
              <form className={styles.FormLink}>
                <input
                  className={styles.input}
                  onChange={(e) => {
                    e.preventDefault();
                    if (e.target.value.trim()) {
                      setErrorAttr(prev => {
                        return { ...prev, login: false };
                      })
                    }
                    setLogin(e.target.value);
                  }}
                  placeholder={"Wallet Name"}
                  value={login}
                  type="text"
                />
                <p
                  className={styles.ErrorP}
                  style={error ? null : { display: "none" }}
                >
                  Invalid Account Name
                </p>
                <p
                  className={styles.ErrorP}
                  style={loginDataError ? null : { display: "none" }}
                >
                  {loginErrorMsgState}
                </p>
                { errorAttr.login ? <p className={styles.ErrorP}>Wallet Name can't be empty</p> : null }
                <button
                  className={styles.Button}
                  style={{ fontSize: "100%", marginTop: "0" }}
                  onClick={handleSubmit}
                  type={"submit"}
                >
                  Link META Wallet
                </button>
              </form>
            </div>
          ) : (
            <div className={styles.linkMeta}>
              <h5>
                <strong>To unlink your wallet, click here</strong>
              </h5>
              <br />
              <button
                className={styles.Button}
                onClick={() => {
                  dispatch(logoutRequest());
                }}
                type={"button"}
                style={{ marginTop: "0" }}
              >
                Unlink META Wallet
              </button>
            </div>
          )}

          {isLoginState && oldUserState && migratable && <div className={styles.linkMeta}>
            <h5>
              <strong>To Claim Meta1 Wallet, click here</strong>
            </h5>
            <br />
            <button
              className={`${styles.Button} ${styles.checkTransferButtonDisplay}`}
              onClick={() => checkTransferStateHandler('showPasswordColumn', true)}
              type={"button"}
              style={{ marginTop: "0" }}
            >
              Claim Meta1 Wallet
            </button>
            {checkTransfer.showPasswordColumn && <>
              <input
                className={styles.input}
                onChange={(e) => {
                  checkTransferStateHandler(e.target.name, e.target.value);
                }}
                name="password"
                placeholder={"Owner Private Key"}
                value={checkTransfer.password}
                type="password"
              />
              <button
                className={`${styles.Button} ${styles.checkTransferPassword}`}
                onClick={() => checkTransferSubmitHandler()}
                type={"button"}
                style={{ marginTop: "0" }}
              >
                Submit
              </button>
            </>
            }
            <span
              className={styles.checkTransferError}
              style={checkTransfer.error ? null : { display: "none" }}
            >
              {checkTransfer.errorMsg}
            </span>
          </div>}
        </div>
        <div className={styles.rightBlockContent}>
          <RightSideHelpMenuFirstType
            onClickExchangeEOSHandler={onClickExchangeEOSHandler}
            onClickExchangeUSDTHandler={onClickExchangeUSDTHandler}
            portfolio={portfolio}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.body}>
      <header className={styles.header}>
        <div className={styles.headerM}>
          <span>META Lite Wallet</span>
        </div>
      </header>
      {step === 'userform' && renderLoginScreen()}
      {step === 'faceki' && renderFaceKi()}
    </div>
  );
}