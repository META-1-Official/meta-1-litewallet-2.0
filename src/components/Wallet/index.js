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
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

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
  const [isCurrencySelectedEmpty, setIsCurrencySelectedEmpty] = useState(true);
  const [selectBoxOpen, setSelectBoxOpen] = useState(false);
  const { data, isLoading, error } = useQuery("cryptos", getDatas);

  async function getDatas() {
    const cryptoArray = process.env.REACT_APP_CRYPTOS_ARRAY.split(',');
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
    if (isCurrencySelected === '' && !isCurrencySelectedEmpty && !selectBoxOpen) {
      setIsCurrencySelectedEmpty(true);
    }
    if (isCurrencySelected !== '' && isCurrencySelectedEmpty) {
      setIsCurrencySelectedEmpty(false);
    }
  }, [isCurrencySelected, selectBoxOpen]);

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

  const changeCryptoCurrency = async (e, firstRenderFlag = false) => {
    let crypto;
    if (firstRenderFlag) {
      crypto = sessionStorage.getItem('selectedCurrency') || 'USDT';
    } else {
      crypto = e.target.value;
    }
    if (crypto !== "META1") {
      if (userCurrencyState.split(' ')[1] === "META1") {
        let data = await getAllByOne('USDT', crypto);
        sessionStorage.setItem('currencyResult', JSON.stringify(data))
        setCurrentCurrency(currentCurrency + 1);
      } else {
        let data = await getAllByOne('USDT', crypto);
        sessionStorage.setItem('currencyResult', JSON.stringify(data))
      }
    } else {
      setCurrentCurrency(currentCurrency + 1);
      crypto = "META1";
    }
    sessionStorage.setItem('selectedCurrency', crypto);
    setIsCurrencySelected(crypto);
  };

  const filteredPortfolio = hideZero ? portfolio.filter((p) => p.qty > 0) : portfolio;

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
            alignItems: "center",
            marginTop: '-23px'
          }}
        >
          <div
            className={"blockSumAndPercentage"}
            style={{ display: "flex", flexDirection: "row", alignItems: 'center' }}
          >
            <h2 style={{ color: "#FFC000", fontSize: "2rem", margin: "0" }}>
              <strong className={`adaptAmountMain ${!isMobile ? 'balanceFontSize' : 'balanceFontSizeMobile'}`} style={!isMobile ? { fontSize: '25px' } : { fontSize: '16px !important' }}>
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
                height: "28%",
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
            <div className="select_currency">
              <div className={"blockChoose"}>
                {isCurrencySelectedEmpty && <div
                  onClick={() => {
                    setIsCurrencySelectedEmpty(false);
                    setSelectBoxOpen(true);
                  }}
                  className='selectbox_div'
                >
                  Select currency to display <i className="fas fa-caret-down"></i>
                </div>}
                {!isCurrencySelectedEmpty && <FormControl className="mw-400 width-selectBox" sx={{ m: 1, minWidth: "270" }}>
                  <InputLabel
                    onClick={() => {
                      if (isCurrencySelected !== '') {
                        setSelectBoxOpen(true);
                      }
                    }}
                    className={`select-label ${isCurrencySelected !== '' ? 'select-label-selected' : ''}`} id="demo-simple-select-autowidth-label"
                  >
                    Select currency to display
                  </InputLabel>
                  <Select
                    open={selectBoxOpen}
                    labelId="demo-simple-select-autowidth-label"
                    id="demo-simple-select-autowidth"
                    value={isCurrencySelected}
                    onOpen={() => {
                      setSelectBoxOpen(true);
                    }}
                    onChange={(e) => changeCryptoCurrency(e, false)}
                    autoWidth
                    label="Select currency to display"
                    MenuProps={{ classes: { paper: 'options-height-wallet' } }}
                    onClose={() => {
                      setSelectBoxOpen(false);
                    }}
                  >
                    <MenuItem>
                      <img
                        src={fiatIcon}
                        alt="cryptoImage"
                        className="imgContainer"
                      />
                      <span className="spanDrop newSpanDropClass">
                        Fiat ({userCurrencyState.split(" ")[0]})
                      </span>
                    </MenuItem>
                    {assets.map((el, index) => (
                      <MenuItem
                        className={"choosenContainerItem"}
                        key={index}
                        value={el.symbol}
                      >
                        <img
                          src={el.image}
                          style={{ width: "35px" }}
                          alt="cryptoImage"
                          className="imgContainer"
                        />
                        <span className="spanDrop newSpanDropClass">{el.symbol}</span>
                      </MenuItem>
                    ))}

                  </Select>
                </FormControl>}
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
              <span className='hide-zero-span'>Hide Zero Balances</span>
              <Switch
                className={"switch"}
                checked={hideZero}
                onClick={() => {
                  console.log('@@@@@, clicked', hideZero)
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
        {(portfolio == null || portfolio.length === 0) ?
          <MetaLoader size={"small"} />
          :
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
        }
      </div>
    </>
  );
}

export default Wallet;
