import * as React from "react";
import styles from "./RightSideHelpMenuSecondType.module.scss";
import { useQuery } from "react-query";
import MetaLoader from "../../UI/loader/Loader";
import { getAsset } from "../Wallet/cryptoChooser";
import getHistory from "../../lib/fetchHistory";
import { removeExponent } from '../../utils/commonFunction'
import { trxTypes } from "../../helpers/utility";
import { ChainTypes as grapheneChainTypes } from 'meta1-vision-js';
const {operations} = grapheneChainTypes;
const ops = Object.keys(operations);
ops.push(
	'property_create_operation',
	'property_update_operation',
	'property_approve_operation',
	'property_delete_operation',
	'asset_price_publish_operation'
);
const RightSideHelpMenuSecondType = (props) => {
  const { onClickExchangeEOSHandler, onClickExchangeUSDTHandler } = props;

  const { data, isLoading } = useQuery("historySideBar", getHistory, {
    refetchInterval: 3000,
  });

  const DateOfStartEOS = 1645998629;
  const DateOfStartUSDT = 1646085029;

  const calculateDate = (date) => {
    return Math.floor((new Date() / 1000 - date) / 86400);
  };

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
        ) : data.length > 0 ? (
          data?.map((el, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "1rem 0",
              }}
            >
              <div
                style={{ margin: "auto 0", width: "6rem", textAlign: "end" }}
              >
                <span
                  className={styles.spanStatusBtn}
                  style={{ background: `#${el.op_color}` }}
                >{trxTypes[ops[el.op_type]]}</span>
              </div>
              <div
                style={{ margin: ".25rem 0", width: "6rem", textAlign: "end" }}
              >
                <p>{removeExponent(Number(el.amount))}</p>
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
