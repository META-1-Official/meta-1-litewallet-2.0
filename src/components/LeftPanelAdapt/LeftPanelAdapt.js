import * as React from "react";
import styles from "./LeftPanelAdapt.module.scss";
import "./LeftPanelAdapt.css";
import user from "../../images/default-pic1.png";

const LeftPanelAdapt = (props) => {
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
  } = props;

  return (
    <ul className={styles.mainBlockAdapt + " nav flex-column"}>
      <li className="nav-item">
        <div className={styles.userinfo}>
          <div>
            <img
              className={styles.imageUser}
              id="leftAvatarAdapt"
              src={userIcon}
              alt="user"
            />
          </div>
          <span
            style={{
              textAlign: "center",
              margin: "1.4rem 0 0 .7rem",
              fontWeight: "bold",
              fontSize: ".8rem",
            }}
          >
            {name && portfolio ? name : "Unlinked user"}
          </span>
        </div>
      </li>
      <li
        style={{ marginTop: "1rem" }}
        onClick={portfolio ? onClickHomeHandler : null}
        className={styles.Li + " nav-item"}
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
      >
        <div className={styles.containerLi}>
          <div className={styles.circle}>
            <i
              style={{ margin: ".55rem .5rem" }}
              className="fas fa-home-lg-alt"
            />
          </div>
          <div className={styles.textSpan}>
            <span>Home</span>
          </div>
        </div>
      </li>
      <li className={styles.Li + " nav-item dropdown"}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
          id="navbarDropdown"
          role="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          className={styles.containerLi + " event"}
        >
          <div
            className={"event"}
            style={{ display: "flex", flexDirection: "row" }}
          >
            <div className={styles.circle + " event"}>
              <i
                style={{ margin: ".6rem .54rem" }}
                className="far fa-briefcase event"
              />
            </div>
            <div className={styles.textSpan + " event"}>
              <span className={"event"}>Portfolio</span>
            </div>
          </div>
          <div
            className={"event"}
            style={{ marginTop: "1.4rem", marginRight: "1rem" }}
          >
            <i
              style={{ color: "#240000" }}
              className="fas fa-chevron-right event"
            />
          </div>
        </div>
        <ul
          className={"event dropdown-menu needToBeYellow"}
          aria-labelledby="navbarDropdown"
        >
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "300",
              color: "#d59900",
              textAlign: "center",
            }}
          >
            Portfolio
          </h1>
          <li
            className={"event dropdown-item"}
            onClick={portfolio ? onClickPortfolioHandler : null}
            style={{ cursor: "pointer", textAlign: "center", color: "#fff" }}
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
          >
            Show All Balance
          </li>
          <hr />
          <li
            className={"event dropdown-item"}
            onClick={portfolio ? onClickOrderTableHandler : null}
            style={{ cursor: "pointer", textAlign: "center", color: "#fff" }}
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
          >
            Open Orders
          </li>
          {/* <hr />
          <li
            className={"event dropdown-item"}
            onClick={portfolio ? onClickPaperWalletHandler : null}
            style={{ cursor: "pointer", textAlign: "center", color: "#fff" }}
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
          >
            Paper Wallet
          </li> */}
        </ul>
      </li>
      <li
        className={styles.Li + " nav-item"}
        onClick={portfolio ? onClickExchangeHandler : null}
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
      >
        <div className={styles.containerLi}>
          <div className={styles.circle}>
            <i style={{ margin: ".6rem .54rem" }} className="fad fa-exchange" />
          </div>
          <div className={styles.textSpan}>
            <span>Exchange</span>
          </div>
        </div>
      </li>
      <li
        className={styles.Li + " nav-item"}
        onClick={portfolio ? onClickHistoryHandler : null}
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
      >
        <div className={styles.containerLi}>
          <div className={styles.circle}>
            <i style={{ margin: ".6rem .54rem" }} className="fas fa-history" />
          </div>
          <div className={styles.textSpan}>
            <span>Transfer History</span>
          </div>
        </div>
      </li>
      <li
        className={styles.Li + " nav-item"}
        onClick={portfolio ? onClickSettingsHandler : null}
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
      >
        <div className={styles.containerLi}>
          <div className={styles.circle}>
            <i style={{ margin: ".6rem .54rem" }} className="far fa-cog" />
          </div>
          <div className={styles.textSpan}>
            <span>Settings</span>
          </div>
        </div>
      </li>
      <li
        className={styles.Li + " nav-item"}
        onClick={() => {
          localStorage.removeItem("login");
          sessionStorage.setItem("location", "wallet");
          window.location.reload();
        }}
      >
        <div className={styles.containerLi}>
          <div className={styles.circle}>
            <i style={{ margin: ".6rem .62rem" }} className="fa fa-sign-out" />
          </div>
          <div className={styles.textSpan}>
            <span>Log Out</span>
          </div>
        </div>
      </li>
    </ul>
  );
};

export default LeftPanelAdapt;
