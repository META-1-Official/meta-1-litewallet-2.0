import { ChainStore } from 'meta1-vision-js';
import UseAsset from '../helpers/useAssets';
import Meta1 from "meta1-vision-dex";

const formatDate = (date, flag = false) => {
    const newDate = new Date(date).toString().split(' ');
    if (flag) {
        return `${newDate[1]} ${newDate[2]}, ${Number(newDate[3])-1} ${newDate[4].slice(0,5)}`
    } else {
        return `${newDate[1]} ${newDate[2]}, ${newDate[3]} ${newDate[4].slice(0,5)}`
    }
}

async function getOpenOrder(event) {
    const chainStoreObj = event?.queryKey[1] || null;

    if (chainStoreObj) {
        const openOrderIds = chainStoreObj.get('orders');

        const dataSource = openOrderIds.map(async (orderID) => {
            const obj = {};
            let order = null;

            order = ChainStore.getObject(orderID).toJS();

            const baseResult = await UseAsset(order.sell_price.base.asset_id);
            const quoteResult = await UseAsset(order.sell_price.quote.asset_id);

            let quoteAmount = order?.sell_price?.quote?.amount / Math.pow(10, quoteResult?.data?.precision);
            let baseAmount = order?.sell_price?.base?.amount / Math.pow(10, baseResult?.data?.precision);
            
            const newPair = await Meta1.ticker(
                baseResult?.data?.symbol,
                quoteResult?.data?.symbol
                );
                
            obj.fromTo = `${quoteAmount} ${quoteResult?.data?.symbol}/${baseAmount} ${baseResult?.data?.symbol}`;
            obj.price = `${(Number(quoteAmount) / Number(baseAmount)).toFixed(5)} `;
            obj.priceSymbol = `${quoteResult?.data?.symbol}/${baseResult?.data?.symbol}`;
            obj.creationDate = formatDate(order.expiration, true);
            obj.expiration = formatDate(order.expiration);
            obj.marketPrice = (1 / Number(newPair.latest)).toFixed(6);
            obj.order = order;
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
