import Meta1 from "meta1-vision-dex";
export const sleepHandler = (ms) =>  {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const isUserExistHandler = async (login, password, checkCount, status) => {
    try {
        console.log("accountName password5.4 isUserExistHandler",login, password, checkCount, status);
        await Meta1.connect(process.env.REACT_APP_MAIA);
        console.log("accountName password5.5 isUserExistHandler",login, password);
        await Meta1.login(login, password);
        console.log("accountName password5.6 isUserExistHandler");
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
        console.log("accountName password5.7 isUserExistHandler");
        const response = await isUserExistHandler(login, password, checkCount);
        console.log("accountName password5.8 isUserExistHandler",response);
        if (response.status) {
            return { status: true };
        } else {
            return { status: false };
        }
    }
}
export const signUpHandler = async (login, password) => {
    console.log("accountName password5.1",login, password);
    let checkCount = 0;
    let status = false;
    console.log("accountName password5.2");
    await sleepHandler(3000);
    console.log("accountName password5.3");
    const result = await isUserExistHandler(login, password, checkCount, status);
    console.log("accountName password5.4 result",result);
    if (result && result.status) {
        console.log("accountName password5.5 result",result);
        return { status: true };
    }
    console.log("accountName password5.6 result",result);
    return { status: false };
}

export const assetsObj = [
    {
        "id": "1.3.0",
        "symbol": "META1",
        "precision": 5,
        "issuer": "1.2.3",
        "dynamic_asset_data_id": "2.3.0"
    },
    {
        "id": "1.3.1",
        "symbol": "USDT",
        "precision": 2,
        "issuer": "1.2.29",
        "dynamic_asset_data_id": "2.3.1",
        "total_in_collateral": 0
    },
    {
        "id": "1.3.2",
        "symbol": "BTC",
        "precision": 8,
        "issuer": "1.2.29",
        "dynamic_asset_data_id": "2.3.2"
    },
    {
        "id": "1.3.3",
        "symbol": "ETH",
        "precision": 8,
        "issuer": "1.2.29",
        "dynamic_asset_data_id": "2.3.3"
    },
    {
        "id": "1.3.5",
        "symbol": "EOS",
        "precision": 4,
        "issuer": "1.2.29",
        "dynamic_asset_data_id": "2.3.5"
    },
    {
        "id": "1.3.6",
        "symbol": "XLM",
        "precision": 6,
        "issuer": "1.2.29",
        "dynamic_asset_data_id": "2.3.6"
    },
    {
        "id": "1.3.7",
        "symbol": "BNB",
        "precision": 8,
        "issuer": "1.2.29",
        "dynamic_asset_data_id": "2.3.7",
    }
]
