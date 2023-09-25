import Meta1 from "meta1-vision-dex";
import {Apis} from 'meta1-vision-ws';
import moment from 'moment';

export const sleepHandler = (ms) =>  {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const isUserExistHandler = async (login, password, checkCount, status) => {
    try {
        await Meta1.connect(process.env.REACT_APP_MAIA);
        await Meta1.login(login, password);
        if (!status) {
            status = true;
        }
        return { status };
    } catch(err) {
        if (checkCount === 10 ){
            status = false;
            return { status };
        }
        await sleepHandler(300);
        checkCount = checkCount + 1;
        const response = await isUserExistHandler(login, password, checkCount);
        if (response.status) {
            return { status: true };
        } else {
            return { status: false };
        }
    }
}

export const getAssetsList = async () => {
    return await Apis.db.get_assets(process.env.REACT_APP_CRYPTOS_ARRAY.split(','));
}

export const signUpHandler = async (login, password) => {
    let checkCount = 0;
    let status = false;
    await sleepHandler(3000);
    const result = await isUserExistHandler(login, password, checkCount, status);
    if (result && result.status) {
        return { status: true };
    }
    return { status: false };
}

export const filterNotifications = (n) => {
    let readNotifications = JSON.parse(localStorage.getItem('readNotifications')) ?? [];
    let notiConfig = JSON.parse(localStorage.getItem("noti_conf"));

    let notifications = [...n];

    let coinMove = notiConfig.coinMovements.reduce((prev, curr) => ({ ...prev, [Object.keys(curr)[0]]: curr[Object.keys(curr)[0]] }), {});
    let specificNote = notiConfig.specNotification.reduce((prev, curr) => ({ ...prev, [Object.keys(curr)[0]]: curr[Object.keys(curr)[0]] }), {});

    notifications = notifications.filter((ele) => {
        var flag = false;
        if (readNotifications.includes(ele.id)) return false;

        var category = '';
        if (ele.category === 'Created Order') {
            category = 'tradeExcuted';
        } else if (ele.category === 'Cancelled Order') {
            category = 'tradeCanceled';
        } else if (ele.category === 'Deposit') {
            category = 'deposits';
        } else if (ele.category === 'Announcements') {
            category = 'announcements';
        } else if (ele.category === 'Events') {
            category = 'events';
        } else {
            if (ele.content.includes('sent')) {
                category = 'send';
            } else if (ele.content.includes('received')) {
                category = 'receive';
            }
        }

        if (ele.category === 'Price Change') {
            var str_array = ele.content.split(' ');
            var symbol = str_array[0].toLowerCase();
            var tendency = str_array[2].toLowerCase();
            var change = Math.abs(str_array[3].substring(0, str_array[3].length - 1));

            const obj_value = coinMove[symbol];

            if (!obj_value) return true;
            if (obj_value.toggle === false) { // filter enabled                        
                flag = true;
            } else {
                if (obj_value.tendency !== tendency && obj_value.comparator[1] !== 0) { // in case same tedency up-up down-down
                    flag = true;
                } else {
                    if (obj_value.comparator[0] === 'percentage') {  // comparator percentage
                        if (change < obj_value.comparator[1]) flag = true;
                    } else { // comparator price
                        Apis.db.get_ticker('USDT', symbol.toUpperCase()).then(ticker => {
                            if (ticker.latest * change / 100 < obj_value.comparator[1]) flag = true;
                        });
                    }
                }
            }
        } else {
            const obj_value = specificNote[category];
            if (obj_value === null) return true;
            if (obj_value === false) {
                flag = true;
            }
        }

        return !flag;
    });

    notifications = notifications.map((ele) => {        
        ele.time = moment(ele.createdAt).fromNow();
        return ele;
    })

    return notifications;
}