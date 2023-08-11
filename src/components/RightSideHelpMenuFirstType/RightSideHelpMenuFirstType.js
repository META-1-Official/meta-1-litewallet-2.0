import React from "react";
import styles from "./RightSideHelpMenuFirstType.module.scss";
import { getImage } from "../../lib/images";

const RightSideHelpMenuFirstType = (props) => {
  const { onClickExchangeAssetHandler, portfolio } = props;
  const new_crypto_info = process.env.REACT_APP_NEWCRYPTOS_INFO.split(',');

  const calculateDate = (date) => {
    return Math.floor((new Date() / 1000 - date) / 86400);
  };

  return (
    <>
      <div className={styles.intro}>
        <h5>Intro</h5>
        <hr />
        <div className={styles.helpBlock}>
          <span>
            <button
              className={styles.Button}
              style={{ fontSize: "100%", marginTop: "0" }}
              onClick={() => { window.open(process.env.REACT_APP_HOW_TO_CREATE_WALLET) }}
              type={"submit"}
            >
              Get Started
            </button>
          </span>
        </div>
      </div>
      <div className={styles.newCrypto}>
        <h5 style={{ fontWeight: "bold", fontSize: "1rem" }}>
          New Crypto on META1
        </h5>
        <hr />
        <div className={styles.newCryptoBlock}>
          {new_crypto_info.length > 0 && new_crypto_info.map(new_crypto => {
            let symbol = new_crypto.split('_')[0];
            let date_timestamp = new_crypto.split('_')[1];

            if (symbol === '') return null;

            return (
              <div
                className={styles.crypto}
                id={`${symbol.toLowerCase()}usdtBlock`}
                onClick={(e) => portfolio ? onClickExchangeAssetHandler(e, symbol) : null}
                style={{ cursor: "pointer", marginBottom: 5 }}
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
                    src={getImage(symbol)}
                    alt={symbol.toLowerCase()}
                  />
                  <div
                    className={styles.blockCryptText}
                    style={{ marginLeft: ".5rem" }}
                  >
                    <h6>{symbol}</h6>
                    <span>Added {calculateDate(date_timestamp)} days ago</span>
                  </div>
                </div>
                <div style={{ marginTop: "1rem", marginRight: "1rem" }}>
                  <i
                    style={{ color: "#240000" }}
                    className="fas fa-chevron-right event"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  );
};

export default RightSideHelpMenuFirstType;
