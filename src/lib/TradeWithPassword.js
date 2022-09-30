import { MIN_TRADE_LOWER, MIN_TRADE_UPPER, PERCENT_OK, PERCENT_MAX, PERCENT_MIN, UPPER_TRADE_MIN } from "../utils/constant";

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
      
      if (from === 'META1' && to === 'USDT' && blockPrice > amount && blockPrice >= MIN_TRADE_LOWER && blockPrice < UPPER_TRADE_MIN) {
        amount = amount + (blockPrice - amount);
      }

      let percent = ((pairAmt*amount)/selectedFromAmount)*100;
      
      if (Number(blockPrice) >= MIN_TRADE_LOWER && Number(blockPrice) <= UPPER_TRADE_MIN && percent > PERCENT_MIN && percent < PERCENT_OK) {
        percent = ((pairAmt*amount)/selectedFromAmount)*100;
        if (percent > PERCENT_MIN && percent < PERCENT_OK) {
          amount = (selectedFromAmount - (amount*pairAmt)) + amount;
        }
      } else if (percent === PERCENT_OK && Number(blockPrice) >= MIN_TRADE_LOWER &&  Number(blockPrice) <= MIN_TRADE_UPPER) {
        amount = amount * (PERCENT_MAX/PERCENT_OK);
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
