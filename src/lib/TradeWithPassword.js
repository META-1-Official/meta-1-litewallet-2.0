export default class TradeWithPassword {
  constructor(props) {
    this.metaApi = props.metaApi;
    this.login = props.login;
  }

  async perform(props) {
    const { password, from, to, amount } = props;

    try {
      const pair = await this.metaApi.ticker(from, to);
      const account = await this.metaApi.login(this.login, password);
      const buyResult = await account.buy(
        to,
        from,
        parseFloat(amount),
        pair.lowest_ask,
        false,
        new Date("12/12/2031")
      );

      return { result: buyResult, error: null };
    } catch (e) {
      if (e.message === "The pair of login and password do not match!") {
        return { error: "Invalid credentials" };
      } else if (e.message === 'Amount equal 0!') {
        return { error: 'Amount almost 0!' };
      } else if (typeof e.message === 'string' && e.message.includes("Assert Exception: LHS >= RHS")) {
        return { error: 'Assert Exception: LHS >= RHS' };
      } else {
        return { error: "Something went wrong" };
      }
    }
  }
}
