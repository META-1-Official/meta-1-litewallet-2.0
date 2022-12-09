export async function daysChange(token) {
    if (token === 'USDT' || token === 'META1') {
        return 0
    } else {
        try {
            const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${token}USDT`, {
                method: 'GET'
            })
            return (await response).json()
        } catch (err) {
            return null;
        }
    }
}