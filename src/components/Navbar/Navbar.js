import React from "react";
import styles from "./Navbar.module.scss";
import "./styles.css";
import logo from "../../images/Logo.png";
import LeftPanelAdapt from "../LeftPanelAdapt/LeftPanelAdapt";
import WidgetOnRamper from "./WidgetOnRamper";

const Navbar = (props) => {
  const {
    onClickHomeHandler,
    onClickPortfolioHandler,
    onClickExchangeHandler,
    onClickPaperWalletHandler,
    onClickOrderTableHandler,
    onClickSettingsHandler,
    onClickHistoryHandler,
    portfolio,
    name,
    userIcon,
    userIconDefault,
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
              <WidgetOnRamper />
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
              window.open("https://meta1.vision");
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
                      window.open("https://support.meta1.vision");
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
                          src={userIcon}
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
                              localStorage.removeItem("login");
                              sessionStorage.setItem("location", "wallet");
                              window.location.reload();
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
                userIcon={userIconDefault}
              />
            ) : null}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
