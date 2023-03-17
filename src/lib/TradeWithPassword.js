export default class TradeWithPassword {
  constructor(props) {
    this.metaApi = props.metaApi;
    this.login = props.login;
  }

  async perform(props) {
    const { password, from, to, amount, tradePrice } = props;

    try {
      const pair = await this.metaApi.ticker(from, to);
      if (!pair) {
        return { error: "Something went wrong" };
      }

      let pairAmt = pair.lowest_ask;
      if (from === "META1") {
        pairAmt = pair.latest;
      } else if (from === "USDT") {
        pairAmt = pair.latest;
      }

      const newPairAmt = tradePrice ? tradePrice : pairAmt;
      const account = await this.metaApi.login(this.login, password);
      if (!account) return { error: "The pair of login and password do not match!" };
      const oneMinLater = new Date(new Date().setMinutes(new Date().getMinutes() + 1));

      const buyResult = await account.buy(
        to,
        from,
        parseFloat(amount),
        newPairAmt,
        false,
        oneMinLater
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
