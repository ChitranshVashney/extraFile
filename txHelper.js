/*
 *   Copyright (c) 2023
 *   All rights reserved.
 */
import { abiObj } from "../utils/contracts/SimpleTokenSwap";
import Emitter from "./emitter";
import BigNumber from "bignumber.js";

async function getQuote(
  tradeToken,
  chainConfig,
  amount = 0,
  attempt,
  _sellAmount = null
) {
  //  console.log("Getting Quote",tradeToken,amount,attempt,_sellAmount, chainConfig);

  let params = !_sellAmount
    ? attempt
      ? attempt && amount
        ? {
            sellTokenAdress: chainConfig.baseCurrencyAddress,
            buyTokenAddress: tradeToken.coinAddress,
            // sellAmount: amount,
            sellToken: chainConfig.symbol.toUpperCase(),
            buyToken: tradeToken.coinSymbol.toUpperCase(),
            sellAmount: amount
              ? +Math.floor(+amount)
              : Math.floor(+tradeToken.sellAmount),
            // takerAddress: account,
          }
        : {
            sellTokenAdress: chainConfig.baseCurrencyAddress,
            buyTokenAddress: tradeToken.coinAddress,
            // sellAmount: amount,
            sellToken: chainConfig.symbol.toUpperCase(),
            buyToken: tradeToken.coinSymbol.toUpperCase(),
            buyAmount: amount
              ? +Math.floor(+amount)
              : +Math.floor(+tradeToken.buyAmount),
            // takerAddress: account,
          }
      : {
          sellTokenAdress: tradeToken.coinAddress,
          buyTokenAddress: chainConfig.baseCurrencyAddress,
          // sellAmount: amount,
          sellToken: tradeToken.sellToken.toUpperCase(),
          buyToken: chainConfig.symbol.toUpperCase(),
          sellAmount: Math.floor(+tradeToken.sellAmount),
        }
    : {
        sellTokenAdress: chainConfig.baseCurrencyAddress,
        buyTokenAddress: tradeToken.coinAddress,
        // sellAmount: amount,
        sellToken: chainConfig.symbol.toUpperCase(),
        buyToken: tradeToken.coinSymbol.toUpperCase(),
        sellAmount: Math.floor(+_sellAmount),
        // takerAddress: account,
      };

  //  console.log('params9090',params)
  // Fetch the swap quote.
  //   console.log(params.sellAmount,`https://goerli.api.0x.org/swap/v1/quote?sellToken=`+params.sellTokenAdress+`&buyToken=`+params.buyTokenAddress+`&sellAmount=100000000000000000` )

  let response;

  // console.log('nt1',`https://goerli.api.0x.org/swap/v1/quote?sellToken=`+params.sellTokenAdress+`&buyToken=`+params.buyTokenAddress+`&sellAmount=`+params.sellAmount)
  // console.log('nt3',`https://goerli.api.0x.org/swap/v1/quote?sellToken=`+params.sellTokenAdress+`&buyToken=`+params.buyTokenAddress+`&sellAmount=`+params.sellAmount)

  // attempt?
  if (attempt && !amount) {
    // console.log('quotUrl',`https://api.0x.org/swap/v1/quote?sellToken=`+params.sellTokenAdress+`&buyToken=`+params.buyTokenAddress+`&buyAmount=`+params.buyAmount)
    if (chainConfig.networkId === 1) {
      response = await fetch(
        `https://api.0x.org/swap/v1/quote?sellToken=` +
          params.sellTokenAdress +
          `&buyToken=` +
          params.buyTokenAddress +
          `&buyAmount=` +
          params.buyAmount
      );
    } else if (chainConfig.networkId === 5) {
      response = await fetch(
        `https://goerli.api.0x.org/swap/v1/quote?sellToken=` +
          params.sellTokenAdress +
          `&buyToken=` +
          params.buyTokenAddress +
          `&buyAmount=` +
          params.buyAmount
      );
    } else if (chainConfig.networkId === 56) {
      response = await fetch(
        `https://bsc.api.0x.org/swap/v1/quote?sellToken=` +
          params.sellTokenAdress +
          `&buyToken=` +
          params.buyTokenAddress +
          `&buyAmount=` +
          params.buyAmount
      );
    } else if (chainConfig.networkId === 137) {
      response = await fetch(
        `https://polygon.api.0x.org/swap/v1/quote?sellToken=` +
          params.sellTokenAdress +
          `&buyToken=` +
          params.buyTokenAddress +
          `&buyAmount=` +
          params.buyAmount +
          `&slippagePercentage=0.01`
      );
    }
  } else {
    // console.log('quotUrl',`https://api.0x.org/swap/v1/quote?sellToken=`+params.sellTokenAdress+`&buyToken=`+params.buyTokenAddress+`&sellAmount=`+params.sellAmount)
    if (chainConfig.networkId === 1) {
      //Ethereum Chain
      response = await fetch(
        `https://api.0x.org/swap/v1/quote?sellToken=` +
          params.sellTokenAdress +
          `&buyToken=` +
          params.buyTokenAddress +
          `&sellAmount=` +
          params.sellAmount +
          `&slippagePercentage=0.01`
      );
    } else if (chainConfig.networkId === 5) {
      //Goerli Chain
      response = await fetch(
        `https://goerli.api.0x.org/swap/v1/quote?sellToken=` +
          params.sellTokenAdress +
          `&buyToken=` +
          params.buyTokenAddress +
          `&sellAmount=` +
          params.sellAmount +
          `&slippagePercentage=0.01`
      );
    } else if (chainConfig.networkId === 56) {
      //Polygon Chain
      response = await fetch(
        `https://bsc.api.0x.org/swap/v1/quote?sellToken=` +
          params.sellTokenAdress +
          `&buyToken=` +
          params.buyTokenAddress +
          `&sellAmount=` +
          params.sellAmount +
          `&slippagePercentage=0.01`
      );
    } else if (chainConfig.networkId === 137) {
      //Binance Chain
      response = await fetch(
        `https://polygon.api.0x.org/swap/v1/quote?sellToken=` +
          params.sellTokenAdress +
          `&buyToken=` +
          params.buyTokenAddress +
          `&sellAmount=` +
          params.sellAmount +
          `&slippagePercentage=0.01`
        // `&slippagePercentage=0.15`             // can be required in polygon  chAIN
      );
    } else if (chainConfig.networkId === 42161) {
      //Arbitrum Chain
      response = await fetch(
        `https://arbitrum.api.0x.org/swap/v1/quote?sellToken=` +
          params.sellTokenAdress +
          `&buyToken=` +
          params.buyTokenAddress +
          `&sellAmount=` +
          params.sellAmount +
          `&slippagePercentage=0.01`
      );
    } else if (chainConfig.networkId === 43114) {
      //Avalanche Chain
      response = await fetch(
        `https://avalanche.api.0x.org/swap/v1/quote?sellToken=` +
          params.sellTokenAdress +
          `&buyToken=` +
          params.buyTokenAddress +
          `&sellAmount=` +
          params.sellAmount +
          `&slippagePercentage=0.01`
      );
    } else if (chainConfig.networkId === 250) {
      //Fantom Chain
      response = await fetch(
        `https://fantom.api.0x.org/swap/v1/quote?sellToken=` +
          params.sellTokenAdress +
          `&buyToken=` +
          params.buyTokenAddress +
          `&sellAmount=` +
          params.sellAmount +
          `&slippagePercentage=0.01`
        // "&takeraddress=0xF4D799Fd580bAa4E6106ace853E7e22D4ab8f1C0"
      );
    }
  }

  // :
  // response = await fetch(`https://goerli.api.0x.org/swap/v1/quote?sellToken=`+params.sellTokenAdress+`&buyToken=`+params.buyTokenAddress+`&sellAmount=`+params.sellAmount)
  // const response = await fetch(`https://goerli.api.0x.org/swap/v1/quote?sellToken=`+params.sellTokenAdress+`&buyToken=`+params.buyTokenAddress+`&sellAmount=`+params.sellAmount);

  let swapQuoteJSON = await response.json();
  // console.log("responsent45",swapQuoteJSON)

  return swapQuoteJSON;
}

