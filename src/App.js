import "regenerator-runtime/runtime";
import TradeWithPassword from "./lib/TradeWithPassword";
import SendWithPassword from "./lib/SendWithPassword";
import fetchDepositAddress from "./lib/fetchDepositAddress";
import Portfolio from "./lib/Portfolio";
import { checkToken } from "./API/API";
import React, { useState, useEffect } from "react";
import { sendEmail } from "./API/API";
import SignUpForm from "./components/SignUpForm";
import DepositForm from "./components/DepositForm";
import WithdrawForm from "./components/WithdrawForm";
import ExchangeForm from "./components/ExchangeForm";
import SendForm from "./components/SendForm";
import LoginScreen from "./components/LoginScreen";
import Wallet from "./components/Wallet";
import Settings from "./components/Settings/Settings";
import Meta1 from "meta1-vision-dex";
import MetaLoader from "./UI/loader/Loader";
import DisconnectedInternet from "./UI/loader/DisconnectedInternet";
import Navbar from "./components/Navbar/Navbar";
import LeftPanel from "./components/LeftPanel/LeftPanel";
import Footer from "./components/Footer/Footer";
import RightSideHelpMenuSecondType from "./components/RightSideHelpMenuSecondType/RightSideHelpMenuSecondType";
import PaperWalletLogin from "./components/PaperWalletLogin/PaperWalletLogin";
import { OrdersTable } from "./components/Wallet/OrdersTable";
import CheckPassword from "./lib/CheckPassword";
import { Button, Modal } from "semantic-ui-react";
import { getAccessToken } from './utils/localstorage';
import { useDispatch, useSelector } from "react-redux";
import { accountsSelector, loaderSelector, isLoginSelector, loginErrorSelector, isTokenValidSelector, userDataSelector, errorMsgSelector, checkTransferableModelSelector, fromSignUpSelector } from "./store/account/selector";
import { checkAccountSignatureReset, checkTransferableModelAction, checkTransferableRequest, getUserRequest, loginRequestService, logoutRequest, passKeyResetService, getNotificationsRequest } from "./store/account/actions";
import {cryptoDataSelector, portfolioReceiverSelector } from "./store/meta1/selector";
import { getCryptosChangeRequest, meta1ConnectSuccess, resetMetaStore, setUserCurrencyAction } from "./store/meta1/actions";
import OpenOrder from "./components/OpenOrder";
import Notifications from "./components/Notification/Notifications";
import Announcements from "./components/Announcement/Announcements";
import CustomizeColumns from "./components/OpenOrder/CustomizedColumns";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { Worker } from '@react-pdf-viewer/core';
import * as Sentry from '@sentry/react';
import { getTheme, setTheme } from './utils/storage';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import "./App.css";

// for the cache purpose
import AppStore from "./images/app-store.png";
import GooglePlay from "./images/google-play.png";
import OfflineIcon from "./images/offline.png";
import { filterNotifications } from "./utils/common";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x1",
  rpcTarget: "https://rpc.ankr.com/eth",
  blockExplorer: "https://goerli.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
}

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const openloginAdapter = new OpenloginAdapter({
  adapterSettings: {
    uxMode: "popup",
    whiteLabel: {
      name: "META1",
      logoLight: "https://pbs.twimg.com/profile_images/980143928769839105/hK3RnAff_400x400.jpg",
      defaultLanguage: "en",
      dark: getTheme('theme') === "dark" ? true : false,
    }
  },
  privateKeyProvider
});


