import * as React from "react";
import styles from "./LeftPanel.module.scss";
import { useEffect } from "react";
import user from "../../images/default-pic1.png";
import firstPart from "../../images/assetsForSidebar/Shape 2.png";
import secondPart from "../../images/assetsForSidebar/Shape 2 copy.png";
import homeIcon from "../../images/assetsForSidebar/Shape 5.png";

const LeftPanel = (props) => {
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
    activeScreen,
    userIcon,
  } = props;

  const portfolioScrollPositionHoverEvent = (e) => {
    if (e.clientY <= 70) {
      if (document.querySelector('#modalBlock')) {
        document.querySelector('#modalBlock').style.top = '2%'
      }
    } else if (e.clientY < 100 && e.clientY > 70) {
      document.querySelector('#modalBlock').style.top = '3%'
    } else if (e.clientY < 200 && e.clientY >= 100) {
      if (document.querySelector('#modalBlock')) {
        document.querySelector('#modalBlock').style.top = '7%'
      }
    } else {
      if (document.querySelector('#modalBlock')) {
        document.querySelector('#modalBlock').style.top = '20%'
      }
    }
  }

  useEffect(() => {
    document.querySelector('.portforlio-class').addEventListener('mouseenter', portfolioScrollPositionHoverEvent);
  }, [])
  useEffect(() => {
    if (name && portfolio) {
      setTimeout(() => {
        let allEvents = document.getElementsByClassName("event");
        for (let i = 0; i < allEvents.length; i++) {
          allEvents[i].addEventListener("mouseover", () => {
            document.getElementById("modalBlock").style.display = "block";
          });
          allEvents[i].addEventListener("mouseout", () => {
            document.getElementById("modalBlock").style.display = "none";
          });
        }
      }, 25);
    }
  }, [name, portfolio]);

  return (
    <ul id={"mainBlock"} className={styles.mainBlock + " nav flex-column"}>
      <li className="nav-item">
        <div className={styles.userinfo}>
          <div>
            <img
              className={styles.imageUser}
              src={userIcon}
              id="leftAvatar"
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
      >
        <div className={styles.containerLi}>
          <div className={styles.circle}>
            <img style={{ padding: ".47rem .5rem" }} src={homeIcon} alt="" />
          </div>
          <div
            className={styles.textSpan}
            style={activeScreen === "login" ? { color: "#FFC000" } : null}
          >
            <span>Home</span>
          </div>
        </div>
      </li>
      <div
        id={"modalBlock"}
        style={{ display: "none" }}
        className={styles.modalBlock + " event"}
      >
        <div className={styles.modalContent + " event"}>
          <h1 className={"event"}>Portfolio</h1>
          <ul className={"event"}>
            <li
              className={"event"}
              onClick={portfolio ? onClickPortfolioHandler : null}
              style={{ cursor: "pointer" }}
            >
              Show All Balance
            </li>
            <li
              className={"event"}
              onClick={portfolio ? onClickOrderTableHandler : null}
              style={{ cursor: "pointer" }}
            >
              Open Orders
            </li>
            {/* <li
              className={"event"}
              onClick={portfolio ? onClickPaperWalletHandler : null}
              style={{ cursor: "pointer" }}
            >
              Paper Wallet
            </li> */}
          </ul>
        </div>
      </div>
      <li
        className={
          name && portfolio
            ? styles.Li + " nav-item event portforlio-class"
            : styles.LiDisabled + " nav-item event portforlio-class"
        }
        onClick={portfolio ? onClickPortfolioHandler : null}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
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
            <div
              className={styles.textSpan + " event"}
              style={
                activeScreen === "portfolio" ||
                activeScreen === "sendFunds" ||
                activeScreen === "deposit" ||
                activeScreen === "wallet" ||
                activeScreen === "paperWallet"
                ? { color: "#FFC000" }
                : null
              }
            >
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
      </li>
      <li
        className={
          name && portfolio
            ? styles.Li + " nav-item"
            : styles.LiDisabled + " nav-item"
        }
        onClick={portfolio ? onClickExchangeHandler : null}
      >
        <div className={styles.containerLi}>
          <div className={styles.circle}>
            <div
              style={{ position: "relative", width: "30px", height: "30px" }}
            >
              <img
                src={firstPart}
                style={{ position: "absolute", top: "10px", left: "6.5px" }}
                alt=""
              />
              <img
                src={secondPart}
                style={{ position: "absolute", top: "14px", left: "14.5px" }}
                alt=""
              />
            </div>
          </div>
          <div
            className={styles.textSpan}
            style={activeScreen === "exchange" ? { color: "#FFC000" } : null}
          >
            <span>Exchange</span>
          </div>
        </div>
      </li>
      <li
        className={
          name && portfolio
            ? styles.Li + " nav-item"
            : styles.LiDisabled + " nav-item"
        }
        onClick={portfolio ? onClickHistoryHandler : null}
      >
        <div className={styles.containerLi}>
          <div className={styles.circle}>
            <i style={{ margin: ".6rem .54rem" }} className="fas fa-history" />
          </div>
          <div
            className={styles.textSpan}
            style={activeScreen === "orderTable" ? { color: "#FFC000" } : null}
          >
            <span>Transfer History</span>
          </div>
        </div>
      </li>
      <li
        className={
          name && portfolio
            ? styles.Li + " nav-item"
            : styles.LiDisabled + " nav-item"
        }
        onClick={portfolio ? onClickSettingsHandler : null}
      >
        <div className={styles.containerLi}>
          <div className={styles.circle}>
            <i style={{ margin: ".6rem .54rem" }} className="far fa-cog" />
          </div>
          <div
            className={styles.textSpan}
            style={activeScreen === "settings" ? { color: "#FFC000" } : null}
          >
            <span>Settings</span>
          </div>
        </div>
      </li>
    </ul>
  );
};

export default LeftPanel;