export const generateMultiSwap = async (
  swappingCoins,
  web3Instance,
  walletAddress,
  increasedPerc,
  chainData
) => {
  const erc20abi = [
    {
      inputs: [
        { internalType: "string", name: "name", type: "string" },
        { internalType: "string", name: "symbol", type: "string" },
        { internalType: "uint256", name: "max_supply", type: "uint256" },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      inputs: [
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "address", name: "spender", type: "address" },
      ],
      name: "allowance",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
      name: "burn",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "account", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "burnFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "subtractedValue", type: "uint256" },
      ],
      name: "decreaseAllowance",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "addedValue", type: "uint256" },
      ],
      name: "increaseAllowance",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "recipient", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "sender", type: "address" },
        { internalType: "address", name: "recipient", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transferFrom",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];
  let contract_Address = chainData.contractAddress;
  let baseTokenAddr = chainData.baseCurrencyAddress;
  // console.log("trying swapdfdfadfadf");
  const abi = abiObj.abi;
  // console.log("Hit1")
  console.log("swappingCoins", swappingCoins);
  Emitter.emit("txStatus", { statusPerc: 5 });

  // console.log("web3Info",web3Instance)
  const contract = new web3Instance.eth.Contract(abi, contract_Address);

  // The address, if any, of the most recently used account that the caller is permitted to access
  // let accounts = await ethereum.request({ method: "eth_accounts" });
  let takerAddress = walletAddress;

  let ethereumForSale = 0;
  let qouteList = [];
  let sellTokenAddress = [];
  let buyTokenAddress = [];
  let allowanceTarget = [];
  let to = [];
  let data = [];
  let sellAmount = [];
  let totalWeth = new BigNumber(0);
  // console.log("totalWeth",totalWeth);
  Emitter.emit("txStatus", { statusPerc: 7 });

  //loop to get quotetion of selling coins
  // console.log("time",swappingCoins.reducedCoins)
  for (const token of swappingCoins.reducedCoins) {
    // console.log("redTokenQuote1",tounshift
    let tempQuote = {};
    if (
      token.coinAddress !== "Ethereum" &&
      token.coinAddress !== "Binance" &&
      token.coinAddress !== "Polygon" &&
      token.coinAddress !== "Arbitrum" &&
      token.coinAddress !== "Avalanche" &&
      token.coinAddress !== "Fantom"
    ) {
      //TODO: change Ethereum address to 0X0000000000 address
      // console.log("check123",token,baseTokenAddr)
      if (
        token.coinAddress.toLowerCase() ===
        chainData.baseCurrencyAddress.toLowerCase()
      ) {
        tempQuote.buyAmount = Math.floor(+token.sellAmount).toString();
        tempQuote.sellTokenAddress = token.coinAddress;
        tempQuote.buyTokenAddress = token.coinAddress;
        tempQuote.allowanceTarget =
          "0xdef1c0ded9bec7f1a1670819833240f027b25eff";
        tempQuote.to = "0xdef1c0ded9bec7f1a1670819833240f027b25eff";
        tempQuote.data = "0x415565b000000000000000000000000007878";
        tempQuote.sellAmount = Math.floor(+token.sellAmount).toString();
        // console.log("totalWeth1",tempQuote.buyAmount)
        totalWeth = new BigNumber(+tempQuote.buyAmount).plus(totalWeth);
        qouteList.unshift(tempQuote);
        sellTokenAddress.unshift(tempQuote.sellTokenAddress);
        buyTokenAddress.unshift(tempQuote.buyTokenAddress);
        allowanceTarget.unshift(tempQuote.allowanceTarget);
        to.unshift(tempQuote.to);
        data.unshift(tempQuote.data);
        sellAmount.unshift(
          Math.floor(+token.totalAmount * 10 ** token.coinDecimal).toString()
        );
      } else {
        tempQuote = await getQuote(token, chainData, 0, 0);
        qouteList.push(tempQuote);
        // console.log("totalWeth1",tempQuote.buyAmount)
        totalWeth = new BigNumber(+tempQuote.buyAmount).plus(totalWeth);
        sellTokenAddress.push(tempQuote.sellTokenAddress);
        buyTokenAddress.push(tempQuote.buyTokenAddress);
        allowanceTarget.push(tempQuote.allowanceTarget);
        to.push(tempQuote.to);
        data.push(tempQuote.data);
        // console.log("int6767",token.totalAmount,( (new BigNumber(token.totalAmount).multipliedBy(new BigNumber(10**(token.coinDecimal)))).toNumber()).toString())
        sellAmount.push(
          Math.floor(
            new BigNumber(token.totalAmount)
              .multipliedBy(new BigNumber(10 ** token.coinDecimal))
              .toNumber()
          ).toString()
        );
      }

      // totalWeth.push(tempQuote.totalWeth)
    } else {
      // console.log("total123",token.sellAmount)
      ethereumForSale = token.totalAmount; //sellAmount
      totalWeth = new BigNumber(+token.sellAmount).plus(totalWeth);
    }
    // console.log("tim4545",token,totalWeth.toNumber())
  }
  // console.log("swapQuoteJSON",qouteList,sellTokenAddress)
  Emitter.emit("txStatus", { statusPerc: 10 });

  const maxApproval = 10000000000000000000000n.toString(); //TODO: in future take this value from backend database

  Emitter.emit("txStatus", { statusPerc: 15 });
  //Multiple ERC20 contract here
  let contractIntsances = [];

  //above loop iterates through reduced coins and weth to get their instance
  swappingCoins.reducedCoins.map((e) => {
    // console.log("sellTokenAddr",e.coinAddress)
    if (
      e.coinAddress !== "Ethereum" &&
      e.coinAddress !== "Binance" &&
      e.coinAddress !== "Polygon" &&
      e.coinAddress !== "Arbitrum" &&
      e.coinAddress !== "Avalanche" &&
      e.coinAddress !== "Fantom"
    ) {
      let ERC20TokenContract = new web3Instance.eth.Contract(
        erc20abi,
        e.coinAddress
      );
      contractIntsances.push(ERC20TokenContract);
    }
  });

  let approvalList = [];
  Emitter.emit("txStatus", { statusPerc: 20 });

  let i = 0;
  //loop to get approval of the selling tokens
  // if(!testMode){
  for (const instance of contractIntsances) {
    let allowance = await instance.methods
      .allowance(walletAddress, contract_Address)
      .call();

    if (+allowance < +swappingCoins?.reducedCoins[i]?.sellAmount) {
      approvalList.push(
        instance.methods
          .approve(contract_Address, maxApproval)
          .send({ from: takerAddress })
      );
    }

    i += 1;
  }
  // }

  let ethereumToBuy = 0;
  await Promise.all(approvalList);
  Emitter.emit("txStatus", { statusPerc: 50 });
  // console.log("totalWeth",totalWeth.toNumber())
  totalWeth = new BigNumber(0.99).multipliedBy(totalWeth);

  for (const token of swappingCoins.increasedCoins) {
    // console.log("checkaddr", token.coinAddress, baseTokenAddr);
    let tempQuote = {};
    // console.log("increasedToken",token)
    if (
      token.coinAddress === "Ethereum" ||
      token.coinAddress === "Binance" ||
      token.coinAddress === "Polygon" ||
      token.coinAddress === "Arbitrum" ||
      token.coinAddress === "Avalanche" ||
      token.coinAddress === "Fantom"
    ) {
      // console.log("ethCheck",token)
      //if increasedCoins array length is only one i.e. it is a many-to-one aand 0ne-to-one condition so there we are keeping buyAmount equal to totalWeth recieved in swapping qoutes of reducedCoins
      if (swappingCoins.increasedCoins.length === 1) {
        token.buyAmount = totalWeth.toNumber();
        // console.log("t0m89",ethereumToBuy)
      }
      ethereumToBuy = token.buyAmount;
    } else if (
      token.coinAddress.toLowerCase() ===
      chainData.baseCurrencyAddress.toLowerCase() // Wrapped Native Token or BaseCurrencyToken
    ) {
      // console.log("wethCheck",token)
      continue;
    } else {
      // console.log("erco20Check",token)

      if (swappingCoins.increasedCoins.length === 1) {
        tempQuote = await getQuote(token, chainData, totalWeth.toNumber(), 1);
      } else {
        // let _tempQuote = await getQuote(token,0,1)
        //  console.log("hereQuote",_tempQuote,_tempQuote.sellAmount)
        //   tempQuote= await getQuote(token,0,0,+((+_tempQuote.sellAmount).toFixed(0)))
        // console.log("increasedPerc",increasedPerc)
        let singlePercWeightage = totalWeth
          .dividedBy(new BigNumber(increasedPerc))
          .toNumber();
        let requiredSellAmount = new BigNumber(singlePercWeightage)
          .multipliedBy(token.changedPerc)
          .toNumber();
        // console.log("requiredMToMSell",requiredSellAmount,singlePercWeightage,token.changedPerc)
        tempQuote = await getQuote(
          token,
          chainData,
          0,
          0,
          +Math.floor(requiredSellAmount)
        );
      }
      console.log("tempQuote ", tempQuote);
      qouteList.push(tempQuote);
      sellTokenAddress.push(tempQuote.sellTokenAddress);
      buyTokenAddress.push(tempQuote.buyTokenAddress);
      allowanceTarget.push(tempQuote.allowanceTarget);
      to.push(tempQuote.to);
      data.push(tempQuote.data);
      sellAmount.push(Math.floor(+tempQuote.sellAmount).toString());
    }
  }

  Emitter.emit("txStatus", { statusPerc: 70 });
  // console.log("qouteList",qouteList)
  // console.log("params1",[...sellTokenAddress,],
  //   [...buyTokenAddress,],
  //   [...allowanceTarget,],
  //   [...to,],
  //   [...data,],
  //   [...sellAmount,])

  //creating contract interaction address below
  //also adding parameters for ethereum sell and ethereum buy condition
  let sendObj;
  sellTokenAddress.push("0x0000000000000000000000000000000000000000");
  buyTokenAddress.push(baseTokenAddr);
  allowanceTarget.push("0x0000000000000000000000000000000000000000");
  to.push("0x0000000000000000000000000000000000000000");
  data.push("0x1230000000000000000001230000");
  // console.log("ethereumForSale",ethereumForSale,"ethereumToBuy",ethereumToBuy)
  if (ethereumForSale) {
    //swap- ETH/WETH
    sellAmount.push(0);
    //condition for fantom and polygon chain to tackle transaction underpriced transaction
    sendObj = {
      from: takerAddress,
      value: (Math.floor(+ethereumForSale * 10 ** 18) + 5).toString(),
      // gasPrice:
      //   chainData.networkId === 250 || chainData.networkId === 137
      //     ? 500000000000
      //     : 0,
    };
  } else if (ethereumToBuy) {
    //swap- WETH/ETH
    sellAmount.push(Math.floor(+ethereumToBuy).toString());
    sendObj = {
      from: takerAddress,
      value: 0,
      // gasPrice:
      //   chainData.networkId === 250 || chainData.networkId === 137
      //     ? 500000000000
      //     : 0,
    };
  } else {
    sellAmount.push(0);
    sendObj = {
      from: takerAddress,
      value: 0,
      // gasPrice:
      //   chainData.networkId === 250 || chainData.networkId === 137
      //     ? 500000000000
      //     : 0,
    };
  }

  // console.log(
  //   "params2",
  //   [...sellTokenAddress],
  //   [...buyTokenAddress],
  //   [...allowanceTarget],
  //   [...to],
  //   [...data],
  //   [...sellAmount],
  //   sendObj
  // );

  // if(!testMode){
  console.log("sellTokenAddress ", sellTokenAddress);
  console.log(buyTokenAddress);
  console.log(allowanceTarget);
  console.log(to);
  console.log(data);
  console.log("sellAmount ", sellAmount);
  console.log("sendObj ", sendObj);
  Emitter.emit("txStatus", { statusPerc: 80 });
  const receipt = await contract.methods
    .multiSwap(
      [...sellTokenAddress],
      [...buyTokenAddress],
      [...allowanceTarget],
      [...to],
      [...data],
      [...sellAmount]
    )
    .send(sendObj);

  // console.log("receipt",receipt)
  // }
  Emitter.emit("txStatus", { statusPerc: 100 });
  // await new Promise((resolve,reject)=>{
  //     setTimeout(() => {
  //       resolve()
  //     }, 40000);
  // })
};