window.Meta1 = Meta1;
function Application(props) {
  const accountNameState = useSelector(accountsSelector);
  const isLoginState = useSelector(isLoginSelector);
  const loaderState = useSelector(loaderSelector);
  const loginErrorState = useSelector(loginErrorSelector);
  const isTokenValidState = useSelector(isTokenValidSelector);
  const userDataState = useSelector(userDataSelector);
  const errorMsgState = useSelector(errorMsgSelector);
  const cryptoDataState = useSelector(cryptoDataSelector);
  const fromSignUpState = useSelector(fromSignUpSelector);
  const portfolioReceiverState = useSelector(portfolioReceiverSelector);
  const checkTransferableModelState = useSelector(checkTransferableModelSelector);
  const [selectedTheme, setSelectedTheme] = useState(getTheme('theme'));

  const { metaUrl } = props;
  const domAccount =
    props.account !== null &&
      props.account !== undefined &&
      props.account.length > 0
      ? props.account
      : null;

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
  const [login, setLogin] = useState();
  const [token, setToken] = useState(null);
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
  const [passwordShouldBeProvided, setPasswordShouldBeProvided] = useState(false);
  const [web3auth, setWeb3auth] = useState(null);
  const [kafkaWebsocket, setKafkaWebSocket] = useState(null);
  const dispatch = useDispatch();

  const urlParams = window.location.search.replace('?', '').split('&');
  const signatureParam = urlParams[0].split('=');

  // Online state
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Update network status
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    // Listen to the online status
    window.addEventListener('online', handleStatusChange);

    // Listen to the offline status
    window.addEventListener('offline', handleStatusChange);

    // Specify how to clean up after this effect for performance improvment
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, [isOnline]);

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3AuthNoModal({
          clientId: process.env.REACT_APP_TORUS_PROJECT_ID,
          web3AuthNetwork: process.env.REACT_APP_TORUS_NETWORK,
          chainConfig
        });
        web3auth.configureAdapter(openloginAdapter);
        setWeb3auth(web3auth);
        await web3auth.init();
      } catch (error) {
        console.error(error);
      }
    };

    init();
    initNotificationConfig();
    _enablePersistingLog();
  }, []);

  const initNotificationConfig = () => {
    var conf = JSON.parse(localStorage.getItem("noti_conf"));
    if (!conf) {
      conf = {
        specNotification: [
          { events: true },
          { announcements: true },
          // { deposits: true },
          { send: true },
          { receive: true },
          // { tradeExcuted: true },
          // { tradeCanceled: true },
        ],
        coinMovements: [
          {
            meta1: {
              toggle: true,
              tendency: 'up',
              comparator: ['percentage', 1]
            }
          }
        ]
      }
    }
    localStorage.setItem('noti_conf', JSON.stringify(conf));
  }

  const _enablePersistingLog = () => {
    const thiz = this;
    const saveLog = (type, log) => {
      if (typeof log[0] === 'object') Sentry.captureException(log[0]);
      else if (typeof log[0] === 'string') {
        const errorMessage = JSON.stringify(
          Array.from(log).join(' ')
        ).replaceAll('"', '');
        if (
          type === 'error' ||
          log[0].toLowerCase().indexOf('error') > -1 ||
          log[0].toLowerCase().indexOf('err') > -1 ||
          log[0].toLowerCase().indexOf('fail') > -1
        )
          if (log.length > 1)
            if (typeof log[1] === 'object') {
              Sentry.captureException(log[1]);
            } else Sentry.captureMessage(errorMessage, 'error');
          else Sentry.captureMessage(errorMessage, 'error');
        else Sentry.captureMessage(errorMessage);
      }
      console[`str${type}`].apply(console, log);
    };

    console.strlog = console.log.bind(console);
    console.strerror = console.error.bind(console);
    console.strwarn = console.warn.bind(console);
    console.strinfo = console.info.bind(console);
    console.strtimeEnd = console.timeEnd.bind(console);
    console.strdebug = console.debug.bind(console);

    console.log = function () {
      saveLog('log', arguments);
    };
    console.warn = function () {
      saveLog('warn', arguments);
    };
    console.error = function () {
      saveLog('error', arguments);
    };
    console.info = function () {
      saveLog('info', arguments);
    };
    console.timeEnd = function () {
      saveLog('timeEnd', arguments);
    };
    console.debug = function () {
      saveLog('debug', arguments);
    };
  }

  // useEffect(() => {
  //   if (urlParams[0] === 'onMobile=true') {
  //     localStorage.setItem('qr-bio', true);

  //     const accountName = urlParams[1].split('=')[1];
  //     const email = urlParams[2].split('=')[1];

  //     if (accountName && email) {
  //       localStorage.setItem('qr-hash', `${accountName}_${email}`);
  //       setActiveScreen('qr-bio');
  //     } else {
  //       alert("QR code is wrong or link has been edited. Try again.");
  //     }
  //   }
  // }, [urlParams])

  const onLogin = async (login, clicked = false, emailOrPassword = '', fromSignUpFlag = false, signUpEmail = "", web3Token = "", web3PubKey = "", fasToken) => {
    setIsLoading(true);
    if (clicked) {
      dispatch(loginRequestService({ login, emailOrPassword, setLoginDataError, fromSignUpFlag, signUpEmail, web3Token, web3PubKey, fasToken }));
    }
    if (getAccessToken()) {
      console.log('loging', getAccessToken())
      dispatch(checkTransferableRequest({ login }))
      await getAvatarFromBack(login);
      setLoginError(null);
      setAccountName(login);
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

        if (!loginErrorState) {
          setActiveScreen('registration');
        }
      } else {
        if (window.location.search.includes('?signature=success')) {
          sessionStorage.setItem('location', 'wallet');
          setActiveScreen("wallet");
          window.location.href = window.location.href.split('?')[0];
        }
      }
      if (window.location.search.includes('?signature=success')) {
        localStorage.setItem('isSignature', true);
      }
    }
  }, [signatureParam]);

  useEffect(async () => {
    if (loginErrorState) {
      setIsLoading(false);
      setLoginDataError(true);
    }
    if (accountNameState) {
      setLoginDataError(false);
      onLogin(accountNameState, false);
      _onSetupWebSocket(accountNameState);
      if (fromSignUp) {
        setPortfolio(null);
        setRefreshData(prev => !prev);
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
      const token = getAccessToken();
      if (token) {
        let login = await checkToken(token);

        if (login && login.accountName) {
          setToken(token);
          onLogin(login.accountName);
        } else {
          setActiveScreen("login");
        }
      } else {
        setActiveScreen("login");
      }
    }
  }, [accountNameState, loginErrorState]);

  useEffect(() => {
    if (userDataState?.message?.currency === "USD") {
    } else if (userDataState?.message?.currency) {
      const userCurrencyData = `${crypt[userDataState?.message?.currency][1]} ${userDataState?.message?.currency} ${cryptoDataState.ExchangeRate[crypt[userDataState?.message?.currency][0]].rate
        }`
      dispatch(setUserCurrencyAction(userCurrencyData))
    }
  }, [cryptoDataState]);

  // theme change
  useEffect(() => {
    const widget = document.getElementsByTagName("body");
    if (selectedTheme === 'light') {
      widget[0].className = '';
    } else {
      widget[0].className = "theme-dark";
    }
  }, [selectedTheme]);

  useEffect(() => {
    if (!isTokenValidState) {
      console.log('token invalid', errorMsgState)
      setTokenModalOpen(true);
      setTokenModalMsg(errorMsgState);
    } else {
      if (userDataState) {
        dispatch(getCryptosChangeRequest())
      }
    }
  }, [userDataState, isTokenValidState]);

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
        setActiveScreen(
          sessionStorage.getItem("location") != null
            ? sessionStorage.getItem("location")
            : "wallet"
        );
      } catch (e) {
      }
    }
    fetchPortfolio();
  }, [portfolioReceiverState, portfolio, accountName, refreshData]);

  useEffect(() => {
    async function connect() {
      setIsLoading(true);
      Meta1.connect(metaUrl || process.env.REACT_APP_MAIA).then(
        () => {
          setIsLoading(false);
          if (
            accountNameState == null ||
            accountNameState.length === 0
          ) {
            if (localStorage.getItem('isSignature')) {
              setActiveScreen("registration");
              localStorage.removeItem('isSignature');
            } else if (urlParams[0] === 'onMobile=true' || localStorage.getItem("qr-bio")) {
              setActiveScreen('qr-bio');
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
            dispatch(meta1ConnectSuccess(obj));
            console.log('meta1 node connected.');
          }
        },
        () => {
          setActiveScreen("login");
          setLoginError("Error occured");
        }
      );
    }
    connect();
    dispatch(getNotificationsRequest({ login: accountNameState }));
  }, [accountNameState]);

  function refetchPortfolio() {
    setTimeout(async () => {
      if (isLoginState) {
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

  const onRegistration = async (acc, pass, regEmail, web3Token, web3PubKey, fasToken) => {
    setCredentials(acc, pass);
    localStorage.removeItem('fastoken');
    onLogin(acc, true, pass, true, regEmail, web3Token, web3PubKey, fasToken);
    setActiveScreen("wallet");
  };

  const _onSetupWebSocket = (accountName, curWebsocket=null) => {
    try {
      curWebsocket && curWebsocket.close();

      const webSocketFactory = {
        connectionTries: 5,
        connect: function (url) {
          let ws = new WebSocket(url);
          ws.onerror = (error) => {
            console.log('websocket error', error);
          };
          ws.onopen = () => {
            console.log('setup notification websocket');
            webSocketFactory.connectionTries = 5;
          };
          return ws;
        },
      };

      let websocket = new webSocketFactory.connect(
        `${process.env.REACT_APP_NOTIFICATION_WS_URL}?account=${accountName}`
      );


      websocket.onmessage = (message) => {
        var filter = filterNotifications([JSON.parse(message.data)], accountName);
        if (message && message.data && filter.length > 0) {
          const content = JSON.parse(message.data).content;
          toast(<p dangerouslySetInnerHTML={{__html: content}} />);
          dispatch(getNotificationsRequest({ login: accountName }));
        }
      };

      websocket.onclose = (event) => {
        setKafkaWebSocket(null);

        if (event.code > 1001) {
          webSocketFactory.connectionTries = webSocketFactory.connectionTries - 1;

          if (webSocketFactory.connectionTries > 0) {
            setTimeout(() => _onSetupWebSocket(accountName, websocket), 5000);
          } else {
            throw new Error(
              'Maximum number of connection trials has been reached'
            );
          }
        }
      };

      setKafkaWebSocket(websocket);
    } catch (e) {
      console.log('notification connection error', e);
    }
  }

  if (!isOnline) {
    return <DisconnectedInternet appStoreIcon={AppStore} googlePlayIcon={GooglePlay} offlineIcon={OfflineIcon} />;
  }

  if (isLoading || loaderState || activeScreen == null) {
    return <MetaLoader size={"large"} />;
  }

  const themeChangeHandler = () => {
    const newTheme = selectedTheme === "light" ? "dark" : "light";
    setSelectedTheme(newTheme);
    setTheme('theme', newTheme);
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
          refetchPortfolio();
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
        themeSetter={themeChangeHandler}
        themeMode={selectedTheme}
        setActiveScreen={setActiveScreen}
        closeWebsocket={() => kafkaWebsocket && kafkaWebsocket.close()}
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
            refetchPortfolio();
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
                  onClickExchangeAssetHandler={(e, asset) => {
                    e.preventDefault();
                    setTradeAsset(asset);
                    setActiveScreen("exchange");
                  }}
                  portfolio={portfolio}
                  isSignatureProcessing={isSignatureProcessing}
                  signatureResult={signatureResult}
                  web3auth={web3auth}
                  assets={assets}
                  setActiveScreen={setActiveScreen}
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
                  onClickExchangeAssetHandler={(e, asset) => {
                    e.preventDefault();
                    setTradeAsset(asset);
                    setActiveScreen("exchange");
                  }}
                  getAvatarFromBack={getAvatarFromBack}
                  userCurrency={userCurrency}
                  setUserCurrency={setUserCurrency}
                  setTokenModalMsg={setTokenModalMsg}
                  setTokenModalOpen={setTokenModalOpen}
                  assets={assets}
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
                  onClickExchangeAssetHandler={(e, asset) => {
                    e.preventDefault();
                    setTradeAsset(asset);
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
                  onClickExchangeAssetHandler={(e, asset) => {
                    e.preventDefault();
                    setTradeAsset(asset);
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
                  web3auth={web3auth}
                  assets={assets}
                  setActiveScreen={setActiveScreen}
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
                  onClickExchangeAssetHandler={(e, asset) => {
                    e.preventDefault();
                    setTradeAsset(asset);
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
                  onSuccessWithDrawal={() => {
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
                    <div className="headerBlock">
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
                          onClickExchangeAssetHandler={(e, asset) => {
                            e.preventDefault();
                            setTradeAsset(asset);
                            setActiveScreen("exchange");
                          }}
                          setFullPortfolio={setFullPortfolio}
                          userCurrency={userCurrency}
                        />
                      </div>
                      <div className={"bottomAdaptBlock"}>
                        <RightSideHelpMenuSecondType
                          onClickExchangeAssetHandler={(e, asset) => {
                            e.preventDefault();
                            setTradeAsset(asset);
                            setActiveScreen("exchange");
                          }}
                          assets={assets}
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
                    <div className="paperWallet" style={{ padding: "1.1rem 2rem" }}>
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
                    <div className="headerBlock">
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
                          onClickExchangeAssetHandler={(e, asset) => {
                            console.log('@@@@@order')
                            e.preventDefault();
                            setTradeAsset(asset);
                            setActiveScreen("exchange");
                          }}
                          assets={assets}
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
                    <div className="openOrderMainFlex" style={{ padding: "1.1rem 2rem" }}>
                      <div>
                        <h5 style={{ fontSize: "1.15rem", fontWeight: "600" }}>
                          <strong>Open Order</strong>
                        </h5>
                      </div>
                      <div>
                        <CustomizeColumns />
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
            {activeScreen === "notifications" && (
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
                    <div className="notificationMainFlex" style={{ padding: "1.1rem 2rem" }}>
                      <h5 style={{ fontSize: "1.15rem", fontWeight: "600" }}>
                        <strong>All Notifications</strong>
                      </h5>
                    </div>
                    <div className={"justFlexAndDirect justFlexAndDirectMobile"} style={{ backgroundColor: 'var(--backgroundColor2)' }} >
                      <Notifications />
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
            {activeScreen === "announcements" && (
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
                    <div className="notificationMainFlex" style={{ padding: "1.1rem 2rem" }}>
                      <h5 style={{ fontSize: "1.15rem", fontWeight: "600" }}>
                        <strong>All Annoucements</strong>
                      </h5>
                    </div>
                    <div className={"justFlexAndDirect justFlexAndDirectMobile"} style={{ backgroundColor: 'var(--backgroundColor2)' }} >
                      <Announcements />
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
        id={"modal-1"}
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
              dispatch(logoutRequest());
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
        }}
        open={checkTransferableModelState}
        id={"modal-1"}
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
        id={"modal-1"}
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
        id={"modal-1"}
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

      <img src={AppStore} style={{ display: 'none' }} />
      <img src={GooglePlay} style={{ display: 'none' }} />
      <img src={OfflineIcon} style={{ display: 'none' }} />
      <ToastContainer theme='light' />
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
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js">
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
    </Worker>
  );
}

export default App;
