import eth from '../images/assets/ETH.svg'
import bnb from '../images/assets/BNB.svg'
import ltc from '../images/assets/LTC.svg'
import eos from '../images/assets/EOS.svg'
import metaone from '../images/assets/META1.svg'
import usdt from '../images/assets/USDT.svg'
import xlm from '../images/assets/XLM.svg'
const btc = 'https://cdn.byte-trade.com/token/icon6/btc.png'
const assetImages = {
    ETH: eth,
    EOS: eos,
    BTC: btc,
    XLM: xlm,
    META1: metaone,
    BNB: bnb,
    LTC: ltc,
    USDT: usdt
}

export default class Portfolio {
    constructor(props) {
        this.metaApi = props.metaApi
        this.accountName = props.accountName
        this.setFetchAssetModalOpen = props.setFetchAssetModalOpen
        this.fetchAssetLastValueOk = null
        this.fetchAssetLastValueError = null
    }

    async fetch(accountName) {
        const accName = accountName || this.accountName
        const fetchedAssets = await this._fetchAssets()
        if (!fetchedAssets) {
            if (this.fetchAssetLastValueError ===  null) {
                this.fetchAssetLastValueError = false;
                this.fetchAssetLastValueOk = false;
                this.setFetchAssetModalOpen(true);
            }
            return null;
        } else {
            if (this.fetchAssetLastValueOk === false) {
                this.fetchAssetLastValueOk = true;
                this.setFetchAssetModalOpen(true);
            }
        }
        const fetchedAccounts = await this.metaApi.db.get_full_accounts(
            [accName],
            false
        )
        let fetchedBalances = [];
        if (Array.isArray(fetchedAccounts)) {
            if (Array.isArray(fetchedAccounts[0]) && fetchedAccounts[0].length > 1) {
                fetchedBalances = fetchedAccounts[0][1]?.balances;
            }
        }
        fetchedAssets.map((a) => (a.image = assetImages[a.symbol]))
        fetchedBalances.forEach((balance) => {
            balance.asset = fetchedAssets.find(
                (a) => a.id === balance.asset_type
            )
            balance.amount = balance.balance
        })

        const fetchedPortfolio = fetchedBalances.map((el) => {
            const qty = el.amount / 10 ** el.asset.precision
            return {
                image: el.asset.image,
                name: el.asset.symbol,
                qty: `${qty}`,
                present: el.amount !== 0
            }
        })

        const fullPortfolioNew = fetchedAssets.map((asset) => {
            return {
                image: asset.image,
                name: asset.symbol,
                qty: this._getBalance(asset.symbol, fetchedPortfolio)
            }
        })

        return {
            assets: fetchedAssets,
            portfolio: fetchedPortfolio.filter((a) => a.present),
            full: fullPortfolioNew
        }
    }

    async _fetchAssets() {
        try {
            return await this.metaApi.db.list_assets('', 101);
        } catch (err) {
            return null;
        }
    }

    _getBalance(symbol, fetchedPortfolio) {
        const assetInWallet = fetchedPortfolio.find((el) => el.name === symbol)
        if (assetInWallet) {
            return assetInWallet.qty
        } else {
            return 0
        }
    }

    _fetchAssetLastValue(getErrorValue = false) {
        return getErrorValue ? this.fetchAssetLastValueError : this.fetchAssetLastValueOk;
    }
}
