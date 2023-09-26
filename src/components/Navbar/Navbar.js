import React, { useEffect, useState, useRef } from "react";
import styles from "./Navbar.module.scss";
import "./styles.css";
import logo from "../../images/Logo.png";
import LeftPanelAdapt from "../LeftPanelAdapt/LeftPanelAdapt";
import { useDispatch, useSelector } from "react-redux";
import { logoutRequest } from "../../store/account/actions";
import { navbarProfileImageSelector, notificationsSelector, accountsSelector } from "../../store/account/selector";
import NotiIcon from "../../images/notification.png";
import { filterNotifications } from "../../utils/common";

import Notification from "../Notification";
import sunIcon from "../../images/sun.png";
import moonIcon from "../../images/moon.png";


const Navbar = (props) => {
  const dispatch = useDispatch();
  const [showNotiDropDown, setShowNotiDropDown] = useState(false);
  const navbarProfileImageState = useSelector(navbarProfileImageSelector);
  const [notifications, setNotifications] = useState();
  const notificationState = useSelector(notificationsSelector);
  const account = useSelector(accountsSelector);

  const {
    onClickHomeHandler,
    onClickPortfolioHandler,
    onClickExchangeHandler,
    onClickPaperWalletHandler,
    onClickOrderTableHandler,
    onClickSettingsHandler,
    onClickHistoryHandler,
    onClickOpenOrderHandler,
    themeSetter,
    themeMode,
    portfolio,
    name,
    onClickResetIsSignatureProcessing,
    setActiveScreen,
    closeWebsocket
  } = props;

  const { innerWidth: width } = window;
  const isMobile = width <= 600;
  const openInNewTab = url => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const ref = useRef(null);

  const handleClickLogout = () => {
    onClickResetIsSignatureProcessing();
    closeWebsocket();
    dispatch(logoutRequest());
  }

  const showNotifications = () => {
    setShowNotiDropDown(!showNotiDropDown);
  }

  const showAllNotifications = () => {
    setShowNotiDropDown(false);
    setActiveScreen('notifications');
  }

  useEffect(() => {
    setNotifications(filterNotifications(notificationState, account));
  }, [notificationState])

  return (
    <>
      <div
        className="modal fade"
        id="fund"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className={"modal-body onramper-wallet"}>
              <button
                style={{ margin: "0 0 0 97%" }}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
              <iframe
                src={`${process.env.REACT_APP_ONRAMPER_URL}?color=ffc000&defaultAmount=1000&defaultFiat=USD&defaultCrypto=BTC&apiKey=${process.env.REACT_APP_ONRAMPER_API_KEY}`}
                title="Meta1 Onramper Interface"
                style={{ border: "0" }}
                allowFullScreen=""
                aria-hidden="false"
                tabIndex="0"
                width="100%"
                height="600"
                frameBorder="0"
              />
            </div>
          </div>
        </div>
      </div>
      <nav
        className={
          styles.navbar + " navbar navbar-expand-lg navbar-dark bg-dark"
        }
      >
        <div className="container-fluid">
          <img
            className={styles.img}
            onClick={() => {
              window.open(process.env.REACT_APP_WALLET_LOGO_HREF);
            }}
            style={{ cursor: "pointer" }}
            src={logo}
            alt="logo"
          />
          {isMobile && portfolio ? (
            <div className={styles.mobileName}>
              <p>
                <strong>Hello, {name}</strong>
              </p>
            </div>
          ) : null}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <div className={"navbar-nav me-auto"} />
            <div className="d-flex">
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div className={styles.blockhelp}>
                  <i
                    className="far fa-question-circle"
                    style={{ marginRight: ".2rem" }}
                  />
                  <span
                    onClick={() => {
                      window.open(process.env.REACT_APP_WALLET_FOOTER_SUPPORT_HREF);
                    }}
                  >
                    Get help
                  </span>
                </div>
                {
                  notifications && <div className={styles.blockNotification} onClick={showNotifications}>
                    <img src={NotiIcon} className={styles.notiIcon} />
                    {notifications.length > 0 && <div className={styles.badgeCount}>{notifications.length}</div>}
                  </div>
                }
                <div className="nav-item dropdown parent-this">
                  <a
                    className={styles.btn}
                    href="#"
                    id="navbarScrollingDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Fund Wallet
                    <span
                      className="nav-link dropdown-toggle for-dropdown"
                      id="navbarScrollingDropdown"
                    ></span>
                    <div
                      className={"imgUser"}
                      style={{ marginLeft: ".3rem" }}
                    >
                    </div>
                  </a>
                  <ul
                    className="dropdown-menu dropdown-width"
                    aria-labelledby="navbarScrollingDropdown"
                    style={{ marginLeft: "-4rem", width: "8rem" }}
                  >
                    <li>
                      <button
                        className="dropdown-item"
                        style={{ textAlign: "center" }}
                        disabled={!name && !portfolio}
                        data-bs-toggle="modal"
                        data-bs-target="#fund"
                      >
                        Fund Wallet With Credit/Debit Card
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        style={{ textAlign: "center" }}
                        onClick={() => openInNewTab(process.env.REACT_APP_FUND_WALLET_WITH_CRYPTOCURRENCY)}
                      >
                        Fund Wallet With Cryptocurrency
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        style={{ textAlign: "center" }}
                        onClick={() => openInNewTab(process.env.REACT_APP_FUND_WALLET_WITH_WIRE_OR_CHECK)}
                      >
                        Fund Wallet with Wire or Check
                      </button>
                    </li>
                  </ul>
                </div>
                <div className={styles.line + styles.adaptNeed} />
                <div
                  className={"imgUser"}
                  style={{ marginLeft: ".3rem" }}
                >
                  <img
                    className={styles.themeChanger}
                    src={themeMode == "dark" ? moonIcon : sunIcon}
                    alt="user"
                    onClick={() => themeSetter()}
                  />
                </div>
                <div
                  className={styles.adaptNeed}
                  style={{
                    marginRight: "1rem",
                    display: "flex",
                    flexDirection: "row",
                    cursor: "pointer",
                  }}
                >
                  <div className="nav-item dropdown">
                    <a
                      className="nav-link dropdown-toggle"
                      href="#"
                      id="navbarScrollingDropdown"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <div
                        className={"imgUser"}
                        style={{ marginLeft: ".3rem" }}
                      >
                        <img
                          className={styles.userImg}
                          id="avatarNavbar"
                          src={navbarProfileImageState}
                          alt="user"
                        />
                      </div>
                    </a>
                    {name && portfolio ? (
                      <ul
                        className="dropdown-menu"
                        aria-labelledby="navbarScrollingDropdown"
                        style={{ marginLeft: "-4rem", width: "8rem" }}
                      >
                        <li>
                          <p
                            className="dropdown-item"
                            style={{ textAlign: "center" }}
                            onClick={handleClickLogout}
                          >
                            Log Out
                          </p>
                        </li>
                      </ul>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            {isMobile ? (
              <LeftPanelAdapt
                onClickHomeHandler={onClickHomeHandler}
                onClickPortfolioHandler={onClickPortfolioHandler}
                onClickExchangeHandler={onClickExchangeHandler}
                onClickPaperWalletHandler={onClickPaperWalletHandler}
                onClickOrderTableHandler={onClickOrderTableHandler}
                onClickSettingsHandler={onClickSettingsHandler}
                onClickHistoryHandler={onClickHistoryHandler}
                onClickResetIsSignatureProcessing={onClickResetIsSignatureProcessing}
                portfolio={portfolio}
                name={name}
                onClick={handleClickLogout}
              />
            ) : null}
          </div>
        </div>
      </nav>
      {showNotiDropDown && <div ref={ref}><Notification notifications={props.notifications} showAllNotifications={showAllNotifications} /></div>}
    </>
  );
};

export default Navbar;
