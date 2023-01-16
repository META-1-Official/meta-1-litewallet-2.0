import axios from "axios";
import { PrivateKey, Signature } from "meta1-vision-js";
import "regenerator-runtime/runtime";
import TradeWithPassword from "./lib/TradeWithPassword";
import SendWithPassword from "./lib/SendWithPassword";
import fetchDepositAddress from "./lib/fetchDepositAddress";
import Portfolio from "./lib/Portfolio";
import { getCryptosChange, loginRequest } from "./API/API";
import React, { useState, useEffect } from "react";
import { getUserData, changeLastLocation, getLastLocation, sendEmail } from "./API/API";
import SignUpForm from "./components/SignUpForm";
import DepositForm from "./components/DepositForm";
import WithdrawForm from "./components/WithdrawForm";
import ExchangeForm from "./components/ExchangeForm";
import SendForm from "./components/SendForm";
import LoginScreen from "./components/LoginScreen";
import Wallet from "./components/Wallet";
import Settings from "./components/Settings/Settings";
import logoNavbar from "./images/default-pic2.png";
import logoDefalt from "./images/default-pic1.png";
import "./App.css";
import Meta1 from "meta1-vision-dex";
import MetaLoader from "./UI/loader/Loader";
import Navbar from "./components/Navbar/Navbar";
import LeftPanel from "./components/LeftPanel/LeftPanel";
import Footer from "./components/Footer/Footer";
import RightSideHelpMenuSecondType from "./components/RightSideHelpMenuSecondType/RightSideHelpMenuSecondType";
import PaperWalletLogin from "./components/PaperWalletLogin/PaperWalletLogin";
import { OrdersTable } from "./components/Wallet/OrdersTable";
import CheckPassword from "./lib/CheckPassword";
import { Button, Modal } from "semantic-ui-react";
import { getAccessToken, getLoginDetail, setAccessToken } from "./utils/localstorage";
import { useDispatch, useSelector } from "react-redux";
import { accountsSelector, tokenSelector, loaderSelector, isLoginSelector, loginErrorSelector, demoSelector, isTokenValidSelector, userDataSelector, errorMsgSelector, checkTransferableModelSelector, fromSignUpSelector, refreshLoginDataSelector } from "./store/account/selector";
import { checkAccountSignatureReset, checkTransferableModelAction, checkTransferableRequest, getUserRequest, loginRequestService, logoutRequest, passKeyResetService } from "./store/account/actions";
import { checkPasswordObjSelector, cryptoDataSelector, meta1Selector, portfolioReceiverSelector, senderApiSelector, traderSelector } from "./store/meta1/selector";
import { getCryptosChangeRequest, meta1ConnectSuccess, resetMetaStore, setUserCurrencyAction } from "./store/meta1/actions";
import OpenOrder  from "./components/OpenOrder";
import CustomizeColumns from "./components/OpenOrder/CustomizedColumns";
import { useQuery } from "react-query";
import OpenLogin from 'openlogin';

const openLogin = new OpenLogin({
  clientId: process.env.REACT_APP_TORUS_PROJECT_ID,
  network: process.env.REACT_APP_TORUS_NETWORK,
  uxMode: 'popup',
  whiteLabel: {
    name: 'META1'
  },
});

