export default class TradeWithPassword {
  constructor(props) {
    this.metaApi = props.metaApi;
    this.login = props.login;
  }

  async perform(props) {
    const { password, from, to, amount } = props;

    try {
      const pair = await this.metaApi.ticker(from, to);
      let pairAmt;
      if (from === "META1") {
        pairAmt = pair.latest;
      } else {
        pairAmt = pair.lowest_ask;
      }
      const account = await this.metaApi.login(this.login, password);
      const buyResult = await account.buy(
        to,
        from,
        parseFloat(amount),
        pairAmt,
        false,
        new Date("12/12/2031")
      );

      return { result: buyResult, error: null };
    } catch (e) {
      if (e.message === "The pair of login and password do not match!") {
        return { error: "Invalid credentials" };
      } else if (e.message === 'Amount equal 0!') {
        return { error: 'Amount almost 0!' };
      } else {
        return { error: "Something went wrong" };
      }
    }
  }
}
