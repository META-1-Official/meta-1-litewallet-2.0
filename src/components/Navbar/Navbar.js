import React from "react";
import styles from "./Navbar.module.scss";
import "./styles.css";
import logo from "../../images/Logo.png";
import LeftPanelAdapt from "../LeftPanelAdapt/LeftPanelAdapt";
import WidgetOnRamper from "./WidgetOnRamper";
import { useDispatch, useSelector } from "react-redux";
import { logoutRequest } from "../../store/account/actions";
import { navbarProfileImageSelector } from "../../store/account/selector";

const Navbar = (props) => {
  const dispatch = useDispatch();
  const navbarProfileImageState = useSelector(navbarProfileImageSelector)
  const {
    onClickHomeHandler,
    onClickPortfolioHandler,
    onClickExchangeHandler,
    onClickPaperWalletHandler,
    onClickOrderTableHandler,
    onClickSettingsHandler,
    onClickHistoryHandler,
    portfolio,
    name
  } = props;

  const { innerWidth: width } = window;
  const isMobile = width <= 600;

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
                src="https://widget.onramper.com/?color=ffc000&amp;defaultAmount=1000&amp;defaultFiat=USD&amp;defaultCrypto=BTC&amp;apiKey=pk_prod_k6LKERIMdGDE8geCxOApKSCy6mnfF5CuhI4TLZj55Wc0"
                title="myFrame"
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
                <button
                  className={
                    name && portfolio ? styles.btn : styles.btnDisabled
                  }
                  disabled={!name && !portfolio}
                  data-bs-toggle="modal"
                  data-bs-target="#fund"
                >
                  Fund Account
                </button>
                <div className={styles.line + styles.adaptNeed} />
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
                            onClick={() => {
                              dispatch(logoutRequest());
                            }}
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
                portfolio={portfolio}
                name={name}
              />
            ) : null}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
