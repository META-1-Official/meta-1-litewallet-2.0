import * as React from "react";
import styles from "./RightSideHelpMenuFirstType.module.scss";

const RightSideHelpMenuFirstType = (props) => {
  const { onClickExchangeUSDTHandler, onClickExchangeEOSHandler, portfolio } =
    props;

  return (
    <>
      <div className={styles.intro}>
        <h5>Intro</h5>
        <hr />
        <div className={styles.helpBlock}>
          <span style={{ marginBottom: ".5rem" }}>
            <a
              data-bs-toggle="modal"
              data-bs-target="#video"
              style={{ cursor: "pointer" }}
            >
              META Wallet Video
            </a>
          </span>
          <span>
            <a
              data-bs-toggle="modal"
              data-bs-target="#terms"
              style={{ cursor: "pointer" }}
            >
              META Wallet Creation Tips
            </a>
          </span>
        </div>
      </div>
      <div className={styles.newCrypto}>
        <h5 style={{ fontWeight: "bold", fontSize: "1rem" }}>
          New Crypto on META1
        </h5>
        <hr />
        <div className={styles.newCryptoBlock}>
          <div
            className={styles.crypto}
            onClick={portfolio ? onClickExchangeUSDTHandler : null}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <img
                style={{ width: "35px", height: "35px", marginTop: ".3rem" }}
                src="https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Tether-USDT-icon.png"
                alt="usdt"
              />
              <div
                className={styles.blockCryptText}
                style={{ marginLeft: ".5rem" }}
              >
                <h6>USDT</h6>
                <span>Added 1 days ago</span>
              </div>
            </div>
            <div style={{ marginTop: "1rem", marginRight: "1rem" }}>
              <i
                style={{ color: "#240000" }}
                className="fas fa-chevron-right event"
              />
            </div>
          </div>
          <hr />
          <div
            className={styles.crypto}
            onClick={portfolio ? onClickExchangeEOSHandler : null}
          >
            <div style={{ display: "flex", flexDirection: "row" }}>
              <img
                style={{ width: "35px", height: "35px", marginTop: ".3rem" }}
                src="https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/EOS-icon.png"
                alt="EOS"
              />
              <div
                className={styles.blockCryptText}
                style={{ marginLeft: ".5rem" }}
              >
                <h6>EOS</h6>
                <span>Added 2 days ago</span>
              </div>
            </div>
            <div style={{ marginTop: "1rem", marginRight: "1rem" }}>
              <i
                style={{ color: "#240000" }}
                className="fas fa-chevron-right event"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RightSideHelpMenuFirstType;