window.Meta1 = Meta1;
function Application(props) {
  const accountNameState = useSelector(accountsSelector);
  const isLoginState = useSelector(isLoginSelector);
  const tokenState = useSelector(tokenSelector);
  const loaderState = useSelector(loaderSelector);
  const loginErrorState = useSelector(loginErrorSelector);
  const isTokenValidState = useSelector(isTokenValidSelector);
  const userDataState = useSelector(userDataSelector);
  const errorMsgState = useSelector(errorMsgSelector);
  const demoState = useSelector(demoSelector);
  const meta1State = useSelector(meta1Selector);
  const cryptoDataState = useSelector(cryptoDataSelector);
  const fromSignUpState = useSelector(fromSignUpSelector);
  const portfolioReceiverState = useSelector(portfolioReceiverSelector);
  const traderState = useSelector(traderSelector);
  const checkPasswordObjState = useSelector(checkPasswordObjSelector);
  const senderApiState = useSelector(senderApiSelector);
  const checkTransferableModelState = useSelector(checkTransferableModelSelector);

  const { metaUrl } = props;
  const domAccount =
    props.account !== null &&
      props.account !== undefined &&
      props.account.length > 0
      ? props.account
      : null;

  if (domAccount) window.localStorage.setItem("account", domAccount);

  const crypt = {
    EUR: [0, "€"],
    GBP: [1, "£"],
    RUB: [2, "₽"],
    CAD: [3, "CA$"],
  };

  const [tradeAsset, setTradeAsset] = useState("USDT");
  const [fetchDepositFn, setFetchDepositFn] = useState(null);
  const [activeScreen, setActiveScreen] = useState(null);
  const [account, setAccount] = useState(null);
  const [accountName, setAccountName] = useState(domAccount);
  const [password, setPassword] = useState(
    window.localStorage.getItem("password")
  );
  const [orders, setOrders] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [portfolioFull, setFullPortfolio] = useState([]);
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const setCredentials = (account, password) => {
    setAccountName(account);
    setPassword(password);
  };
  const [login, setLogin] = useState(localStorage.getItem("login"));
  const [loginError, setLoginError] = useState(null);
  const [loginDataError, setLoginDataError] = useState(false);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [tokenModalMsg, setTokenModalMsg] = useState('');
  const [userCurrency, setUserCurrency] = useState("$ USD 1");
  const [refreshData, setRefreshData] = useState(false);
  const [fromSignUp, setFromSignUp] = useState(false);
  const [isSignatureProcessing, setIsSignatureProcessing] = useState(false);
  const [signatureResult, setSignatureResult] = useState(null);
  const [isFromMigration, setIsFromMigration] = useState(false);
  const [fetchAssetModalOpen, setFetchAssetModalOpen] = useState(false);
  const [passwordShouldBeProvided, setPasswordShouldBeProvided] =
    useState(false);
  const refreshLoginDataState = useSelector(refreshLoginDataSelector);
  const dispatch = useDispatch();

  const urlParams = window.location.search.replace('?', '').split('&');
  const signatureParam = urlParams[0].split('=');

  const updateBalances = () => {
    if (portfolioReceiverState && accountName && !passwordShouldBeProvided) {
      refetchPortfolio();
    }
  }

  const newUpdatedBalance = useQuery(['updateBalance'], updateBalances, {
    refetchInterval: 20000
  });

  useEffect(() => {
    if (login !== null) {
      onLogin(login);
    }
  }, []);

  useEffect(() => {
    const initializeOpenlogin = async () => {
      try {
        await openLogin.init();
        if (openLogin.privKey) {
          console.log(openLogin);
        }
      } catch (error) {
        console.log("error while initialization", error);
      } finally {
        console.log("openlogin init sucess");
      }
    }
    initializeOpenlogin();
  }, []);

  const onLogin = async (login, clicked = false, emailOrPassword = '', fromSignUpFlag = false, signUpEmail = "") => {
    setIsLoading(true);
    if (clicked) {
      dispatch(loginRequestService({ login, emailOrPassword, setLoginDataError, fromSignUpFlag, signUpEmail }));
    }
    if (getAccessToken()) {
      dispatch(checkTransferableRequest({ login }))
      await getAvatarFromBack(login);
      setLoginError(null);
      setAccountName(login);
      localStorage.setItem("login", login);
      setLogin(login);
      if (clicked) {
        setLoginError(true);
      }
      setIsLoading(false);
      if (fromSignUpFlag) {
        setFromSignUp(prev => {
          return true
        });
      }
    }
  };

  useEffect(() => {
    if (signatureParam[0] === 'signature') {
      if (!fromSignUpState) {
        setIsSignatureProcessing(true);
        setSignatureResult(signatureParam[1]);
        setActiveScreen('registration');
      } else {
        if (window.location.search.includes('?signature=success')) {
          sessionStorage.setItem('location','wallet');
          setActiveScreen("wallet");
          window.location.href = window.location.href.split('?')[0];
        }
      }
      if (window.location.search.includes('?signature=success')) {
        localStorage.setItem('isSignature',true);
      }
    }
  },[signatureParam]);

  useEffect(() => {
    if (loginErrorState) {
      setIsLoading(false);
      setLoginDataError(true);
    }
    if (accountNameState) {
      setLoginDataError(false);
      onLogin(accountNameState,false)
      if (fromSignUp) {
        setPortfolio(null);
        setRefreshData(prev=>!prev);
        dispatch(resetMetaStore());
        setFromSignUp(false);
        if (accountNameState) {
          setActiveScreen("wallet");
        }
      }
    }
    if (accountNameState === null) {
      setAccountName(null);
      setLogin(null);
      setPortfolio(null);
      setActiveScreen("login");
    }
  },[accountNameState, loginErrorState, refreshLoginDataState]);

  const loc = React.useMemo(() => {
    if (
      activeScreen !== "sendFunds" &&
      activeScreen !== "login" &&
      activeScreen != null
    ) {
      sessionStorage.setItem("location", activeScreen);
    }
    return true;
  }, [activeScreen]);
  useEffect(()=>{
      if (userDataState?.message?.currency === "USD") {
      } else if (userDataState?.message?.currency) {
          const userCurrencyData = `${crypt[userDataState?.message?.currency][1]} ${userDataState?.message?.currency} ${cryptoDataState.ExchangeRate[crypt[userDataState?.message?.currency][0]].rate
          }`
          dispatch(setUserCurrencyAction(userCurrencyData))
      }
  },[cryptoDataState]);
  useEffect(() => {
    if (!isTokenValidState) {
      setTokenModalOpen(true);
      setTokenModalMsg(errorMsgState);
    } else {
      if (userDataState) {
        dispatch(getCryptosChangeRequest())
      }
    }
  },[userDataState, isTokenValidState]);
  async function getAvatarFromBack(login) {
    dispatch(getUserRequest(login));
  }

  useEffect(() => {
    async function fetchPortfolio() {
      if (portfolioReceiverState === null) return;
      if (portfolio !== null) return;
      if (accountNameState === null || accountNameState.length === 0) return;
      try {
        const fetched = await portfolioReceiverState.fetch();
        if (!fetched) {
          return;
        }
        setAssets(fetched.assets);
        setPortfolio(fetched.portfolio);
        setFullPortfolio(fetched.full);
        if (localStorage.getItem('isMigrationUser') === 'true' && localStorage.getItem('readyToMigrate') === 'true') {
          setIsFromMigration(true);
        }
        if (accountNameState) {
          dispatch(checkTransferableRequest({ login: accountNameState }));
        }
        localStorage.setItem("account", accountNameState);
        setActiveScreen(
          sessionStorage.getItem("location") != null
            ? sessionStorage.getItem("location")
            : "wallet"
        );
      } catch (e) {
        setActiveScreen("login");
      }
    }
    fetchPortfolio();
  }, [portfolioReceiverState, portfolio, accountName, refreshData ]);

  useEffect(() => {
    async function connect() {
      setIsLoading(true);
      Meta1.connect(metaUrl || process.env.REACT_APP_MAIA).then(
        () => {
          setIsLoading(false);
          if (
            accountNameState == null ||
            accountNameState.length === 0 ||
            !localStorage.getItem("login")
          ) {
            if (localStorage.getItem('isSignature')) {
              setActiveScreen("registration");
              localStorage.removeItem('isSignature');
            } else {
              setActiveScreen("login");
            }
          } else {
            setActiveScreen(
              sessionStorage.getItem("location") != null
                ? sessionStorage.getItem("location")
                : "wallet"
            );
            setFetchDepositFn((asset) => (asset) => {
              return fetchDepositAddress({ accountName: accountNameState, asset });
            });
            const portfolioObj = new Portfolio({
              metaApi: Meta1,
              accountName: accountNameState,
              setFetchAssetModalOpen
            });
            const tradeWithPasswordObj = new TradeWithPassword({
              metaApi: Meta1,
              login: accountNameState,
            });

            const checkPasswordObj = new CheckPassword({
              metaApi: Meta1,
              login: accountNameState,
            });
          
            const sendWithPasswordObj = new SendWithPassword({
              metaApi: Meta1,
              login: accountNameState,
            });
            const obj = { 
                portfolioReceiver: portfolioObj,
                trader: tradeWithPasswordObj,
                checkPasswordObj,
                senderApi: sendWithPasswordObj
            };
            dispatch(meta1ConnectSuccess(obj))
          }
        },
        () => {
          setActiveScreen("login");
          setLoginError("Error occured");
        }
      );
    }
    connect();
  }, [accountNameState]);

  function refetchPortfolio() {
    setTimeout(async () => {
      if (isLoginState && getLoginDetail()) {
        const fetched = await portfolioReceiverState.fetch();
        if (!fetched) {
          return;
        }
        if (!assets || (Array.isArray(assets) && assets.length === 0)) {
          setAssets(fetched.assets);
        }
        setPortfolio(fetched.portfolio);
        setFullPortfolio(fetched.full);
      }
    }, 2000);
  }

  const onRegistration = async (acc, pass, regEmail) => {
    localStorage.setItem("account", acc);
    localStorage.setItem("login", acc);
    setCredentials(acc, pass);
    onLogin(acc, true, pass, true, regEmail);
    setActiveScreen("wallet");
  };

  async function chngLastLocation(location) {
    if (location && location !== "login") {
      await changeLastLocation(localStorage.getItem("login"), location);
    }
  }

  if (isLoading || loaderState || activeScreen == null) {
    return <MetaLoader size={"large"} />;
  }

  return (
    <>
      <Navbar
        onClickHomeHandler={(e) => {
          e.preventDefault();
          dispatch(getUserRequest(login));
          setActiveScreen("login");
          setIsSignatureProcessing(false);
        }}
        onClickPortfolioHandler={(e) => {
          e.preventDefault();
          dispatch(getUserRequest(login));
          setActiveScreen("wallet");
          setIsSignatureProcessing(false);
        }}
        onClickExchangeHandler={(e) => {
          e.preventDefault();
          dispatch(getUserRequest(login));
          setTradeAsset("BTC");
          setActiveScreen("exchange");
          dispatch(passKeyResetService());
          setIsSignatureProcessing(false);
        }}
        onClickPaperWalletHandler={(e) => {
          e.preventDefault();
          dispatch(getUserRequest(login));
          setActiveScreen("paperWallet");
          setIsSignatureProcessing(false);
        }}
        onClickOrderTableHandler={(e) => {
          e.preventDefault();
          dispatch(getUserRequest(login));
          setActiveScreen("orderTable");
          setIsSignatureProcessing(false);
        }}
        onClickSettingsHandler={(e) => {
          e.preventDefault();
          dispatch(getUserRequest(login));
          setActiveScreen("settings");
          setIsSignatureProcessing(false);
        }}
        onClickHistoryHandler={(e) => {
          e.preventDefault();
          dispatch(getUserRequest(login));
          setActiveScreen("orderTable");
          setIsSignatureProcessing(false);
        }}
        onClickOpenOrderHandler={(e) => {
          e.preventDefault();
          dispatch(getUserRequest(login));
          setActiveScreen("openOrder");
          setIsSignatureProcessing(false);
        }}
        onClickResetIsSignatureProcessing={() => {
          setIsSignatureProcessing(false);
        }}
        portfolio={portfolio}
        name={accountName}
        activeScreen={activeScreen}
      />
      <div className={"forAdapt"}>
        <LeftPanel
          onClickHomeHandler={(e) => {
            e.preventDefault();
            dispatch(getUserRequest(login));
            setActiveScreen("login");
            setIsSignatureProcessing(false);
          }}
          onClickPortfolioHandler={(e) => {
            e.preventDefault();
            dispatch(getUserRequest(login));
            setActiveScreen("wallet");
            setIsSignatureProcessing(false);
          }}
          onClickExchangeHandler={(e) => {
            e.preventDefault();
            dispatch(getUserRequest(login));
            setTradeAsset("BTC");
            setActiveScreen("exchange");
            dispatch(passKeyResetService());
            setIsSignatureProcessing(false);
          }}
          onClickPaperWalletHandler={(e) => {
            e.preventDefault();
            dispatch(getUserRequest(login));
            setActiveScreen("paperWallet");
            setIsSignatureProcessing(false);
          }}
          onClickOrderTableHandler={(e) => {
            e.preventDefault();
            dispatch(getUserRequest(login));
            setActiveScreen("orderTable");
            setIsSignatureProcessing(false);
          }}
          onClickSettingsHandler={(e) => {
            e.preventDefault();
            dispatch(getUserRequest(login));
            setActiveScreen("settings");
            setIsSignatureProcessing(false);
          }}
          onClickHistoryHandler={(e) => {
            e.preventDefault();
            dispatch(getUserRequest(login));
            setActiveScreen("orderTable");
            setIsSignatureProcessing(false);
          }}
          onClickOpenOrderHandler={(e) => {
            e.preventDefault();
            dispatch(getUserRequest(login));
            setActiveScreen("openOrder");
            setIsSignatureProcessing(false);
          }}
          portfolio={portfolio}
          name={accountName}
          activeScreen={activeScreen}
        />
        <div style={{ width: "100%" }} className="App">
          <div className="AppContent">
            {activeScreen === "registration" && (
              <div className={"fullBlockWithAdapt"}>
                <SignUpForm
                  {...props}
                  onRegistration={onRegistration}
                  onBackClick={(e) => {
                    e.preventDefault();
                    setActiveScreen("login");
                  }}
                  onClickExchangeUSDTHandler={(e) => {
                    e.preventDefault();
                    setTradeAsset("USDT");
                    setActiveScreen("exchange");
                  }}
                  onClickExchangeEOSHandler={(e) => {
                    e.preventDefault();
                    setTradeAsset("EOS");
                    setActiveScreen("exchange");
                  }}
                  portfolio={portfolio}
                  isSignatureProcessing={isSignatureProcessing}
                  signatureResult={signatureResult}
                  openLogin={openLogin}
                />
                <Footer
                  onClickHomeHandler={(e) => {
                    e.preventDefault();
                    setActiveScreen("login");
                  }}
                />
              </div>
            )}
            {activeScreen === "settings" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                <Settings
                  fetcher={fetchDepositFn}
                  asset={tradeAsset}
                  address={""}
                  onBackClick={(e) => {
                    e.preventDefault();
                    setActiveScreen("wallet");
                  }}
                  onClickExchangeUSDTHandler={(e) => {
                    e.preventDefault();
                    setTradeAsset("USDT");
                    setActiveScreen("exchange");
                  }}
                  onClickExchangeEOSHandler={(e) => {
                    e.preventDefault();
                    setTradeAsset("EOS");
                    setActiveScreen("exchange");
                  }}
                  getAvatarFromBack={getAvatarFromBack}
                  userCurrency={userCurrency}
                  setUserCurrency={setUserCurrency}
                  setTokenModalMsg={setTokenModalMsg}
                  setTokenModalOpen={setTokenModalOpen}
                />
                <Footer
                  onClickHomeHandler={(e) => {
                    e.preventDefault();
                    setActiveScreen("login");
                  }}
                />
              </div>
            )}
            {activeScreen === "exchange" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                <ExchangeForm
                  onBackClick={(e) => {
                    e.preventDefault();
                    setActiveScreen("wallet");
                  }}
                  onSuccessModal={() => setActiveScreen("wallet")}
                  onSuccessTrade={() => {
                    setPortfolio(null);
                    refetchPortfolio();
                  }}
                  portfolio={portfolio}
                  asset={tradeAsset}
                  metaUrl={metaUrl}
                  assets={assets}
                  onClickExchangeUSDTHandler={(e) => {
                    e.preventDefault();
                    setTradeAsset("USDT");
                    setActiveScreen("exchange");
                  }}
                  onClickExchangeEOSHandler={(e) => {
                    e.preventDefault();
                    setTradeAsset("EOS");
                    setActiveScreen("exchange");
                  }}
                  passwordShouldBeProvided={passwordShouldBeProvided}
                  setPasswordShouldBeProvided={setPasswordShouldBeProvided}
                />
                <Footer
                  onClickHomeHandler={(e) => {
                    e.preventDefault();
                    setActiveScreen("login");
                  }}
                />
              </div>
            )}

            {activeScreen === "login" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                <LoginScreen
                  onSignUpClick={() => setActiveScreen("registration")}
                  error={loginError}
                  loginDataError={loginDataError}
                  setLoginDataError={setLoginDataError}
                  onSubmit={onLogin}
                  portfolio={portfolio}
                  onClickExchangeUSDTHandler={(e) => {
                    e.preventDefault();
                    setTradeAsset("USDT");
                    setActiveScreen("exchange");
                  }}
                  onClickExchangeEOSHandler={(e) => {
                    e.preventDefault();
                    setTradeAsset("EOS");
                    setActiveScreen("exchange");
                  }}
                  onClickRedirectToPortfolio={(e) => {
                    refetchPortfolio();
                    setActiveScreen("wallet");
                  }}
                  onClickResetIsSignatureProcessing={() => {
                    setIsSignatureProcessing(false);
                    setSignatureResult(null);
                  }}
                  openLogin={openLogin}
                />
                <Footer
                  onClickHomeHandler={(e) => {
                    e.preventDefault();
                    setActiveScreen("login");
                    setIsSignatureProcessing(false);
                  }}
                />
              </div>
            )}

            {activeScreen === "sendFunds" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                <SendForm
                  onBackClick={(e) => {
                    e.preventDefault();
                    setActiveScreen("wallet");
                  }}
                  portfolio={portfolio}
                  onSuccessTransfer={() => {
                    setActiveScreen("wallet");
                    setPortfolio(null);
                    refetchPortfolio();
                  }}
                  asset={tradeAsset}
                  sender={accountName}
                  assets={assets}
                  onClickExchangeUSDTHandler={(e) => {
                    e.preventDefault();
                    setTradeAsset("USDT");
                    setActiveScreen("exchange");
                  }}
                  onClickExchangeEOSHandler={(e) => {
                    e.preventDefault();
                    setTradeAsset("EOS");
                    setActiveScreen("exchange");
                  }}
                />
                <Footer
                  onClickHomeHandler={(e) => {
                    e.preventDefault();
                    setActiveScreen("login");
                    setIsSignatureProcessing(false);
                  }}
                />
              </div>
            )}

            {activeScreen === "deposit" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                <DepositForm
                  account={account}
                  fetcher={fetchDepositFn}
                  asset={tradeAsset}
                  address={""}
                  onBackClick={(e) => {
                    e.preventDefault();
                    setActiveScreen("wallet");
                    setIsSignatureProcessing(false);
                  }}
                />
                <Footer
                  onClickHomeHandler={(e) => {
                    e.preventDefault();
                    setActiveScreen("login");
                    setIsSignatureProcessing(false);
                  }}
                />
              </div>
            )}

            {activeScreen === "withdraw" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                <WithdrawForm
                  account={account}
                  accountName={accountName}
                  sendEmail={sendEmail}
                  asset={tradeAsset}
                  assets={assets}
                  portfolio={portfolio}
                  onBackClick={(e) => {
                    e.preventDefault();
                    setActiveScreen("wallet");
                  }}
                  redirectToPortfolio={() => setActiveScreen("wallet")}
                  onSuccessWithDrawal={()=> {
                    setPortfolio(null);
                    refetchPortfolio();
                  }}
                  setTokenModalOpen={setTokenModalOpen}
                  setTokenModalMsg={setTokenModalMsg}
                />
                <Footer
                  onClickHomeHandler={(e) => {
                    e.preventDefault();
                    setActiveScreen("login");
                    setIsSignatureProcessing(false);
                  }}
                />
              </div>
            )}

            {activeScreen === "wallet" && (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                  }}
                >
                  <div>
                    <div style={{ background: "#fff", padding: "1.1rem 2rem" }}>
                      <h5 style={{ fontSize: "1.15rem", fontWeight: "600" }}>
                        <strong>Portfolio</strong>
                      </h5>
                    </div>
                    <div className={"justFlexAndDirect customJustFlexAndDirect"}>
                      <div
                        className={"blockInfoYourCrypto blockInfoYourCryptoCustom"}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          borderRadius: "8px",
                        }}
                      >
                        <Wallet
                          assets={assets}
                          portfolio={portfolioFull}
                          tradeAsset={tradeAsset}
                          onSendClick={(assetName) => {
                            setTradeAsset(assetName);
                            setActiveScreen("sendFunds");
                          }}
                          onDepositClick={(assetName) => {
                            setTradeAsset(assetName);
                            setActiveScreen("deposit");
                          }}
                          onWithdrawClick={(assetName) => {
                            setTradeAsset(assetName);
                            setActiveScreen("withdraw");
                          }}
                          onAssetSelect={(name) => {
                            setTradeAsset(name);
                            setActiveScreen("exchange");
                          }}
                          account={account}
                          accountName={accountName}
                          onClickExchangeUSDTHandler={(e) => {
                            e.preventDefault();
                            setTradeAsset("USDT");
                            setActiveScreen("exchange");
                          }}
                          onClickExchangeEOSHandler={(e) => {
                            e.preventDefault();
                            setTradeAsset("EOS");
                            setActiveScreen("exchange");
                          }}
                          setFullPortfolio={setFullPortfolio}
                          userCurrency={userCurrency}
                        />
                      </div>
                      <div className={"bottomAdaptBlock"}>
                        <RightSideHelpMenuSecondType
                          onClickExchangeUSDTHandler={(e) => {
                            e.preventDefault();
                            setTradeAsset("USDT");
                            setActiveScreen("exchange");
                          }}
                          onClickExchangeEOSHandler={(e) => {
                            e.preventDefault();
                            setTradeAsset("EOS");
                            setActiveScreen("exchange");
                          }}
                          fromHistory={false}
                        />
                      </div>
                    </div>
                  </div>
                  <Footer
                    onClickHomeHandler={(e) => {
                      e.preventDefault();
                      setActiveScreen("login");
                      setIsSignatureProcessing(false);
                    }}
                  />
                </div>
              </>
            )}
            {activeScreen === "paperWallet" && (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                  }}
                >
                  <div>
                    <div style={{ background: "#fff", padding: "1.1rem 2rem" }}>
                      <h5 style={{ fontSize: "1.15rem", fontWeight: "600" }}>
                        <strong>Paper Wallet</strong>
                      </h5>
                    </div>
                    <div className={"paperWalletStyles"}>
                      <PaperWalletLogin />
                    </div>
                  </div>
                  <Footer
                    onClickHomeHandler={(e) => {
                      e.preventDefault();
                      setActiveScreen("login");
                      setIsSignatureProcessing(false);
                    }}
                  />
                </div>
              </>
            )}
            {activeScreen === "orderTable" && (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                  }}
                >
                  <div>
                    <div style={{ background: "#fff", padding: "1.1rem 2rem" }}>
                      <h5 style={{ fontSize: "1.15rem", fontWeight: "600" }}>
                        <strong>Transaction History</strong>
                      </h5>
                    </div>
                    <div className={"justFlexAndDirect"}>
                      <div className={"paperWalletStylesTH marginBottomZero marginBottomCustom"}>
                        <OrdersTable
                          data={orders}
                          column={null}
                          direction={null}
                          assets={assets}
                        />
                      </div>
                      <div className={"bottomAdaptBlock margin-class newBottomAdaptBlock"}>
                        <RightSideHelpMenuSecondType
                          onClickExchangeUSDTHandler={(e) => {
                            e.preventDefault();
                            setTradeAsset("USDT");
                            setActiveScreen("exchange");
                          }}
                          onClickExchangeEOSHandler={(e) => {
                            e.preventDefault();
                            setTradeAsset("EOS");
                            setActiveScreen("exchange");
                          }}
                          fromHistory={true}
                        />
                      </div>
                    </div>
                  </div>
                  <Footer
                    onClickHomeHandler={(e) => {
                      e.preventDefault();
                      setActiveScreen("login");
                      setIsSignatureProcessing(false);
                    }}
                  />
                </div>
              </>
            )}
            {activeScreen === "openOrder" && (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                  }}
                >
                  <div>
                    <div className="orderOrderMainFlex" style={{ background: "#fff", padding: "1.1rem 2rem" }}>
                      <div>
                        <h5 style={{ fontSize: "1.15rem", fontWeight: "600" }}>
                          <strong>Open Order</strong>
                        </h5>
                      </div>
                      <div>
                        <CustomizeColumns/>
                      </div>
                    </div>
                    <div className="justFlexAndDirect justFlexAndDirectMobile">
                      <div className={"paperWalletStylesTH marginBottomZero marginBottomCustom"}>
                        <OpenOrder
                          data={orders}
                          column={null}
                          direction={null}
                          assets={assets}
                          portfolio={portfolio}
                        />
                      </div>
                    </div>
                  </div>
                  <Footer
                    onClickHomeHandler={(e) => {
                      e.preventDefault();
                      setActiveScreen("login");
                      setIsSignatureProcessing(false);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {tokenModalOpen && <Modal
        size="mini"
        open={true}
        onClose={() => {
          // setModalOpened(false);
        }}
        id={"modalExch"}
      >
        <Modal.Header>Alert</Modal.Header>
        <Modal.Content style={{ height: "55%" }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h3 style={{ textAlign: "center" }}>
              {errorMsgState}. Please Login
            </h3>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button
            style={{ backgroundColor: "#fc0", color: "white" }}
            onClick={() => {
              setTokenModalOpen(false);
              setIsSignatureProcessing(false);
              dispatch(logoutRequest())
            }}
          >
            OK
          </Button>
        </Modal.Actions>
      </Modal>}
      <Modal
        size="mini"
        className="claim_wallet_modal"
        onClose={() => {
          dispatch(checkTransferableModelAction(false));
          dispatch(checkAccountSignatureReset());
          dispatch(checkTransferableRequest({ login: accountNameState }));
        }}
        open={checkTransferableModelState}
        id={"modalExch"}
      >

        <Modal.Content >
          <div
            className="claim_wallet_btn_div"

          >
            <h3 className="claim_model_content">
              Hello {accountName}<br />
              To Claim your previous wallet META1, click on Button
            </h3>
          </div>
        </Modal.Content>
        <Modal.Actions className="claim_modal-action">
          <Button
            className="claim_wallet_btn"
            onClick={() => {
              dispatch(checkTransferableModelAction(false));
              dispatch(checkAccountSignatureReset());
              dispatch(checkTransferableRequest({ login: accountNameState }));
            }}
          >
            Claim Wallet</Button>
        </Modal.Actions>
      </Modal>
      <Modal
        size="mini"
        className="claim_wallet_modal"
        onClose={() => {
          localStorage.removeItem('isMigrationUser');
          localStorage.removeItem('readyToMigrate');
          setActiveScreen('login');
          setIsFromMigration(false);
        }}
        open={isFromMigration}
        id={"modalExch"}
      >

        <Modal.Content >
          <div
            className="claim_wallet_btn_div"

          >
            <h3 className="claim_model_content">
              Hello {accountName}<br />
              To Complete Migration of Your Funds Click Below
            </h3>
          </div>
        </Modal.Content>
        <Modal.Actions className="claim_modal-action">
          <Button
            className="claim_wallet_btn"
            onClick={() => {
              localStorage.removeItem('isMigrationUser');
              localStorage.removeItem('readyToMigrate');
              setActiveScreen('login');
              setIsFromMigration(false);
            }}
          >
            Go There</Button>
        </Modal.Actions>
      </Modal>

      <Modal
        size="mini"
        className="claim_wallet_modal"
        onClose={() => {
          setFetchAssetModalOpen(false);
        }}
        open={fetchAssetModalOpen}
        id={"modalExch"}
      >

        <Modal.Content >
          <div
            className="claim_wallet_btn_div"

          >
            <h3 className="claim_model_content">
              Hello {accountName}<br />
              {portfolioReceiverState && portfolioReceiverState._fetchAssetLastValue() ? 'Connected' : 'Not Connected'}
            </h3>
          </div>
        </Modal.Content>
        <Modal.Actions className="claim_modal-action">
          <Button
            className="claim_wallet_btn"
            onClick={() => {
              setFetchAssetModalOpen(false);
            }}
          >
            OK</Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}

export function App({ domElement }) {
  const metaUrl =
    process.env.REACT_APP_META_URL || domElement.getAttribute("data-meta-url");
  const linkAccountUrl =
    process.env.REACT_APP_LINK_ACCOUNT_URL || domElement.getAttribute("data-link-url");
  const email = domElement.getAttribute("data-email");
  const firstName = domElement.getAttribute("data-fname");
  const lastName = domElement.getAttribute("data-lname");
  const phone = domElement.getAttribute("data-phone");
  const account = domElement.getAttribute("data-account");

  return (
    <Application
      {...{
        metaUrl,
        linkAccountUrl,
        email,
        firstName,
        lastName,
        phone,
        account,
      }}
    />
  );
}

export default App;
