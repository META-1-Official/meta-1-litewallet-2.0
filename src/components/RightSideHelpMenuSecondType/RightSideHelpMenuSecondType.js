import * as React from "react";
import styles from "./RightSideHelpMenuSecondType.module.scss";
import { useQuery } from "react-query";
import MetaLoader from "../../UI/loader/Loader";
import getHistory from "../../lib/fetchHistory";
import { removeExponent } from '../../utils/commonFunction'
import { trxTypes } from "../../helpers/utility";
import { ChainTypes as grapheneChainTypes } from 'meta1-vision-js';
import { accountsSelector } from "../../store/account/selector";
import { useSelector } from "react-redux";
const { operations } = grapheneChainTypes;
const ops = Object.keys(operations);
ops.push(
  'property_create_operation',
  'property_update_operation',
  'property_approve_operation',
  'property_delete_operation',
  'asset_price_publish_operation'
);
const RightSideHelpMenuSecondType = (props) => {
  const { onClickExchangeAssetHandler, assets } = props;
  const accountNameState = useSelector(accountsSelector);

  const { data, isLoading } = useQuery(["historySideBar", null, null, null, accountNameState], getHistory, {
    refetchInterval: 3000,
  });

  const new_crypto_info = process.env.REACT_APP_NEWCRYPTOS_INFO.split(',');

  const calculateDate = (date) => {
    return Math.floor((new Date() / 1000 - date) / 86400);
  };

  return (
    <div className={`${styles.adaptNeed} ${props.fromHistory ? styles.newAdaptNeed : ''}`}>
      <div className={`${styles.newCrypto} ${typeof props.fromHistory === 'boolean' && props.fromHistory ? styles.newCryptoCustom : ''} ${typeof props.fromHistory === 'string' && props.fromHistory === 'exchange' ? styles.newCryptoCustomExchange : ''}`}>
        <h5 style={{ fontWeight: "bold", fontSize: "1rem" }}>
          New Crypto on META1
        </h5>
        <hr />
        <div className={styles.newCryptoBlock}>
          {new_crypto_info.length > 0 && new_crypto_info.map(new_crypto => {
            let symbol = new_crypto.split('_')[0];
            let date_timestamp = new_crypto.split('_')[1];
            let image;

            assets.map((el) => {
              if (el.symbol === symbol) {
                image = el.image;
              }
            })

            return (
              <div
                className={styles.crypto}
                id={`${symbol.toLowerCase()}usdtBlock`}
                onClick={(e) => onClickExchangeAssetHandler(e, symbol)}
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
                    src={image}
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
      <div className={`${styles.intro} ${typeof props.fromHistory === "boolean" && props.fromHistory ? styles.newIntro : ''} ${typeof props.fromHistory === 'string' && props.fromHistory === 'exchange' ? styles.newCryptoCustomExchange : ''}`}>
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
                  className={`${styles.spanStatusBtn} ${trxTypes[ops[el.op_type]] === 'Cancel order' ? styles.transactionSpanCancel : trxTypes[ops[el.op_type]] === 'Place order' ? styles.transactionSpanPlace : styles.transactionSpanFill}`}
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
