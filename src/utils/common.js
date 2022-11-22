import Meta1 from "meta1-vision-dex";
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

export const assetsObj = [
    {
        "id": "1.3.0",
        "symbol": "META1",
        "precision": 9,
        "issuer": "1.2.3",
        "dynamic_asset_data_id": "2.3.0"
    },
    {
        "id": "1.3.1",
        "symbol": "USDT",
        "precision": 6,
        "issuer": "1.2.30",
        "dynamic_asset_data_id": "2.3.1",
        "total_in_collateral": 0
    },
    {
        "id": "1.3.2",
        "symbol": "ETH",
        "precision": 10,
        "issuer": "1.2.30",
        "dynamic_asset_data_id": "2.3.2"
    },
    {
        "id": "1.3.3",
        "symbol": "XLM",
        "precision": 7,
        "issuer": "1.2.30",
        "dynamic_asset_data_id": "2.3.3"
    },
    {
        "id": "1.3.4",
        "symbol": "EOS",
        "precision": 4,
        "issuer": "1.2.30",
        "dynamic_asset_data_id": "2.3.4"
    },
    {
        "id": "1.3.5",
        "symbol": "BTC",
        "precision": 8,
        "issuer": "1.2.30",
        "dynamic_asset_data_id": "2.3.5"
    },
    {
        "id": "1.3.6",
        "symbol": "LTC",
        "precision": 8,
        "issuer": "1.2.30",
        "dynamic_asset_data_id": "2.3.6",
    },
    {
        "id": "1.3.7",
        "symbol": "BNB",
        "precision": 8,
        "issuer": "1.2.30",
        "dynamic_asset_data_id": "2.3.7",
    }
]
