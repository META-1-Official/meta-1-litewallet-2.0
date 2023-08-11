import BnbLogo from "../../images/assets/bnb.png";
import BtcLogo from "../../images/assets/btc.png";
import EosLogo from "../../images/assets/eos.png";
import EthLogo from "../../images/assets/eth.png";
import LtcLogo from "../../images/assets/ltc.png";
import MetaLogo from "../../images/assets/meta.png";
import UsdtLogo from "../../images/assets/usdt.png";
import XlmLogo from "../../images/assets/xlm.png";

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
