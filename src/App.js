import "regenerator-runtime/runtime";
import TradeWithPassword from "./lib/TradeWithPassword";
import SendWithPassword from "./lib/SendWithPassword";
import fetchDepositAddress from "./lib/fetchDepositAddress";
import Portfolio from "./lib/Portfolio";
import { getCryptosChange } from "./API/API";
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
import Meta1 from "meta1dex";
import MetaLoader from "./UI/loader/Loader";
import Navbar from "./components/Navbar/Navbar";
import LeftPanel from "./components/LeftPanel/LeftPanel";
import Footer from "./components/Footer/Footer";
import RightSideHelpMenuSecondType from "./components/RightSideHelpMenuSecondType/RightSideHelpMenuSecondType";
import PaperWalletLogin from "./components/PaperWalletLogin/PaperWalletLogin";
import { OrdersTable } from "./components/Wallet/OrdersTable";
import CheckPassword from "./lib/CheckPassword";

window.Meta1 = Meta1;
function Application(props) {
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
  const [trader, setTrader] = useState(null);
  const [userImageNavbar, setUserImageNavbar] = useState(logoNavbar);
  const [userImageDefault, setUserImageDefault] = useState(logoDefalt);
  const [cryptoData, setCryptoData] = useState({});
  const [senderApi, setSenderApi] = useState(null);
  const [portfolioReceiver, setPortfolioReceiver] = useState(null);
  const [accountName, setAccountName] = useState(domAccount);
  const [checkPaswordObj, setCheckPaswordObj] = useState(null);
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
  const [userCurrency, setUserCurrency] = useState("$ USD 1");

  useEffect(() => {
    if (login !== null) {
      onLogin(login);
    }
  }, []);

  const onLogin = async (login, clicked = false) => {
    await getAvatarFromBack(login);
    setLoginError(null);
    setAccountName(login);
    localStorage.setItem("login", login);
    if (clicked) {
      setLoginError(true);
    }
  };

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

  async function getAvatarFromBack(login) {
    try {
      const data = await getUserData(login);
      const response = await getCryptosChange();
      setCryptoData(response);
      if (data?.message.userAvatar != null) {
        let avatarImage = `https://${process.env.REACT_APP_BACK_URL}/public/${data.message.userAvatar}`;
        setUserImageDefault(avatarImage);
        setUserImageNavbar(avatarImage);
      }
      if (data?.message?.currency === "USD") {
      } else if (data?.message?.currency) {
        setUserCurrency(
          `${crypt[data?.message?.currency][1]} ${data?.message?.currency} ${response.ExchangeRate[crypt[data?.message?.currency][0]].rate
          }`
        );
      }
    } catch (e) { }
  }

  useEffect(() => {
    async function fetchPortfolio() {
      if (portfolioReceiver === null) return;
      if (portfolio !== null) return;
      if (accountName === null || accountName.length === 0) return;
      try {
        const fetched = await portfolioReceiver.fetch();
        setAssets(fetched.assets);
        setPortfolio(fetched.portfolio);
        setFullPortfolio(fetched.full);
        localStorage.setItem("account", accountName);
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
  }, [portfolioReceiver, portfolio, accountName]);

  useEffect(() => {
    async function connect() {
      setIsLoading(true);
      Meta1.connect(metaUrl || process.env.REACT_APP_MAIA).then(
        () => {
          setIsLoading(false);
          if (
            accountName == null ||
            accountName.length === 0 ||
            !localStorage.getItem("login")
          ) {
            setActiveScreen("login");
          } else {
            setActiveScreen(
              sessionStorage.getItem("location") != null
                ? sessionStorage.getItem("location")
                : "wallet"
            );

            setPortfolioReceiver(
              new Portfolio({
                metaApi: Meta1,
                accountName: accountName,
              })
            );
            setTrader(
              new TradeWithPassword({
                metaApi: Meta1,
                login: accountName,
              })
            );
            setCheckPaswordObj(
              new CheckPassword({
                metaApi: Meta1,
                login: accountName,
              })
            );

            setFetchDepositFn((asset) => (asset) => {
              return fetchDepositAddress({ accountName, asset });
            });

            setSenderApi(
              new SendWithPassword({
                metaApi: Meta1,
                login: accountName,
              })
            );
          }
        },
        () => {
          setActiveScreen("login");
          setLoginError("Error occured");
        }
      );
    }
    connect();
  }, [accountName]);

  function refetchPortfolio() {
    setTimeout(async () => {
      const fetched = await portfolioReceiver.fetch();
      setPortfolio(fetched.portfolio);
      setFullPortfolio(fetched.full);
    }, 2000);
  }

  const onRegistration = (acc, pass, regEmail) => {
    localStorage.setItem("account", acc);
    localStorage.setItem("login", acc);
    onLogin(acc);
    setCredentials(acc, pass);
    setActiveScreen("wallet");
  };

  async function chngLastLocation(location) {
    if (location && location !== "login") {
      await changeLastLocation(localStorage.getItem("login"), location);
    }
  }

  if (isLoading || activeScreen == null) {
    return <MetaLoader size={"large"} />;
  }

  return (
    <>
      <Navbar
        onClickHomeHandler={(e) => {
          e.preventDefault();
          setActiveScreen("login");
        }}
        onClickPortfolioHandler={(e) => {
          e.preventDefault();
          setActiveScreen("wallet");
        }}
        onClickExchangeHandler={(e) => {
          e.preventDefault();
          setTradeAsset("BTC");
          setActiveScreen("exchange");
        }}
        onClickPaperWalletHandler={(e) => {
          e.preventDefault();
          setActiveScreen("paperWallet");
        }}
        onClickOrderTableHandler={(e) => {
          e.preventDefault();
          setActiveScreen("orderTable");
        }}
        onClickSettingsHandler={(e) => {
          e.preventDefault();
          setActiveScreen("settings");
        }}
        onClickHistoryHandler={(e) => {
          e.preventDefault();
          setActiveScreen("orderTable");
        }}
        portfolio={portfolio}
        name={accountName}
        activeScreen={activeScreen}
        userIcon={userImageNavbar}
        userIconDefault={userImageDefault}
      />
      <div className={"forAdapt"}>
        <LeftPanel
          onClickHomeHandler={(e) => {
            e.preventDefault();
            setActiveScreen("login");
          }}
          onClickPortfolioHandler={(e) => {
            e.preventDefault();
            setActiveScreen("wallet");
          }}
          onClickExchangeHandler={(e) => {
            e.preventDefault();
            setTradeAsset("BTC");
            setActiveScreen("exchange");
          }}
          onClickPaperWalletHandler={(e) => {
            e.preventDefault();
            setActiveScreen("paperWallet");
          }}
          onClickOrderTableHandler={(e) => {
            e.preventDefault();
            setActiveScreen("orderTable");
          }}
          onClickSettingsHandler={(e) => {
            e.preventDefault();
            setActiveScreen("settings");
          }}
          onClickHistoryHandler={(e) => {
            e.preventDefault();
            setActiveScreen("orderTable");
          }}
          portfolio={portfolio}
          name={accountName}
          activeScreen={activeScreen}
          userIcon={userImageDefault}
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
                  account={accountName}
                  cryptoData={cryptoData}
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
                  userIcon={userImageDefault}
                  getAvatarFromBack={getAvatarFromBack}
                  userCurrency={userCurrency}
                  setUserCurrency={setUserCurrency}
                  setUserImageDefault={setUserImageDefault}
                  setUserImageNavbar={setUserImageNavbar}
                  checkPaswordObj={checkPaswordObj}
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
                  portfolioReceiver={portfolioReceiver}
                  onSuccessTrade={() => {
                    setPortfolio(null);
                    refetchPortfolio();
                  }}
                  trader={trader}
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
                  userCurrency={userCurrency}
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
                  portfolioReceiver={portfolioReceiver}
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
                  sendApi={senderApi}
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
                  userCurrency={userCurrency}
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
                  sendEmail={sendEmail}
                  asset={tradeAsset}
                  assets={assets}
                  portfolio={portfolio}
                  userCurrency={userCurrency}
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
                          portfolioReceiver={portfolioReceiver}
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
                      <PaperWalletLogin portfolioReceiver={portfolioReceiver} />
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
                      <div className={"paperWalletStylesTH"}>
                        <OrdersTable
                          data={orders}
                          column={null}
                          direction={null}
                          assets={assets}
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
