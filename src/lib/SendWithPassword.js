export default class SendWithPassword {
    constructor(props) {
        this.metaApi = props.metaApi
        this.login = props.login
    }

    async perform(props) {
        const { password, to, amount, asset, message } = props
        console.log('to', to)
        console.log('amount', amount)

        try {
            const account = await this.metaApi.login(this.login, password)
            const result = await account.transfer(
                to,
                asset,
                parseFloat(amount),
                message
            )

            console.log('result')
            return { result: result, error: null }
        } catch (e) {
            if (e.message === 'The pair of login and password do not match!') {
                return { error: 'Invalid credentials' }
            } else {
                console.log('Error occured', e)
                return { error: 'Something went wrong ' + e.message }
            }
        }
    }
}
