import MetaLoader from "../../UI/loader/Loader";
// import ReactTooltip from 'react-tooltip'
import React, { useState, useEffect } from "react";
import getAllByOne from "../requests/compareCrypto";
import Switch from "@mui/material/Switch";
import fiatIcon from "../../images/4292332.png";
import { Loader } from "semantic-ui-react";
import "./Wallet.css";
import Meta1 from "meta1-vision-dex";
import { useQuery } from "react-query";

import PortfolioTable from "./PortfolioTable";
import { userCurrencySelector } from "../../store/meta1/selector";
import { useSelector } from "react-redux";

// Трансферы между мета1 аккаунтами
// вместо BitShares ставь Meta1
// https://gist.github.com/bogdyak/e0172e95"large"db21f41ccd98c67dfaa7

// Вывод на внешний аккаунт
// вместо BitShares ставь Meta1
// https://gist.github.com/bogdyak/087bf94c61fffc947d94e4dbbd24d692
// обрати внимание что для EOS и XLM нужен мемо это типо доп айдишника

// сначала надо залогиниться в сдк

function Wallet(props) {
  const {
    portfolio,
    onDepositClick,
    onWithdrawClick,
    onAssetSelect,
    onSendClick,
    assets,
    accountName,
    setFullPorfolio,
    userCurrency,
  } = props;
  const userCurrencyState = useSelector(userCurrencySelector);
  const [currentCurrency, setCurrentCurrency] = useState(0);
  const [orders, setOrders] = useState(null);
  const [hideZero, setHideZero] = useState(true);
  const [totalChange, setTotalChange] = useState("0");
  const [totalSum, setTotalSum] = useState(0);
  const [loader, setLoader] = useState(true);
  const [check, setCheck] = useState(false);
  const [isCurrencySelected, setIsCurrencySelected] = useState('')
  const { data, isLoading, error } = useQuery("cryptos", getDatas);

  async function getDatas() {
    const cryptoArray = ["META1", "ETH", "BTC", "BNB", "EOS", "XLM", "LTC"];
    let fetchedCryptos = {};
    for (let i = 0; i < cryptoArray.length; i++) {
      fetchedCryptos[cryptoArray[i]] = await Meta1.ticker(
        "USDT",
        cryptoArray[i]
      );
    }
    fetchedCryptos["USDT"] = { latest: 1, percent_change: 0 };
    return fetchedCryptos;
  }

  useEffect(() => {
    function check() {
      if (!check) {
        setCheck(true);
      }
    }
    check();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setLoader(false);
    }, 1500);
  }, []);

  const { innerWidth: width } = window;
  const isMobile = width <= 600;

  const openDrop = () => {
    document.getElementById("switchContainer").style.display === "none"
      ? (document.getElementById("switchContainer").style.display = "block")
      : (document.getElementById("switchContainer").style.display = "none");
  };

  function currencyValue(datas) {
    let assetValue = data[datas.name].latest;
    if (datas.name === "META1") {
      return (data["META1"].latest * datas?.qty).toFixed(datas.pre);
    } else if (assetValue * datas?.qty === 0) {
      return "0.00";
    } else {
      return (assetValue * datas?.qty).toFixed(datas.pre);
    }
  }

  useEffect(() => {
    if (data && portfolio) {
      let summTik = 0,
        percentage = 0,
        totSum = 0,
        lastChange = 0;
      for (let i of portfolio) {
        if (Number(i.qty) > 0) {
          percentage = Number(data[i.name].percent_change);
          summTik = Number(currencyValue(i));
          lastChange += ((100 - percentage) * summTik) / 100;
          totSum += summTik;
        }
      }
      let ch = Number(100 - (lastChange * 100) / totSum);
      setTotalSum(totSum.toFixed(2));
      if (totalSum == 0) {
        setTotalChange("0.00");
      } else {
        setTotalChange(ch.toFixed(2).toString());
      }
    }
  }, [portfolio, data]);
  const changeCurrencyToFiat = async () => {
    document.getElementById("switchContainer").style.display = "none";
    setCurrentCurrency(currentCurrency + 1);
    document.getElementById("forCheck").innerText = userCurrencyState.split(" ")[1];
  };

  const changeCryptoCurrency = async (e) => {
    let chosen = document.getElementById("forCheck").innerText;
    document.getElementById("switchContainer").style.display = "none";
    let crypto = null;
    switch (e.target.nodeName) {
      case "LI":
        crypto = e.target.outerText;
        break;
      case "SPAN":
        crypto = e.target.outerText;
        break;
      case "IMG":
        crypto = e.target.nextSibling.outerText;
        break;
      default:
        break;
    }
    if (crypto !== "META1") {
      if (document.getElementById("forCheck").innerText === "META1") {
        chosen = userCurrencyState.split(" ")[1];
        let data = await getAllByOne('USDT', crypto);
        sessionStorage.setItem('currencyResult', JSON.stringify(data))
        setCurrentCurrency(currentCurrency + 1);
      } else {
        let data = await getAllByOne('USDT', crypto);
        sessionStorage.setItem('currencyResult', JSON.stringify(data))
      }
    } else {
      setCurrentCurrency(currentCurrency + 1);
      let crypto = "META1";
    }
    setIsCurrencySelected(crypto)
  };

  function Portfolio(props) {
    if (portfolio == null || portfolio.length === 0)
      return <MetaLoader size={"small"} />;
    const filteredPortfolio = hideZero
      ? portfolio.filter((p) => p.qty > 0)
      : portfolio;

    return (
      <PortfolioTable
        assets={assets}
        history={orders}
        filteredPortfolio={filteredPortfolio}
        onSendClick={onSendClick}
        onDepositClick={onDepositClick}
        onWithdrawClick={onWithdrawClick}
        onAssetSelect={props.onAssetSelect}
        onSetHideZero={setHideZero}
        hideZero={hideZero}
        data={data}
        isLoading={isLoading}
        isCurrencySelected={isCurrencySelected}
      />
    );
  }
  return (
    <>
      <div style={{ marginLeft: "3rem" }} className={"totalSumBlock"}>
        <h4
          style={{ color: "#505361", fontSize: ".9rem", marginBottom: ".3rem" }}
        >
          Portfolio Balance
        </h4>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <div
            className={"blockSumAndPercentage"}
            style={{ display: "flex", flexDirection: "row" }}
          >
            <h2 style={{ color: "#FFC000", fontSize: "2rem", margin: "0" }}>
              <strong className={"adaptAmountMain"} style={!isMobile ? { fontSize: '25px' } : { fontSize: '16px !important' }}>
                {loader && isLoading ? (
                  <Loader size="mini" active inline="centered" />
                ) : (
                  userCurrencyState.split(" ")[0] +
                  " " +
                  (totalSum * userCurrencyState.split(" ")[2]).toFixed(2)
                )}
              </strong>
            </h2>
            <h5
              style={{
                margin: ".3rem 0 .5rem 1rem",
                fontSize: ".8rem",
                height: "55%",
                padding: ".3rem",
                borderRadius: "3px",
                boxShadow: "0 4px 9px 5px rgba(0,0,0,.11)",
              }}
              className={Number(totalChange) > 0 ? "plusFirst" : "minusFirst"}
            >
              {Number(totalChange) > 0 ? (
                <i
                  className="far fa-arrow-up fa-xs"
                  style={{ color: "#fff", marginRight: ".2rem" }}
                />
              ) : (
                <i
                  className="far fa-arrow-down fa-xs "
                  style={{ color: "#fff", marginRight: ".2rem" }}
                />
              )}
              {loader && isLoading ? null : totalChange.replace("-", "")} %
            </h5>
          </div>
          <div className="rightSideBlock">
            <div className={"blockChoose"}>
              <noscript id={"forCheck"}>{userCurrencyState.split(" ")[1]}</noscript>
              <div className={"blockChoosen"} onClick={openDrop}>
                <span style={{ textAlign: "center", paddingRight: '2px' }}>
                  Select currency to display
                </span>
                <i
                  className="fas fa-chevron-down"
                  style={{ marginTop: ".2rem" }}
                />
              </div>
              <div
                id={"switchContainer"}
                style={{ position: "relative", display: "none" }}
              >
                <ul className={"chooseContainer"}>
                  <li
                    className={"choosenContainerItem"}
                    onClick={changeCurrencyToFiat}
                  >
                    <img
                      src={fiatIcon}
                      alt="cryptoImage"
                      className="imgContainer"
                    />
                    <span className="spanDrop">
                      Fiat ({userCurrencyState.split(" ")[0]})
                    </span>
                  </li>
                  {assets.map((el, index) => (
                    <li
                      onClick={changeCryptoCurrency}
                      className={"choosenContainerItem"}
                      key={index}
                    >
                      <img
                        src={el.image}
                        style={{ width: "35px" }}
                        alt="cryptoImage"
                        className="imgContainer"
                      />
                      <span className="spanDrop">{el.symbol}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <hr
              style={
                isMobile
                  ? { display: "block", width: "100%" }
                  : { display: "none", width: "100%" }
              }
            />
            <div className={"switcher"} style={{ paddingTop: "1.4rem" }}>
              <span>Hide Zero Balances</span>
              <Switch
                className={"switch"}
                checked={hideZero}
                onChange={() => {
                  setHideZero(!hideZero);
                }}
                inputProps={{ "aria-label": "controlled" }}
                color={"warning"}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="portfolio-table">
        <div className="portfolio-table">
          <Portfolio
            onAssetSelect={onAssetSelect}
          />
        </div>
      </div>
    </>
  );
}

export default Wallet;
