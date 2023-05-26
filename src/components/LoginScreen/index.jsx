import React, { useState, useEffect } from "react";
import "./login.css";
import styles from "./login.module.scss";
import RightSideHelpMenuFirstType from "../RightSideHelpMenuFirstType/RightSideHelpMenuFirstType";
import { useDispatch, useSelector } from "react-redux";
import { checkAccountSignatureReset, checkTransferableModelAction, logoutRequest } from "../../store/account/actions";
import { accountsSelector, isLoginSelector, isSignatureValidSelector, loginErrorMsgSelector, oldUserSelector, signatureErrorSelector } from "../../store/account/selector";
import { checkMigrationable, migrate, validateSignature, getUserKycProfileByAccount } from "../../API/API";

import FaceKiForm from "./FaceKiForm";
import { Button, Modal } from "semantic-ui-react";
import AccountApi from "../../lib/AccountApi";
import MetaLoader from "../../UI/loader/Loader";
import LoginProvidersModal from "../Web3Auth"

export default function LoginScreen(props) {
  const {
    error,
    loginDataError,
    onSubmit,
    onSignUpClick,
    portfolio,
    assets,
    setLoginDataError,
    onClickRedirectToPortfolio,
    web3auth,
    onClickResetIsSignatureProcessing,
    onClickExchangeAssetHandler
  } = props;
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [migrationMsg, setMigrationMsg] = useState('');
  const [openVideoModal, setOpenVideoModal] = useState(false);
  const [migratable, setMigratable] = useState(false);
  const [errorAttr, setErrorAttr] = useState({ login: false, notFound: false });
  const [checkTransfer, setCheckTransfer] = useState({
    password: '',
    showPasswordColumn: false,
    errorMsg: '',
    error: false
  });
  const [step, setStep] = useState('userform');
  const [authData, setAuthData] = useState(null);
  const [privKey, setPrivKey] = useState(null);
  const [loader, setLoader] = useState(false);
  const [isMigrationPasskeyValid, setIsMigrationPasskeyValid] = useState(true);
  const accountState = useSelector(accountsSelector);
  const isLoginState = useSelector(isLoginSelector);
  const oldUserState = useSelector(oldUserSelector);
  const signatureErrorState = useSelector(signatureErrorSelector);
  const isSignatureValidState = useSelector(isSignatureValidSelector);
  const loginErrorMsgState = useSelector(loginErrorMsgSelector);
  const dispatch = useDispatch();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const browserstack_test_accounts = ['gem-1', 'test-automation', 'john-doe', 'olive-5', 'marry-14', 'mary-14', 'bond-03', 'rock-64', 'rock-3', 'bond-02', 'antman-kok357', 'user-x01'];

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
    onClickResetIsSignatureProcessing();
    localStorage.removeItem('isSignature');
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
    if (!isMigrationPasskeyValid) {
      setIsMigrationPasskeyValid(true);
    }
    const response = await validateSignature(accountState, checkTransfer.password);
    if (!response.error && response.isValid === true) {
      const response_migrate = await migrate(accountState, checkTransfer.password);
      if (response_migrate && response_migrate.error === false) {
        setMigrationMsg(response_migrate.msg);
        setOpenModal(true);
        setIsMigrationPasskeyValid(true);
      } else {
        setMigrationMsg('Something went wrong');
        setOpenModal(true);
      }
    } else {
      setIsMigrationPasskeyValid(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validationHandler()) {
      setLoginDataError(false);
      return;
    }
    if (login) {
      AccountApi.lookupAccounts(login, 1)
        .then(async (res) => {
          if (Array.isArray(res) && res.length > 0) {
            if (res[0] && res[0].length > 0) {
              if (res[0][0] === login) {
                localStorage.removeItem('isMigrationUser');
                if (login.length !== 0) {
                  if (browserstack_test_accounts.includes(login)) {
                    const user = await getUserKycProfileByAccount(login);
                    setEmail(user?.email);
                    setStep('faceki');
                  }
                  else setAuthModalOpen(true);
                }
              } else {
                setErrorAttr(prev => {
                  return { ...prev, notFound: true };
                });
              }
            }
          }
        })
        .catch((err) => console.log("err", err));
    }
  };

  const handleFaceKiSubmit = () => {
    onSubmit(login, true, email);
  }

  const renderFaceKi = () => {
    return (
      <FaceKiForm
        {...props}
        onSubmit={handleFaceKiSubmit}
        accountName={login}
        email={email}
        privKey={privKey}
        setStep={setStep}
      />
    )
  }

  const goToFaceKi = (data) => {
    setAuthData(data);
    setPrivKey("web3authprivatekey");
    setEmail(data?.email.toLowerCase());
    setStep('faceki');
  }

  const renderLoginScreen = () => {
    return (
      <>
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

            {portfolio === null || !isLoginState ? (
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
                          return { ...prev, login: false, notFound: false };
                        })
                      }
                      setLogin(e.target.value.toLowerCase());
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
                  {errorAttr.login ? <p className={styles.ErrorP}>Wallet Name can't be empty</p> : null}
                  {errorAttr.notFound && !errorAttr.login ? <p className={styles.ErrorP}>Invalid Wallet Name</p> : null}
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
                    onClickResetIsSignatureProcessing();
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
                <strong>To complete the transfer of your funds from your original LEGACY Wallet, click the button below and enter your passkey from your LEGACY wallet.</strong>
              </h5>
              <br />
              <button
                className={`${styles.Button} ${styles.checkTransferButtonDisplay}`}
                onClick={() => checkTransferStateHandler('showPasswordColumn', true)}
                type={"button"}
                style={{ marginTop: "0" }}
              >
                Claim Legacy Wallet
              </button>
              {checkTransfer.showPasswordColumn && <>
                <input
                  className={styles.input}
                  onChange={(e) => {
                    checkTransferStateHandler(e.target.name, e.target.value);
                  }}
                  name="password"
                  placeholder={"original passkey"}
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
                style={!isMigrationPasskeyValid ? null : { display: "none" }}
              >
                Private Key is Invalid
              </span>
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
              onClickExchangeAssetHandler={onClickExchangeAssetHandler}
              portfolio={portfolio}
            />
          </div>
          <Modal
            size="mini"
            className="claim_wallet_modal"
            onClose={() => {
              setMigrationMsg("");
              setOpenModal(false);
              onClickRedirectToPortfolio();
            }}
            open={openModal}
            id={"modal-1"}
          >
            <Modal.Content >
              <div
                className="migration-modal-div"
              >
                <h3 className="claim_model_content" style={{ color: '#330000', display: 'block' }}>
                  Hello {accountState}
                </h3>
                <h3 className="text2">{migrationMsg}</h3>
              </div>
            </Modal.Content>
            <Modal.Actions className="claim_modal-action">
              <Button
                className="claim_wallet_btn"
                onClick={() => {
                  setMigrationMsg("");
                  setOpenModal(false);
                  onClickRedirectToPortfolio();
                }}
              >
                Ok</Button>
            </Modal.Actions>
          </Modal>
        </div>
        {
          authModalOpen && <LoginProvidersModal
            open={authModalOpen}
            setOpen={(val) => setAuthModalOpen(val)}
            web3auth={web3auth}
            authMode="login"
            goToFaceKi={goToFaceKi}
          />
        }
      </>
    )
  }

  if (loader) {
    return <MetaLoader size={"large"} />;
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
