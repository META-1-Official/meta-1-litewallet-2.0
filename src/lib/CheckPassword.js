export default class CheckPassword {
    constructor(props) {
        this.metaApi = props.metaApi;
        this.login = props.login;
    }
    async checkPasword(password) {
        try {
            const account = await this.metaApi.login(this.login, password);
            return { result: account, error: null };
        } catch (e) {
            if (e.message === "The pair of login and password do not match!") {
                return { error: "Invalid credentials" };
            } else if (e.message && (e.message.toLowerCase().includes('non-base') || e.message.toLowerCase().includes('expected version'))) {
                return { error: "Invalid credentials" };
            } else {
                return { error: "Something went wrong" };
            }
        }
    }
}
