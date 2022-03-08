import * as React from "react";
import styles from "./RightSideHelpMenuSecondType.module.scss";
import { useQuery } from "react-query";
import Meta1 from "meta1dex";
import MetaLoader from "../../UI/loader/Loader";
import { getAsset } from "../Wallet/cryptoChooser";

const RightSideHelpMenuSecondType = (props) => {
  const { onClickExchangeEOSHandler, onClickExchangeUSDTHandler } = props;

  const { data, isLoading, error } = useQuery("historySideBar", getHistory);

  const DateOfStartEOS = 1645998629;
  const DateOfStartUSDT = 1646085029;

  const calculateDate = (date) => {
    return Math.floor((new Date() / 1000 - date) / 86400);
  };

  async function getHistory() {
    let rawData = await Meta1.history.get_account_history(
      localStorage.getItem("login"),
      "1.11.0",
      30,
      "1.11.0"
    );
    let newRawData = [];
    for (let i = 0; i < rawData.length; i++) {
      if (rawData[i].virtual_op === 0 && newRawData.length !== 3) {
        // Exchange proccesing
        if (rawData[i].op[1]?.seller) {
          let exchangeAsset = await Meta1.db.get_objects([
            rawData[i]?.op[1]?.min_to_receive?.asset_id,
          ]);
          newRawData.push({
            asset: {
              abbr: exchangeAsset[0]?.symbol?.toUpperCase(),
            },
            type: "Exchange",
            volume:
              rawData[i].op[1]?.min_to_receive?.amount /
              10 ** exchangeAsset[0].precision,
          });
        }
        // Send proccesing
        else if (rawData[i].op[1]?.from) {
          let exchangeAsset = await Meta1.db.get_objects([
            rawData[i]?.op[1]?.amount.asset_id,
          ]);
          newRawData.push({
            asset: {
              abbr: exchangeAsset[0]?.symbol?.toUpperCase(),
            },
            type: "Send",
            volume:
              rawData[i].op[1]?.amount?.amount /
              10 ** exchangeAsset[0].precision,
          });
        }
      }
    }
    return newRawData;
  }

  return (
    <div className={styles.adaptNeed}>
      <div className={styles.newCrypto}>
        <h5 style={{ fontWeight: "bold", fontSize: "1rem" }}>
          New Crypto on META1
        </h5>
        <hr />
        <div className={styles.newCryptoBlock}>
          <div
            className={styles.crypto}
            id={"usdtBlock"}
            onClick={onClickExchangeUSDTHandler}
            style={{ cursor: "pointer" }}
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
                alt="uniswap"
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
          <div
            className={styles.crypto}
            id={"eosBlock"}
            onClick={onClickExchangeEOSHandler}
            style={{ cursor: "pointer" }}
          >
            <div style={{ display: "flex", flexDirection: "row" }}>
              <img
                style={{ width: "35px", height: "35px", marginTop: ".3rem" }}
                src="https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/EOS-icon.png"
                alt="cordano"
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
      <div className={styles.intro}>
        <h5>Recent Transactions</h5>
        <hr />
        {isLoading ? (
          <MetaLoader size={"small"} />
        ) : data ? (
          data?.map((el, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                margin: "1rem 0",
              }}
            >
              <div
                style={{
                  margin: "auto 0",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  width: "6rem",
                }}
              >
                {getAsset(el.asset.abbr)}
                <p
                  style={{
                    color: "",
                    marginLeft: ".5rem",
                    fontSize: ".8rem",
                    marginTop: "-.3rem",
                  }}
                >
                  <strong>{el.asset.abbr}</strong>
                </p>
              </div>
              <div
                style={{ margin: "auto 0", width: "4rem", textAlign: "end" }}
              >
                <h6>{el.type}</h6>
              </div>
              <div
                style={{ margin: "auto 0", width: "6rem", textAlign: "end" }}
              >
                <h6>{Number(Number(el.volume).toFixed(5))}</h6>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.helpBlock}>
            <span>
              You don't own any crypto. <br /> Ready to make a purchase?
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSideHelpMenuSecondType;
