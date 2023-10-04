import BigNumber from "bignumber.js";

export const formatAddress = (address) => {
  let newAddress =
    address.substr(0, 6) + "..." + address.substr(address.length - 5);
  return newAddress;
};

export const findToken = (serverObj, tokenAddress) => {
  let reqObj = serverObj.find((item) => {
    // console.log(item.coinAddress,tokenAddress)
    if (item.coinAddress === tokenAddress) {
      return item;
    } else {
      return null;
    }
  });
  return reqObj;
};

export const formatValue = (number, digits) => {
  return Math.trunc(number * Math.pow(10, digits)) / Math.pow(10, digits);
};

export const sendCoinQuanity = (
  price,
  coinQuantity,
  totalBal,
  newCoinPerc,
  oldCoinPerc,
  coinSymbol,
  coinDecimal
) => {
  // totalBal = getTotalBalance()
  console.log(
    "CoinSymbol",
    price,
    coinQuantity,
    totalBal,
    newCoinPerc,
    oldCoinPerc,
    coinSymbol,
    coinDecimal
  );

  if (newCoinPerc < oldCoinPerc && newCoinPerc !== 0) {
    console.log("percCheck", newCoinPerc, oldCoinPerc);
    let changedPerc = oldCoinPerc - newCoinPerc;
    // let feeQuantity =  (((((1)* (coinQuantity*price))/(100*price)).toFixed(4))*(10**coinDecimal))
    console.log("changedPerc", changedPerc, process.env.REACT_APP_TxFee);

    // let requiredCoinQuantity=formatValue((changedPerc* totalBal)/(100*price),4)
    // console.log("requiredCoinQuantity",requiredCoinQuantity)
    let totalAmount = new BigNumber(changedPerc)
      .multipliedBy(new BigNumber(totalBal))
      .dividedBy(new BigNumber(100).multipliedBy(new BigNumber(price)))
      .toNumber();
    // console.log("tempRequiredCoinQuantity",tempRequiredCoinQuantity)
    // let usedPrice=requiredCoinQuantity*price
    // let _feeQuantity = formatValue((requiredCoinQuantity* +process.env.REACT_APP_TxFee),4)
    let _feeQuantity = new BigNumber(totalAmount)
      .multipliedBy(new BigNumber(+process.env.REACT_APP_TxFee))
      .toNumber();
    // let totalAmount = formatValue(+(+requiredCoinQuantity + +_feeQuantity),4)
    let requiredCoinQuantity = new BigNumber(totalAmount)
      .multipliedBy(new BigNumber(1.0 - +process.env.REACT_APP_TxFee))
      .toNumber();
    let usedPrice = new BigNumber(requiredCoinQuantity)
      .multipliedBy(new BigNumber(price))
      .toNumber();
    let feeQuantity = _feeQuantity * 10 ** parseInt(coinDecimal);
    console.log(
      "into1910",
      requiredCoinQuantity * 10 ** coinDecimal,
      usedPrice,
      feeQuantity,
      totalAmount,
      1 - +process.env.REACT_APP_TxFee,
      totalAmount,
      new BigNumber(requiredCoinQuantity)
        .plus(new BigNumber(_feeQuantity))
        .toNumber()
    );
    return {
      requiredCoinQuantity,
      changedPerc,
      usedPrice,
      feeQuantity,
      totalAmount,
    };
  } else if (newCoinPerc === 0) {
    // let requiredCoinQuantity = formatValue((coinQuantity* (1-+process.env.REACT_APP_TxFee)),4)
    // if(coinSymbol !== 'ETH'){
    // coinQuantity = coinQuantity - 0.000000001
    // }
    let requiredCoinQuantity = new BigNumber(coinQuantity)
      .multipliedBy(new BigNumber(1 - +process.env.REACT_APP_TxFee))
      .toNumber();
    let usedPrice = new BigNumber(requiredCoinQuantity)
      .multipliedBy(new BigNumber(price))
      .toNumber();
    let feeQuantity =
      new BigNumber(coinQuantity)
        .multipliedBy(new BigNumber(+process.env.REACT_APP_TxFee))
        .toNumber() *
      10 ** parseInt(coinDecimal);
    let totalAmount = coinQuantity;
    console.log(
      "into090",
      requiredCoinQuantity * 10 ** coinDecimal,
      feeQuantity,
      totalAmount
    );
    return {
      requiredCoinQuantity,
      changedPerc: oldCoinPerc,
      usedPrice,
      feeQuantity,
      totalAmount,
    };
  } else {
    let changedPerc = newCoinPerc - oldCoinPerc;
    let totalQuantity = new BigNumber(changedPerc)
      .multipliedBy(new BigNumber(totalBal))
      .dividedBy(new BigNumber(100).multipliedBy(new BigNumber(price)))
      .toNumber();
    let requiredCoinQuantity = new BigNumber(totalQuantity)
      .multipliedBy(new BigNumber(1.0 - +process.env.REACT_APP_TxFee))
      .toNumber();
    let usedPrice = new BigNumber(requiredCoinQuantity)
      .multipliedBy(new BigNumber(price))
      .toNumber();
    console.log(
      "check123",
      newCoinPerc,
      oldCoinPerc,
      changedPerc,
      requiredCoinQuantity
    );
    return {
      requiredCoinQuantity,
      changedPerc,
      usedPrice,
      feeQuantity: 0,
      totalAmount: requiredCoinQuantity,
    };
  }
};
export const sendCoinQuanityToReduce = (
  price,
  coinQuantity,
  totalBal,
  newCoinPerc,
  oldCoinPerc,
  coinSymbol,
  coinDecimal
) => {
  // totalBal = getTotalBalance()
  console.log(
    "CoinSymbol",
    price,
    coinQuantity,
    totalBal,
    newCoinPerc,
    oldCoinPerc,
    coinSymbol,
    coinDecimal
  );

  if (newCoinPerc < oldCoinPerc && newCoinPerc !== 0) {
    console.log("percCheck", newCoinPerc, oldCoinPerc);
    let changedPerc = oldCoinPerc - newCoinPerc;
    // let feeQuantity =  (((((1)* (coinQuantity*price))/(100*price)).toFixed(4))*(10**coinDecimal))
    console.log("changedPerc", changedPerc, process.env.REACT_APP_TxFee);

    // let requiredCoinQuantity=formatValue((changedPerc* totalBal)/(100*price),4)
    // console.log("requiredCoinQuantity",requiredCoinQuantity)
    let totalAmount = new BigNumber(changedPerc)
      .dividedBy(new BigNumber(oldCoinPerc))
      .multipliedBy(new BigNumber(coinQuantity))
      .toNumber();
    // console.log("tempRequiredCoinQuantity",tempRequiredCoinQuantity)
    // let usedPrice=requiredCoinQuantity*price
    // let _feeQuantity = formatValue((requiredCoinQuantity* +process.env.REACT_APP_TxFee),4)
    let _feeQuantity = new BigNumber(totalAmount)
      .multipliedBy(new BigNumber(+process.env.REACT_APP_TxFee))
      .toNumber();
    // let totalAmount = formatValue(+(+requiredCoinQuantity + +_feeQuantity),4)
    let requiredCoinQuantity = new BigNumber(totalAmount)
      .multipliedBy(new BigNumber(1.0 - +process.env.REACT_APP_TxFee))
      .toNumber();
    let usedPrice = new BigNumber(requiredCoinQuantity)
      .multipliedBy(new BigNumber(price))
      .toNumber();
    let feeQuantity = _feeQuantity * 10 ** parseInt(coinDecimal);
    console.log(
      "into1910",
      requiredCoinQuantity * 10 ** coinDecimal,
      usedPrice,
      feeQuantity,
      totalAmount,
      1 - +process.env.REACT_APP_TxFee,
      totalAmount,
      new BigNumber(requiredCoinQuantity)
        .plus(new BigNumber(_feeQuantity))
        .toNumber()
    );
    return {
      requiredCoinQuantity,
      changedPerc,
      usedPrice,
      feeQuantity,
      totalAmount,
    };
  } else if (newCoinPerc === 0) {
    // let requiredCoinQuantity = formatValue((coinQuantity* (1-+process.env.REACT_APP_TxFee)),4)
    // if(coinSymbol !== 'ETH'){
    // coinQuantity = coinQuantity - 0.000000001
    // }
    let requiredCoinQuantity = new BigNumber(coinQuantity)
      .multipliedBy(new BigNumber(1 - +process.env.REACT_APP_TxFee))
      .toNumber();
    let usedPrice = new BigNumber(requiredCoinQuantity)
      .multipliedBy(new BigNumber(price))
      .toNumber();
    let feeQuantity =
      new BigNumber(coinQuantity)
        .multipliedBy(new BigNumber(+process.env.REACT_APP_TxFee))
        .toNumber() *
      10 ** parseInt(coinDecimal);
    let totalAmount = coinQuantity;
    console.log(
      "into090",
      requiredCoinQuantity * 10 ** coinDecimal,
      feeQuantity,
      totalAmount
    );
    return {
      requiredCoinQuantity,
      changedPerc: oldCoinPerc,
      usedPrice,
      feeQuantity,
      totalAmount,
    };
  } else {
    let changedPerc = newCoinPerc - oldCoinPerc;
    let totalQuantity = new BigNumber(changedPerc)
      .multipliedBy(new BigNumber(totalBal))
      .dividedBy(new BigNumber(100).multipliedBy(new BigNumber(price)))
      .toNumber();
    let requiredCoinQuantity = new BigNumber(totalQuantity)
      .multipliedBy(new BigNumber(1.0 - +process.env.REACT_APP_TxFee))
      .toNumber();
    let usedPrice = new BigNumber(requiredCoinQuantity)
      .multipliedBy(new BigNumber(price))
      .toNumber();
    console.log(
      "check123",
      newCoinPerc,
      oldCoinPerc,
      changedPerc,
      requiredCoinQuantity
    );
    return {
      requiredCoinQuantity,
      changedPerc,
      usedPrice,
      feeQuantity: 0,
      totalAmount: requiredCoinQuantity,
    };
  }
};

export const getTimeChangeFilterValue = (vaultCoin, activeTimeFilter) => {
  let percentageChange;
  switch (activeTimeFilter) {
    case 0:
      percentageChange = vaultCoin.percent_change_1h;
      break;
    case 1:
      percentageChange = vaultCoin.percent_change_24h;
      break;
    case 2:
      percentageChange = vaultCoin.percent_change_7d;
      break;
    case 3:
      percentageChange = vaultCoin.percent_change_30d;
      break;
    case 4:
      percentageChange = vaultCoin.percent_change_60d;
      break;
    case 5:
      percentageChange = vaultCoin.percent_change_90d;
      break;
    default:
      percentageChange = vaultCoin.percent_change_90d;
      break;
  }
  return percentageChange;
};
