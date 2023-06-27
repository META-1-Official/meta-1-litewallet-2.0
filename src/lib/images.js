import eth from '../images/assets/ETH.svg';
import bnb from '../images/assets/BNB.svg';
import ltc from '../images/assets/LTC.svg';
import eos from '../images/assets/EOS.svg';
import metaone from '../images/assets/META1.svg';
import usdt from '../images/assets/USDT.svg';
import xlm from '../images/assets/XLM.svg';
import doge from '../images/assets/DOGE.svg';
import sol from '../images/assets/SOL.png';
import trx from '../images/assets/TRX.svg';
import xrp from '../images/assets/XRP.png';
import ada from '../images/assets/ADA.png';
import xmr from '../images/assets/XMR.png';
import busd from '../images/assets/BUSD.png';

const btc = 'https://cdn.byte-trade.com/token/icon6/btc.png';

const assetImages = {
    ETH: eth,
    EOS: eos,
    BTC: btc,
    XLM: xlm,
    META1: metaone,
    BNB: bnb,
    LTC: ltc,
    USDT: usdt,
    DOGE: doge,
    SOL: sol,
    TRX: trx,
    XRP: xrp,
    XMR: xmr,
    ADA: ada,
    BUSD: busd
};

const getImage = (symbol) => {
    return assetImages[symbol];
};

export {getImage};