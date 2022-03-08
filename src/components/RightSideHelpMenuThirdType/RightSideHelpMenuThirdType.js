import * as React from "react";
import styles from "./RightSideHelpMenuThirdType.module.scss";

const RightSideHelpMenuSecondType = (props) => {
  const { onClickExchangeEOSHandler, onClickExchangeUSDTHandler, portfolio } =
    props;

  const DateOfStartEOS = 1645998629;
  const DateOfStartUSDT = 1646085029;

  const calculateDate = (date) => {
    return Math.floor((new Date() / 1000 - date) / 86400);
  };

  return (
    <>
      <div className={styles.newCrypto}>
        <h5 style={{ fontWeight: "bold", fontSize: "1rem" }}>
          New Crypto on META1
        </h5>
        <hr />
        <div className={styles.newCryptoBlock}>
          <div className={styles.crypto} onClick={onClickExchangeUSDTHandler}>
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
                <span>Added {calculateDate(DateOfStartUSDT)} days ago</span>
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
          <div className={styles.crypto} onClick={onClickExchangeEOSHandler}>
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
                <span>Added {calculateDate(DateOfStartEOS)} days ago</span>
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

export default RightSideHelpMenuSecondType;
