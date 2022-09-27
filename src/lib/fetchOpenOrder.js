import { ChainStore } from 'meta1-vision-js';
import UseAsset from '../helpers/useAssets';
import Meta1 from "meta1-vision-dex";
import moment from 'moment';
import { LimitOrder } from '../utils/MarketClasses';
import { getCryptosChange } from '../API/API';

function makeISODateString(date_str) {
    if (typeof date_str === 'string' && !/Z$/.test(date_str)) {
        date_str += 'Z';
    }
    return date_str;
}

const getChainStore = (accountNameState) => {
    return new Promise( async (resolve,fail)=>{
        await ChainStore.clearCache()
        
        let newObj = ChainStore.getAccount(
            accountNameState,
            undefined
        );
        await getCryptosChange();
        newObj = ChainStore.getAccount(
            accountNameState,
            undefined
        );
        console.log("newObj",newObj)
        if (newObj) {
            resolve(newObj);
        }
        if (!newObj) {
            fail("fail");
        }
    })
}

async function getOpenOrder(event) {
    const accountNameState = event?.queryKey[1] || null;
    const isInventState = event?.queryKey[2] || null;
    const chainStoreObj =  await getChainStore(accountNameState);
    if (chainStoreObj) {
        const openOrderIds = chainStoreObj.get('orders');

        const dataSource = openOrderIds.map(async (orderID) => {
            const obj = {};
            let order = null;

            order = ChainStore.getObject(orderID).toJS();
            const baseResult = await UseAsset(order.sell_price.base.asset_id);
            const quoteResult = await UseAsset(order.sell_price.quote.asset_id);

            const marketName = quoteResult?.data?.symbol.includes('META') ? `${baseResult?.data?.symbol}_${quoteResult?.data?.symbol}` : `${quoteResult?.data?.symbol}_${baseResult?.data?.symbol}`;
            let isInverted = isInventState?.symbol.includes(marketName);

            let quoteAmount = order?.sell_price?.quote?.amount / Math.pow(10, quoteResult?.data?.precision);
            let quoteAmount1 =  Number(((order?.for_sale / order?.sell_price?.base?.amount) * order?.sell_price?.quote?.amount / Math.pow(10, quoteResult?.data?.precision)).toFixed(8));
            let baseAmount = order?.for_sale / Math.pow(10, baseResult?.data?.precision);
            let baseAmount1 = order?.sell_price?.base?.amount / Math.pow(10, baseResult?.data?.precision);
            
            const newPair = await Meta1.ticker(
                !isInverted ? baseResult?.data?.symbol : quoteResult?.data?.symbol,
                !isInverted ? quoteResult?.data?.symbol : baseResult?.data?.symbol
            );
            
            let assets = {
                [order.sell_price.base.asset_id]: {precision: baseResult?.data?.precision},
                [order.sell_price.quote.asset_id]: {precision: quoteResult?.data?.precision},
            };
            let marketBaseId = !isInverted ? order.sell_price.base.asset_id : order.sell_price.quote.asset_id;
            let orderLimit = new LimitOrder(order, assets, marketBaseId)
            
            obj.fromTo = !isInverted  
                            ? `${quoteAmount1} ${quoteResult?.data?.symbol} / ${baseAmount} ${baseResult?.data?.symbol}`
                            : `${baseAmount} ${baseResult?.data?.symbol} / ${quoteAmount1} ${quoteResult?.data?.symbol}`;
            obj.price = !isInverted ? `${(Number(quoteAmount) / Number(baseAmount1)).toFixed(5)} ` : `${(Number(baseAmount) / Number(quoteAmount1)).toFixed(5)} `;
            obj.priceSymbol = !isInverted ? `${quoteResult?.data?.symbol}/${baseResult?.data?.symbol}` : `${baseResult?.data?.symbol}/${quoteResult?.data?.symbol}`;
            obj.creationDate = moment(makeISODateString(order.expiration)).add(-1, 'years').format('MMM DD, YYYY hh:mm');
            obj.expiration = moment(makeISODateString(order.expiration)).format('MMM DD, YYYY hh:mm');
            obj.marketPrice = (1 / Number(newPair.latest)).toFixed(5);
            obj.order = orderLimit;
            obj.marketName = marketName;
            obj.isInverted = isInverted;
            return obj;
        });
        const res = await Promise.all(dataSource).then((values) => {
            return values;
        });
        return res;
    } else {
        return [];
    }
}

export default getOpenOrder;
