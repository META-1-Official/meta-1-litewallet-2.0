import 'regenerator-runtime/runtime'
import TradeWithPassword from './lib/TradeWithPassword'
import SendWithPassword from './lib/SendWithPassword'
import fetchDepositAddress from './lib/fetchDepositAddress'
import Portfolio from './lib/Portfolio'
import linkAccount from './lib/linkAccount'
import React, { useState, useEffect } from 'react'
import { Menu } from 'semantic-ui-react'
import SignUpForm from './components/SignUpForm'
import DepositForm from './components/DepositForm'
import ExchangeForm from './components/ExchangeForm'
import SendForm from './components/SendForm'
import LoginScreen from './components/LoginScreen'
import Wallet from './components/Wallet'
import Settings from "./components/Settings/Settings";
import axios from "axios";
import './App.css'
import Meta1 from 'meta1dex'
import MetaLoader from "./UI/loader/Loader";
import { useLocation, Link } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import LeftPanel from './components/LeftPanel/LeftPanel'
import Footer from "./components/Footer/Footer";
import RightSideHelpMenuSecondType from "./components/RightSideHelpMenuSecondType/RightSideHelpMenuSecondType";
import PaperWalletLogin from "./components/PaperWalletLogin/PaperWalletLogin";
import {OrdersTable} from "./components/Wallet";
import env from "react-dotenv";

