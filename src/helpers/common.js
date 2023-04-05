export const getMarketName = (base, quote) => {
    if (!base || !quote) return {marketName: '_'};
    const baseID = parseInt(base.id.split('.')[2], 10);
    const quoteID = parseInt(quote.id.split('.')[2], 10);

    const first = quoteID > baseID ? quote : base;
    const second = quoteID > baseID ? base : quote;

    const marketName = `${first.symbol}_${second.symbol}`;
    return {baseID, quoteID, marketName, first, second};
};

export const formatNumber = (x) => {
  try {
    var parts = x.toString().split('.');

    if (x < 1) {
      // parts[1] = parts[1];
    } else if (x > 1 && x < 100) {
      parts[1] = parts[1].substr(0, 2);
    } else if (x > 100 && x < 1000) {
      parts[1] = parts[1].substr(0, 1);
    } else if (x > 1000) {
      parts[1] = '';
    }

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (x > 1000) {
      return parts[0];
    } else {
      return parts.join('.');
    }
  } catch (err) {
    return x;
  }
};
