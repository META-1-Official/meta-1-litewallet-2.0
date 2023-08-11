import eth from '../images/assets/eth.png'
import bnb from '../images/assets/bnb.png'
import ltc from '../images/assets/ltc.png'
import eos from '../images/assets/eos.png'
import metaone from '../images/assets/meta.png'
import usdt from '../images/assets/usdt.png'
import xlm from '../images/assets/xlm.png'
import doge from '../images/assets/doge.png'
import sol from '../images/assets/sol.png'
import xrp from '../images/assets/xrp.png'
import ada from '../images/assets/ada.png'
import xmr from '../images/assets/xmr.png'
import busd from '../images/assets/busd.png'
import btc from '../images/assets/btc.png'

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
    XRP: xrp,
    XMR: xmr,
    ADA: ada,
    BUSD: busd
};

const getImage = (symbol) => {
    return assetImages[symbol];
};

export {getImage};