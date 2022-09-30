export default class TradeWithPassword {
  constructor(props) {
    this.metaApi = props.metaApi;
    this.login = props.login;
  }

  async perform(props) {
    let { password, from, to, amount, selectedFromAmount, blockPrice, currentCurrency } = props;

    try {
      const pair = await this.metaApi.ticker(from, to);
      const pairFrom = await this.metaApi.ticker(to, from);
      
      let pairAmt;
      let pairAmtFrom;
      if (from === "META1") {
        pairAmt = pair.latest;
        pairAmtFrom = pairFrom.latest;
      } else if (from === "USDT") {
        pairAmt = pair.latest;
        pairAmtFrom = pairFrom.latest;
      } else {
        pairAmt = pair.lowest_ask;
        pairAmtFrom = pairFrom.lowest_ask;
      }
      
      blockPrice = Number(blockPrice)/Number(currentCurrency);
      
      amount = pairAmtFrom*selectedFromAmount;
      
      if (from === 'META1' && to === 'USDT' && blockPrice > amount && blockPrice >= 0.01 && blockPrice < 0.3) {
        amount = amount + (blockPrice - amount);
      }

      let percent = ((pairAmt*amount)/selectedFromAmount)*100;
      
      if (Number(blockPrice) >= 0.01 && Number(blockPrice) <= 0.3 && percent>99.98 && percent<100) {
        percent = ((pairAmt*amount)/selectedFromAmount)*100;
        if (percent>99.98 && percent<100) {
          amount = (selectedFromAmount - (amount*pairAmt)) + amount;
        }
      }else if (percent === 100 && Number(blockPrice) >= 0.01 &&  Number(blockPrice) <= 0.07) {
        amount = amount * (100.00002/100);
      }

      const account = await this.metaApi.login(this.login, password);
      const buyResult = await account.buy(
        to,
        from,
        parseFloat(amount),
        pairAmt,
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
