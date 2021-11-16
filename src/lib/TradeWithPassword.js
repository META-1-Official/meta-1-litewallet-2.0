export default class TradeWithPassword {
    constructor(props) {
        this.metaApi = props.metaApi
        this.login = props.login
    }

    async perform(props) {
        const { password, from, to, amount } = props

        try {
            const pair = await this.metaApi.ticker(from, to)
            const account = await this.metaApi.login(this.login, password)
            console.log(account)
            const buyResult = await account.buy(
                to,
                from,
                parseFloat(amount),
                pair.lowest_ask,
                false,
                new Date('12/12/2021')
            )

            return { result: buyResult, error: null }
        } catch (e) {
            if (e.message === 'The pair of login and password do not match!') {
                return { error: 'Invalid credentials' }
            } else {
                console.log('Error occured', e)
                return { error: 'Something went wrong' }
            }
        }
    }
}
