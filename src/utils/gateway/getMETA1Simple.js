import account_constants from '../chain/account_constants'
import {Apis} from 'meta1-vision-ws';

export const getMETA1Simple = async () => {
    const assetsList = await Apis.db.get_assets(process.env.REACT_APP_CRYPTOS_ARRAY.split(','));
    const gateFee = {
        BTC: '0.0005',
        LTC: '0.0001',
        ETH: '0.01',
        USDT: '35',
        XLM: '0.01',
        BNB: '0.01',
        EOS: '0.0001',
        XRP: '0.01',
        DOGE: '10',
        SOL: '0.1'
    }

    let data = [];
    assetsList.map(item => {
        if (item.symbol === "META1") return;
        data.push ({
            name: item.symbol,
            backingCoin: item.symbol,
            symbol: item.symbol,
            precision: item.precision,
            issuer: account_constants.issuer_name,
            issuerId: account_constants.issuer_name,
            issuerToId: account_constants.issuer_id,
            assetId: item.id,
            gateFee: gateFee[item.symbol],
        });
    });   
    
    return data;
}