window.Meta1 = Meta1
function Application(props) {
    const { metaUrl, linkAccountUrl } = props
    const domAccount =
        props.account !== null &&
        props.account !== undefined &&
        props.account.length > 0
            ? props.account
            : null

    const domEmail =
        props.email !== null &&
        props.email !== undefined &&
        props.email.length > 0
            ? props.email
            : null

    if (domAccount) window.localStorage.setItem('account', domAccount)

    const [tradeAsset, setTradeAsset] = useState('USDT')
    const [fetchDepositFn, setFetchDepositFn] = useState(null)
    const [activeScreen, setActiveScreen] = useState(null)
    const [account, setAccount] = useState(null)
    const [trader, setTrader] = useState(null)
    const [senderApi, setSenderApi] = useState(null)
    const [portfolioReceiver, setPortfolioReceiver] = useState(null)
    const [accountName, setAccountName] = useState(domAccount)
    const [password, setPassword] = useState(
        window.localStorage.getItem('password')
    )
    const [orders, setOrders] = useState(null)
    const [portfolio, setPortfolio] = useState(null)
    const [portfolioFull, setFullPortfolio] = useState([])
    const [assets, setAssets] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const setCredentials = (account, password) => {
        setAccountName(account)
        setPassword(password)
    }
    const [loginError, setLoginError] = useState(null)

    const onLogin = (login) => {
        setLoginError(null)
        setAccountName(login)
        linkAccount(domEmail, accountName, linkAccountUrl)
    }


    useEffect(async () => {

        async function fetchOrders() {
            try {
                if (account && orders === null) {
                    const fetchedOrders = await account.orders()
                    const formattedOrders = fetchedOrders.map((order) => {
                        return {
                            id: order.id,
                            expiration: order.expiration,
                            qty: order.for_sale,
                            amount:
                                order.sell_price.quote.amount /
                                order.sell_price.base.amount
                        }
                    })
                    setOrders(formattedOrders)
                }
            } catch (error) {
                console.log(error)
            }
        }

        fetchOrders()
    }, [account, orders])

    useEffect(() => {
       if (!localStorage.getItem('currency')) {
           localStorage.setItem('currency', '$ USD 1')
       }
    }, [])
    
    useEffect(() => {
        async function fetchPortfolio() {
            if (portfolioReceiver === null) return
            if (portfolio !== null) return
            if (accountName === null || accountName.length === 0) return
            try {
                const fetched = await portfolioReceiver.fetch()
                setAssets(fetched.assets)

                setPortfolio(fetched.portfolio)
                setFullPortfolio(fetched.full)
                window.localStorage.setItem('account', accountName)
            } catch (e) {
                setActiveScreen('login')
                setLoginError('Invalid login')
            }
        }
        fetchPortfolio()
    }, [portfolioReceiver, portfolio])

    useEffect(() => {
        setIsLoading(true)
        Meta1.connect(metaUrl || 'wss://maia.meta1.io/ws').then(
            () => {
                setIsLoading(false)
                if (accountName == null || accountName.length === 0) {
                    setActiveScreen('login')
                } else {
                    setActiveScreen('wallet')
                    domEmail &&
                        linkAccount(domEmail, accountName, linkAccountUrl)
                    setPortfolioReceiver(
                        new Portfolio({
                            metaApi: Meta1,
                            accountName: accountName
                        })
                    )
                    setTrader(
                        new TradeWithPassword({
                            metaApi: Meta1,
                            login: accountName
                        })
                    )

                    setFetchDepositFn((asset) => (asset) => {
                        return fetchDepositAddress({ accountName, asset })
                    })

                    setSenderApi(
                        new SendWithPassword({
                            metaApi: Meta1,
                            login: accountName
                        })
                    )
                }
            },
            (res) => {
                setActiveScreen('login')
                setLoginError('Error occured')
            }
        )
    }, [accountName])

    const onRegistration = (acc, pass, regEmail) => {
        window.localStorage.setItem('account', acc)
        setCredentials(acc, pass)
        linkAccount(domEmail || regEmail, acc)
        setActiveScreen('wallet')
    }

    if (isLoading || activeScreen == null) {
        return <MetaLoader size={'large'}/>
    }


    return (
        <>
        <Navbar
            onClickHomeHandler = {(e) => {
                e.preventDefault();
                setActiveScreen('login')
            }}
            onClickPortfolioHandler = {(e) => {
                e.preventDefault();
                setActiveScreen('wallet')
            }}
            onClickExchangeHandler = {(e) => {
                e.preventDefault();
                setTradeAsset('BTC')
                setActiveScreen('exchange')
            }}
            onClickPaperWalletHandler = {(e) => {
                e.preventDefault();
                setActiveScreen('paperWallet')
            }}
            onClickOrderTableHandler = {(e) => {
                e.preventDefault();
                setActiveScreen('orderTable')
            }}
            onClickSettingsHandler = {(e) => {
                e.preventDefault();
                setActiveScreen('settings')
            }}
            onClickHistoryHandler = {(e) => {
                e.preventDefault();
                setActiveScreen('orderTable')
            }}
            portfolio = {portfolio}
            name = {accountName}
            activeScreen = {activeScreen}
        />
            <div className={'forAdapt'}>
                <LeftPanel
                    onClickHomeHandler = {(e) => {
                        e.preventDefault();
                        setActiveScreen('login')
                    }}
                    onClickPortfolioHandler = {(e) => {
                        e.preventDefault();
                        setActiveScreen('wallet')
                    }}
                    onClickExchangeHandler = {(e) => {
                        e.preventDefault();
                        setTradeAsset('BTC')
                        setActiveScreen('exchange')
                    }}
                    onClickPaperWalletHandler = {(e) => {
                        e.preventDefault();
                        setActiveScreen('paperWallet')
                    }}
                    onClickOrderTableHandler = {(e) => {
                        e.preventDefault();
                        setActiveScreen('orderTable')
                    }}
                    onClickSettingsHandler = {(e) => {
                        e.preventDefault();
                        setActiveScreen('settings')
                    }}
                    onClickHistoryHandler = {(e) => {
                        e.preventDefault();
                        setActiveScreen('orderTable')
                    }}
                    portfolio = {portfolio}
                    name = {accountName}
                    activeScreen = {activeScreen}

                />
                <div style={{width: '100%'}} className="App">
                    <div className="AppContent">
                        {activeScreen === 'registration' && (
                            <div className={'fullBlockWithAdapt'}>
                            <SignUpForm
                                {...props}
                                onRegistration={onRegistration}
                                onBackClick={(e) => {
                                    e.preventDefault()
                                    setActiveScreen('login')

                                }}
                                onClickExchangeUSDTHandler = {(e) => {
                                    e.preventDefault();
                                    setTradeAsset('USDT')
                                    setActiveScreen('exchange')
                                }}
                                onClickExchangeEOSHandler = {(e) => {
                                    e.preventDefault();
                                    setTradeAsset('EOS')
                                    setActiveScreen('exchange')
                                }}
                                portfolio = {portfolio}
                            />
                                <Footer
                                    onClickHomeHandler = {(e) => {
                                        e.preventDefault();
                                        setActiveScreen('login')
                                    }}
                                />
                            </div>
                        )}
                        {
                            activeScreen === 'settings' && (
                            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}>
                                <Settings
                                    account={accountName}
                                    fetcher={fetchDepositFn}
                                    asset={tradeAsset}
                                    address={''}
                                    onBackClick={(e) => {
                                        e.preventDefault()
                                        setActiveScreen('wallet')
                                    }}
                                    onClickExchangeUSDTHandler = {(e) => {
                                        e.preventDefault();
                                        setTradeAsset('USDT')
                                        setActiveScreen('exchange')
                                    }}
                                    onClickExchangeEOSHandler = {(e) => {
                                        e.preventDefault();
                                        setTradeAsset('EOS')
                                        setActiveScreen('exchange')
                                    }}
                                />
                                <Footer
                                    onClickHomeHandler = {(e) => {
                                        e.preventDefault();
                                        setActiveScreen('login')
                                    }}
                                />
                            </div>
                        )}
                        {activeScreen === 'exchange' && (
                            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}>
                            <ExchangeForm
                                onBackClick={(e) => {
                                    e.preventDefault()
                                    setActiveScreen('wallet')
                                }}
                                onSuccessModal={() => setActiveScreen('wallet')}
                                portfolioReceiver={portfolioReceiver}
                                onSuccessTrade={() => setPortfolio(null)}
                                trader={trader}
                                portfolio={portfolio}
                                asset={tradeAsset}
                                metaUrl={metaUrl}
                                assets={assets}
                                onClickExchangeUSDTHandler = {(e) => {
                                    e.preventDefault();
                                    setTradeAsset('USDT')
                                    setActiveScreen('exchange')
                                }}
                                onClickExchangeEOSHandler = {(e) => {
                                    e.preventDefault();
                                    setTradeAsset('EOS')
                                    setActiveScreen('exchange')
                                }}
                            />
                            <Footer
                            onClickHomeHandler = {(e) => {
                            e.preventDefault();
                            setActiveScreen('login')
                        }}
                            />
                            </div>
                        )}

                        {activeScreen === 'login' && (
                            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}>
                            <LoginScreen
                                onSignUpClick={() => setActiveScreen('registration')}
                                error={loginError}
                                onSubmit={onLogin}
                                portfolio={portfolio}
                                onClickExchangeUSDTHandler = {(e) => {
                                    e.preventDefault();
                                    setTradeAsset('USDT')
                                    setActiveScreen('exchange')
                                }}
                                onClickExchangeEOSHandler = {(e) => {
                                    e.preventDefault();
                                    setTradeAsset('EOS')
                                    setActiveScreen('exchange')
                                }}
                            />
                                <Footer
                                    onClickHomeHandler = {(e) => {
                                        e.preventDefault();
                                        setActiveScreen('login')
                                    }}
                                />
                            </div>
                        )}

                        {activeScreen === 'sendFunds' && (
                            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}>
                                <SendForm
                                    portfolioReceiver={portfolioReceiver}
                                    onBackClick={(e) => {
                                        e.preventDefault()
                                        setActiveScreen('wallet')
                                    }}
                                    portfolio={portfolio}
                                    onSuccessTransfer={() => {
                                        setActiveScreen('wallet')
                                        setPortfolio(null)
                                    }}
                                    asset={tradeAsset}
                                    sendApi={senderApi}
                                    sender={accountName}
                                    assets={assets}
                                    onClickExchangeUSDTHandler = {(e) => {
                                        e.preventDefault();
                                        setTradeAsset('USDT')
                                        setActiveScreen('exchange')
                                    }}
                                    onClickExchangeEOSHandler = {(e) => {
                                        e.preventDefault();
                                        setTradeAsset('EOS')
                                        setActiveScreen('exchange')
                                    }}
                                />
                                <Footer
                                onClickHomeHandler = {(e) => {
                                e.preventDefault();
                                setActiveScreen('login')
                            }}
                                />
                            </div>
                        )}

                        {activeScreen === 'deposit' && (
                            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}>
                                <DepositForm
                                    account={account}
                                    fetcher={fetchDepositFn}
                                    asset={tradeAsset}
                                    address={''}
                                    onBackClick={(e) => {
                                        e.preventDefault()
                                        setActiveScreen('wallet')
                                    }}
                                />
                                <Footer
                                onClickHomeHandler = {(e) => {
                                e.preventDefault();
                                setActiveScreen('login')
                            }}
                                />
                            </div>
                        )}

                        {activeScreen === 'wallet' && (
                            <>
                                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}>
                                    <div>
                            <div style={{background: '#fff', padding: '1.1rem 2rem'}}>
                                <h5 style={{fontSize: '1.15rem', fontWeight: '600'}}><strong>Portfolio</strong></h5>
                            </div>
                            <div className={'justFlexAndDirect'}>
                                <div className={'blockInfoYourCrypto'} style={{display: 'flex', flexDirection: 'column', borderRadius: '8px'}}>
                                    <Wallet
                                        assets={assets}
                                        portfolioReceiver={portfolioReceiver}
                                        portfolio={portfolioFull}
                                        tradeAsset={tradeAsset}
                                        onSendClick={(assetName) => {
                                            setTradeAsset(assetName)
                                            setActiveScreen('sendFunds')
                                        }}
                                        onDepositClick={(assetName) => {
                                            setTradeAsset(assetName)
                                            setActiveScreen('deposit')
                                        }}
                                        onAssetSelect={(name) => {
                                            setTradeAsset(name === 'META1' ? 'USDT' : name)
                                            setActiveScreen('exchange')
                                        }}
                                        account={account}
                                        accountName={accountName}
                                        onClickExchangeUSDTHandler = {(e) => {
                                            e.preventDefault();
                                            setTradeAsset('USDT')
                                            setActiveScreen('exchange')
                                        }}
                                        onClickExchangeEOSHandler = {(e) => {
                                            e.preventDefault();
                                            setTradeAsset('EOS')
                                            setActiveScreen('exchange')
                                        }}
                                    />
                                </div>
                                <div className={'bottomAdaptBlock'}>
                                    <RightSideHelpMenuSecondType
                                        onClickExchangeUSDTHandler = {(e) => {
                                            e.preventDefault();
                                            setTradeAsset('USDT')
                                            setActiveScreen('exchange')
                                        }}
                                        onClickExchangeEOSHandler = {(e) => {
                                            e.preventDefault();
                                            setTradeAsset('EOS')
                                            setActiveScreen('exchange')
                                        }}
                                    />
                                </div>
                            </div>
                                    </div>
                            <Footer
                                onClickHomeHandler = {(e) => {
                                    e.preventDefault();
                                    setActiveScreen('login')
                                }}
                            />
                            </div>
                            </>
                        )}
                        {activeScreen === 'paperWallet' && (
                            <>
                                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}>
                                <div>
                                    <div style={{background: '#fff', padding: '1.1rem 2rem'}}>
                                        <h5 style={{fontSize: '1.15rem', fontWeight: '600'}}><strong>Paper Wallet</strong></h5>
                                    </div>
                                    <div className={'paperWalletStyles'}>
                                        <PaperWalletLogin
                                            portfolioReceiver={portfolioReceiver}
                                        />
                                    </div>
                                </div>
                                    <Footer
                                        onClickHomeHandler = {(e) => {
                                            e.preventDefault();
                                            setActiveScreen('login')
                                        }}
                                    />
                                </div>
                            </>
                        )}
                        {activeScreen === 'orderTable' && (
                            <>
                                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}>
                                <div>
                                    <div style={{background: '#fff', padding: '1.1rem 2rem'}}>
                                        <h5 style={{fontSize: '1.15rem', fontWeight: '600'}}><strong>Transfer History</strong></h5>
                                    </div>
                                    <div className={'justFlexAndDirect'} style={{display: 'flex', flexDirection: 'row'}}>
                                    <div className={'paperWalletStyles'} style={{width: '73%', padding: '0'}}>
                                        <OrdersTable
                                            data={orders || []}
                                            column={null}
                                            direction={null}
                                        />
                                    </div>
                                        <div className={'bottomAdaptBlock'} style={{width: '27%'}}>
                                            <RightSideHelpMenuSecondType
                                                onClickExchangeUSDTHandler = {(e) => {
                                                    e.preventDefault();
                                                    setTradeAsset('USDT')
                                                    setActiveScreen('exchange')
                                                }}
                                                onClickExchangeEOSHandler = {(e) => {
                                                    e.preventDefault();
                                                    setTradeAsset('EOS')
                                                    setActiveScreen('exchange')
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Footer
                                    onClickHomeHandler = {(e) => {
                                        e.preventDefault();
                                        setActiveScreen('login')
                                    }}
                                />
                            </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

function AppMenu(props) {
    const location = useLocation()
    return (
        <Menu>
            <Menu.Item name="signup" active={location.pathname === '/'}>
                <Link className="router-link" to="/">
                    Sign Up{' '}
                </Link>
            </Menu.Item>

            <Menu.Item
                name="exchange"
                active={location.pathname === '/exchange'}
            >
                <Link className="router-link" to="/exchange">
                    Exchange
                </Link>
            </Menu.Item>

            <Menu.Item name="wallet" active={location.pathname === '/mywallet'}>
                <Link className="router-link" to="/mywallet">
                    Wallet
                </Link>
            </Menu.Item>
        </Menu>
    )
}

export function App({ domElement }) {
    const metaUrl =
        process.env.META_URL || domElement.getAttribute('data-meta-url')
    const linkAccountUrl =
        process.env.LINK_ACCOUNT_URL || domElement.getAttribute('data-link-url')
    const email = domElement.getAttribute('data-email')
    const firstName = domElement.getAttribute('data-fname')
    const lastName = domElement.getAttribute('data-lname')
    const phone = domElement.getAttribute('data-phone')
    const account = domElement.getAttribute('data-account')
    
    return (
            <Application
                {...{
                    metaUrl,
                    linkAccountUrl,
                    email,
                    firstName,
                    lastName,
                    phone,
                    account
                }}
            />
    )
}

export default App
