import { ReactComponent as BnbLogo } from "../../images/assets/BNB.svg";
import { ReactComponent as BtcLogo } from "../../images/assets/BTC.svg";
import { ReactComponent as EosLogo } from "../../images/assets/EOS.svg";
import { ReactComponent as EthLogo } from "../../images/assets/ETH.svg";
import { ReactComponent as LtcLogo } from "../../images/assets/LTC.svg";
import { ReactComponent as MetaLogo } from "../../images/assets/META1.svg";
import { ReactComponent as UsdtLogo } from "../../images/assets/USDT.svg";
import { ReactComponent as XlmLogo } from "../../images/assets/XLM.svg";

export function getAsset(symbol) {
  switch (symbol) {
    case "BNB":
      return (
        <BnbLogo
          style={{ width: "35px", height: "35px", marginLeft: ".5rem" }}
        />
      );
    case "BTC":
      return (
        <BtcLogo
          style={{ width: "35px", height: "35px", marginLeft: ".5rem" }}
        />
      );
    case "EOS":
      return (
        <EosLogo
          style={{ width: "35px", height: "35px", marginLeft: ".5rem" }}
        />
      );
    case "ETH":
      return (
        <EthLogo
          style={{ width: "35px", height: "35px", marginLeft: ".5rem" }}
        />
      );
    case "LTC":
      return (
        <LtcLogo
          style={{ width: "35px", height: "35px", marginLeft: ".5rem" }}
        />
      );
    case "META1":
      return (
        <MetaLogo
          style={{ width: "35px", height: "35px", marginLeft: ".5rem" }}
        />
      );
    case "USDT":
      return (
        <UsdtLogo
          style={{ width: "35px", height: "35px", marginLeft: ".5rem" }}
        />
      );
    case "XLM":
      return (
        <XlmLogo
          style={{ width: "35px", height: "35px", marginLeft: ".5rem" }}
        />
      );
    default:
      return;
  }
}

export function getFullName(symbol) {
  switch (symbol) {
    case "BNB":
      return "Binance Coin";
    case "BTC":
      return "Bitcoin";
    case "EOS":
      return "EOS";
    case "ETH":
      return "Ethereum";
    case "LTC":
      return "Litecoin";
    case "META1":
      return "META1";
    case "USDT":
      return "Tether";
    case "XLM":
      return "Solaris";
    default:
      return;
  }
}
