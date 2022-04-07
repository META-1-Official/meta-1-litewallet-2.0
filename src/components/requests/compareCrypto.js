import axios from 'axios'

export const compareCrypto = async (coin) => {
    const { data } = await axios.get(
        `https://min-api.cryptocompare.com/data/price?fsym=${coin}&tsyms=USDT`
    )
    return data;
}

export default async function getAllByOne(tokenNow, tokenFor) {
    const {data} = await axios.get(
        `https://min-api.cryptocompare.com/data/price?fsym=${tokenNow}&tsyms=${tokenFor}`
    )
    return data;
}
