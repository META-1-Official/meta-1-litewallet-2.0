import "regenerator-runtime/runtime";
import TradeWithPassword from "./lib/TradeWithPassword";
import SendWithPassword from "./lib/SendWithPassword";
import fetchDepositAddress from "./lib/fetchDepositAddress";
import Portfolio from "./lib/Portfolio";
import { getCryptosChange, loginRequest } from "./API/API";
import React, { useState, useEffect } from "react";
import { getUserData, changeLastLocation, getLastLocation } from "./API/API";
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
import { getAccessToken, setAccessToken } from "./utils/localstorage";
import { useDispatch, useSelector } from "react-redux";
import { accountsSelector, tokenSelector, loaderSelector, isLoginSelector, loginErrorSelector, demoSelector, isTokenValidSelector, userDataSelector, errorMsgSelector } from "./store/account/selector";
import { getUserRequest, loginRequestService, logoutRequest } from "./store/account/actions";
import { checkPasswordObjSelector, cryptoDataSelector, meta1Selector, portfolioReceiverSelector, senderApiSelector, traderSelector } from "./store/meta1/selector";
import { getCryptosChangeRequest, meta1ConnectSuccess, resetMetaStore, setUserCurrencyAction } from "./store/meta1/actions";

window.Meta1 = Meta1;
function Application(props) {
  const accountNameState = useSelector(accountsSelector);
  const tokenState = useSelector(tokenSelector);
  const loaderState = useSelector(loaderSelector);
  const loginErrorState = useSelector(loginErrorSelector);
  const isTokenValidState = useSelector(isTokenValidSelector);
  const userDataState = useSelector(userDataSelector);
  const errorMsgState = useSelector(errorMsgSelector);
  const demoState = useSelector(demoSelector);
  const meta1State = useSelector(meta1Selector);
  const cryptoDataState = useSelector(cryptoDataSelector);

  const portfolioReceiverState = useSelector(portfolioReceiverSelector);
  const traderState = useSelector(traderSelector);
  const checkPasswordObjState = useSelector(checkPasswordObjSelector);
  const senderApiState = useSelector(senderApiSelector);

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
  const dispatch = useDispatch();

  useEffect(() => {
    if (login !== null) {
      onLogin(login);
    }
  }, []);

  const onLogin = async (login, clicked = false, password = '', fromSignUpFlag = false) => {
    setIsLoading(true);
    if (clicked) {
      dispatch(loginRequestService({login ,password, setLoginDataError}));
    }
    if (getAccessToken()) {
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
      }
    }
    if (accountNameState === null) {
      setAccountName(null);
      setLogin(null);
      setPortfolio(null);
      setActiveScreen("login");
    }
  },[accountNameState, loginErrorState]);

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
        setAssets(fetched.assets);
        setPortfolio(fetched.portfolio);
        setFullPortfolio(fetched.full);
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
            setActiveScreen("login");
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
      const fetched = await portfolioReceiverState.fetch();
      setPortfolio(fetched.portfolio);
      setFullPortfolio(fetched.full);
    }, 2000);
  }

  const onRegistration = (acc, pass, regEmail) => {
    localStorage.setItem("account", acc);
    localStorage.setItem("login", acc);
    setCredentials(acc, pass);
    onLogin(acc, true, pass, true);
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
        }}
        onClickPortfolioHandler={(e) => {
          e.preventDefault();
          dispatch(getUserRequest(login));
          setActiveScreen("wallet");
        }}
        onClickExchangeHandler={(e) => {
          e.preventDefault();
          dispatch(getUserRequest(login));
          setTradeAsset("BTC");
          setActiveScreen("exchange");
        }}
        onClickPaperWalletHandler={(e) => {
          e.preventDefault();
          dispatch(getUserRequest(login));
          setActiveScreen("paperWallet");
        }}
        onClickOrderTableHandler={(e) => {
          e.preventDefault();
          dispatch(getUserRequest(login));
          setActiveScreen("orderTable");
        }}
        onClickSettingsHandler={(e) => {
          e.preventDefault();
          dispatch(getUserRequest(login));
          setActiveScreen("settings");
        }}
        onClickHistoryHandler={(e) => {
          e.preventDefault();
          dispatch(getUserRequest(login));
          setActiveScreen("orderTable");
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
          }}
          onClickPortfolioHandler={(e) => {
            e.preventDefault();
            dispatch(getUserRequest(login));
            setActiveScreen("wallet");
          }}
          onClickExchangeHandler={(e) => {
            e.preventDefault();
            dispatch(getUserRequest(login));
            setTradeAsset("BTC");
            setActiveScreen("exchange");
          }}
          onClickPaperWalletHandler={(e) => {
            e.preventDefault();
            dispatch(getUserRequest(login));
            setActiveScreen("paperWallet");
          }}
          onClickOrderTableHandler={(e) => {
            e.preventDefault();
            dispatch(getUserRequest(login));
            setActiveScreen("orderTable");
          }}
          onClickSettingsHandler={(e) => {
            e.preventDefault();
            dispatch(getUserRequest(login));
            setActiveScreen("settings");
          }}
          onClickHistoryHandler={(e) => {
            e.preventDefault();
            dispatch(getUserRequest(login));
            setActiveScreen("orderTable");
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
                />
                <Footer
                  onClickHomeHandler={(e) => {
                    e.preventDefault();
                    setActiveScreen("login");
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
                  }}
                />
                <Footer
                  onClickHomeHandler={(e) => {
                    e.preventDefault();
                    setActiveScreen("login");
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
                  asset={tradeAsset}
                  assets={assets}
                  portfolio={portfolio}
                  onBackClick={(e) => {
                    e.preventDefault();
                    setActiveScreen("wallet");
                  }}
                  setTokenModalOpen={setTokenModalOpen}
                  setTokenModalMsg={setTokenModalMsg}
                />
                <Footer
                  onClickHomeHandler={(e) => {
                    e.preventDefault();
                    setActiveScreen("login");
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
                        <strong>Transfer History</strong>
                      </h5>
                    </div>
                    <div className={"justFlexAndDirect"}>
                      <div className={"paperWalletStylesTH marginBottomZero"}>
                        <OrdersTable
                          data={orders}
                          column={null}
                          direction={null}
                          assets={assets}
                        />
                      </div>
                      <div className={"bottomAdaptBlock margin-class"}>
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
              dispatch(logoutRequest())
            }}
          >
            OK
          </Button>
        </Modal.Actions>
      </Modal>}
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
