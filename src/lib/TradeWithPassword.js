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
      let pairAmt;
      if (from === "META1") {
        pairAmt = pair.latest;
      } else if (from === "USDT") {
        pairAmt = pair.latest;
      } else {
        pairAmt = pair.lowest_ask;
      }
      const newPairAmt = tradePrice ? tradePrice : pairAmt;
      const account = await this.metaApi.login(this.login, password);
      if (!account) {
        return { error: "Something went wrong" };
      }

      const buyResult = await account.buy(
        to,
        from,
        parseFloat(amount),
        newPairAmt,
        false,
        new Date(new Date().setYear(new Date().getFullYear()+1))
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
