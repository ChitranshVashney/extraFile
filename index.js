/*
 *   Copyright (c) 2023
 *   All rights reserved.
 */
/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
// eslint-disable-next-line react-hooks/exhaustive-deps
import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import HomeWalletInfo from "../../MobileComponents/HomeWalletInfo";
import { connect } from "react-redux";
import {
  initWallet,
  fetchWalletResponse,
  changeChainId,
  resetWallet,
  setActiveWallet,
} from "../../redux/index";
import "../../App.css";
import "../ConnectWallet/ConnectWallet.css";
import "../../mobileApp.css";
import TokenAddComponent from "./TokenAddComponent";
import artwork from "../../assets/images/Artwork.svg";
import fox from "../../assets/images/MetaMask.svg";
import walletconnect from "../../assets/images/walletconnect.svg";
import { IoArrowRedoSharp } from "react-icons/io5";
import MyWalletTokens from "../Home/MyWalletTokens";
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import Loader from "../Loader";
import ErrorComponent from "../ErrorComponent";
import PermissionModal from "./PermissionModal";
import ReserveComponent from "../ReserveComponent";
import EditVault from "./EditVault";
import { generateMultiSwap } from "../../Helper/txHelper";
import Emitter from "../../Helper/emitter";
import { formatValue } from "../../Helper/helperFunctions";
import TxSuccessModal from "./TxSuccessModal";
import BigNumber from "bignumber.js";
import Moralis from "moralis-v1";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

// import WethExchange from './WethExchange'
import TokenAddComponentMobile from "../../MobileComponents/TokenAddComponentMobile";
import Widget from "../Lifi/Widget";

const Web3 = require("web3");

function ConnectWallet(props) {
  const [isLoading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [editVaultMode, setEditVaultMode] = useState(false);
  const [error, setError] = useState(null);
  const [addCoinPerc, setaddCoinPerc] = useState(0);
  const [tokenAddMode, setTokenAddModeSection] = useState(false);
  const [addCoin, selectAddCoin] = useState([]);
  const [txWaiting, setTxWaiting] = useState(false);
  const [coinList, setCoinList] = useState([]);
  const [web3InstanceforTx, setWeb3InstanceForTx] = useState();
  const [sum, setSum] = useState(0);
  const [changedCoins, setChangedCoins] = useState({
    increasedCoins: [],
    reducedCoins: [],
  });
  const [removed, setRemoved] = useState(false);
  const { authenticate, user, logout, enableWeb3 } = useMoralis();
  const [tokenList, setTokenList] = useState(null);
  const [changedToken, setChangedToken] = useState(null);
  const [tempTokenList, setTempTokenList] = useState(null);
  const [policyConfirmation1, setConfirmations1] = useState(false);
  const [policyConfirmation2, setConfirmations2] = useState(false);
  const [showWalletOption, setShowWalletOption] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [elementRemoved, setElementRemoved] = useState(false);
  const [selectAllSelector, setSelectAllSelector] = useState(false);
  const [isAllSelectedActive, setAllSelectedActive] = useState(false);
  const [feeValue, setFeeValue] = useState();
  const [progressPerc, setProgressperc] = useState(0);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [editLength, setEditLength] = useState(0);
  const [chainKey, setChainKey] = useState("sameChain");
  const percIpRef = useRef();
  const Web3Api = useMoralisWeb3Api();

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    setFeeValue(process.env.REACT_APP_TxFee);
    if (!window.ethereum) {
      setError("Please install metamask.");
      setLoading(false);
    }

    Emitter.on("onDisconnect", (data) => {
      // console.log("hereInDisconnect")
      disconnectWallet();
    });

    Emitter.on("setLoading", (data) => {
      // console.log("hereFit123",data.isLoading)
      setLoading(data.isLoading);
    });

    Emitter.on("setWeb3Obj", (obj) => {
      // console.log("web3", obj, obj.web3);
      setWeb3InstanceForTx(obj.web3);
      setLoading(true);
    });

    if (editVaultMode) {
      editVault();
    }
  }, [props.chain?.networkId, props.serverResponse?.totalBal]);

  const connectMetamask = async () => {
    try {
      setLoading(true);
      if (!Boolean(window.ethereum && window.ethereum.isMetaMask)) {
        throw setError("Please install metamask.");
      }

      await enableWeb3({ throwOnError: true, provider: "metamask" });
      const { account, chainId } = Moralis;

      if (!account) {
        throw new Error(
          "Connecting to chain failed, as no connected account was found"
        );
      }
      if (!chainId) {
        throw new Error(
          "Connecting to chain failed, as no connected chain was found"
        );
      }

      // console.log(
      //   "tim",
      //   chainId,
      //   account,
      //   chainId.includes("0xa4b1") ? 42161 : parseInt(chainId, 16)
      // );
      if (
        chainId !== "0x1" &&
        chainId !== "0x5" &&
        chainId !== "0x13881" &&
        chainId !== "0x89" &&
        chainId !== "0x38" &&
        chainId !== "0xa4b1" &&
        chainId !== "0xfa" &&
        chainId !== "0xa86a"
      ) {
        throw new Error(
          "Network is not supported,Please switch to another network."
        );
      }

      const { message } = await Moralis.Cloud.run("requestMessage", {
        address: account,
        chain: chainId === "0xa4b1" ? 1 : parseInt(chainId, 16), //condition for taking care of arbitrum chain ID related error.
        networkType: "evm",
      });

      console.log("message", message);

      let _user = await authenticate({
        signingMessage: message,
        throwOnError: true,
      });

      if (_user == undefined) {
        throw setError("User Signature Denied");
      }

      console.log("_user", _user);
      setEditVaultMode(false);
      if (_user.accounts) {
        Emitter.emit("newConnectionRequest", {
          user: _user,
          type: "Metamask",
          fromLocal: true,
          newConnect: false,
        });
      } else {
        Emitter.emit("newConnectionRequest", {
          user: _user,
          type: "Metamask",
          fromLocal: false,
          newConnect: true,
        });
      }
    } catch (error) {
      setLoading(false);
      console.log("error", error.message, error);
      if (error.code === -32002) {
        setError(
          "Please check your wallet, provide your inputs on pending connection request."
        );
      } else if (error.code === 4001) {
        setError("User has denied permission.");
      } else if (error.message.includes("Moralis auth failed")) {
        setError("Connection Session Timeout, Please Try Again!.");
      } else {
        setError(error.message);
      }
    }
  };

  //function to connect walletConnect
  const connectWalletConnect = async () => {
    try {
      // throw new Error("Currently WalletConnect is disabled.Will be restored.")
      setLoading(true);

      await enableWeb3({ throwOnError: true, provider: "walletconnect" });
      const { account, chainId } = Moralis;

      if (!account) {
        throw new Error(
          "Connecting to chain failed, as no connected account was found"
        );
      }
      if (!chainId) {
        throw new Error(
          "Connecting to chain failed, as no connected chain was found"
        );
      }

      if (chainId !== "0x1") {
        throw new Error(
          'Currently only Ethereum Mainnet network is supported. Please switch to "Ethereum Mainnet".'
        );
      }

      const { message } = await Moralis.Cloud.run("requestMessage", {
        address: account,
        chain: parseInt(chainId, 16),
        networkType: "evm",
      });
      let _user = await authenticate({
        provider: "walletconnect",
        mobileLinks: ["rainbow", "metamask", "argent", "imtoken", "pillar"],
        signingMessage: message,
        throwOnError: true,
      });
      //  console.log("endLog",_user)

      if (_user == undefined) {
        throw setError("User Signature Denied");
      }
      // console.log("walletConnect")
      setEditVaultMode(false);
      if (_user.accounts) {
        Emitter.emit("newConnectionRequest", {
          user: _user,
          type: "walletconnect",
          fromLocal: true,
          newConnect: false,
        });
      } else {
        Emitter.emit("newConnectionRequest", {
          user: _user,
          type: "walletconnect",
          fromLocal: false,
          newConnect: true,
        });
      }
    } catch (error) {
      console.log("error", error, error.message);
      setLoading(false);
      if (
        error.message.includes(
          "Moralis Moralis.enableWeb3() already has been called, but is not finished yet"
        )
      ) {
        setError(
          "User have denied permission previously for walletConnect.Please try again."
        );
        logout();
      } else if (error.message.includes("Vault not ready yet")) {
        logout();
        localStorage.removeItem("walletconnect");
        setError(error.message);
      } else {
        setError(error.message);
      }
    }
  };

  //function calculates sum of percentages of all the tokens
  let sumPerc = (tempListArray, changed = false) => {
    let sum = new BigNumber(0);
    tempListArray.forEach((item, i) => {
      // console.log("che67",item.coinAddress,item.coinPerc)
      sum = new BigNumber(+item.coinPerc).plus(sum);
    });
    sum = sum.toNumber();
    sum = +formatValue(sum, 2);
    // console.log("sum",sum,Math.round(sum))
    if (sum === 99.99) {
      sum = 100.0;
    }
    setSum(sum);
  };

  const openModel = async () => {
    setShow(true);
  };

  //function to reset confirmations
  const resetConfirmations = () => {
    setConfirmations1(false);
    setConfirmations2(false);
  };

  const handleClose = () => {
    setShow(false);
    resetConfirmations();
    setShowWalletOption(false);
  };

  const handleConfirm = () => {
    setShow(false);
    setShowWalletOption(true);
  };

  const disconnectWallet = () => {
    logout();
    localStorage.removeItem("activeWallet");
    props.initWallet({
      walletAddress: null,
      chainId: null,
      isWalletConnected: false,
      isPolicyAccepted: false,
      assets: null,
    });
  };

  const editVault = () => {
    setEditVaultMode(true);
    setTokenList(props.serverResponse.assetList);
    setEditLength(props.serverResponse.assetList.length);
    // setTempTokenList(props.serverResponse.assetList)
    let newTempTokenList = [];
    props.serverResponse.assetList.map((item, i) => {
      newTempTokenList.push({
        coinAddress: item.coinAddress,
        coinValue: item.coinValue,
        coinPerc: item.coinPerc,
        exactCoinPerc: item.coinPerc,
      });
    });
    // console.log("newTempTokenList",newTempTokenList)
    setTempTokenList(newTempTokenList);
    sumPerc(newTempTokenList);
    window.scrollTo(0, 0);
  };

  const formatCoins = () => {
    percIpRef.current.value = null;

    console.log("adddCoins");
    if (addCoin.length) {
      let newTempTokenList = tempTokenList;
      if (+addCoinPerc == 0) {
        console.log("add coinPerc =0");
        addCoin.map((token) => {
          let _addCoin = Object.assign({}, token);
          _addCoin.coinValue = 0;
          _addCoin.coinPerc = 0;
          _addCoin.isNewlyAdded = true;
          _addCoin.coinLogoUrl = token.coinLogoUrl;
          setTokenList((list) => [...list, _addCoin]);

          // console.log(tokenList);
          newTempTokenList.push({
            coinAddress: token.coinAddress,
            coinValue: 0,
            coinPerc: 0,
            exactCoinPerc: 0,
            coinLogoUrl: token.coinLogoUrl,
          });
        });
        console.log("_newTempTokenList", newTempTokenList);
      } else {
        addCoin.map((token) => {
          let totalBal = Math.floor(+props.serverResponse.totalBal);
          let tempFreeAmount = ((+addCoinPerc * +totalBal) / 100).toFixed(3);
          let newCoinValue = Math.floor(+tempFreeAmount + +token.coinValue);
          let newCoinPerc = Math.round((newCoinValue / totalBal) * 100);
          console.log(
            "addCoinPerc123",
            addCoinPerc,
            tempFreeAmount,
            newCoinValue,
            newCoinPerc,
            tempFreeAmount,
            token,
            totalBal
          );
          let _addCoin = Object.assign({}, token);
          _addCoin.coinValue = 0;
          _addCoin.coinPerc = 0;
          _addCoin.isNewlyAdded = true;
          _addCoin.coinLogoUrl = token.coinLogoUrl;
          setTokenList((list) => [...list, _addCoin]);
          _addCoin.coinValue = newCoinValue;
          _addCoin.coinPerc = newCoinPerc;
          selectAddCoin(_addCoin);

          //    console.log("toke",tokenList,tempTokenList)

          newTempTokenList.push({
            coinAddress: token.coinAddress,
            coinValue: newCoinValue,
            coinPerc: +addCoinPerc,
            exactCoinPerc: +addCoinPerc,
            coinLogoUrl: token.coinLogoUrl,
          });

          //   console.log("newTempTokenList",newTempTokenList)
        });
      }
      // console.log("t123",newTempTokenList)
      sumPerc(newTempTokenList);
      // console.log("newTempTokenList",newTempTokenList)
      setTempTokenList(newTempTokenList);
      selectAddCoin([]);
      setSelectedTokens([]);
      setCoinPerc(0);
    }

    // }
  };

  const checkPerc = async () => {
    try {
      // console.log("checkPerc func")
      let sum = 0;
      tempTokenList.forEach((e) => {
        sum = new BigNumber(+e.coinPerc).plus(sum);
      });
      sum = sum.toNumber();
      sum = formatValue(sum, 2);
      // console.log("sum68",sum)

      if (sum === 99.99) {
        sum = 100.0;
      }

      if (sum < 100.0 || sum > 100.0) {
        // console.log("Total percentage should be 100%.")
        return setError("Total percentage should be 100%.");
      }
      setTxWaiting(true);
      setProgressperc(3);
      let _changedCoins = { increasedCoins: [], reducedCoins: [] };
      let increasedPerc = 0;
      // console.log("tempTokenList",tempTokenList,tokenList)
      let i = 0;
      for (let token of tempTokenList) {
        // console.log("sam12", props.serverResponse.assetList[i]);
        if (props.serverResponse.assetList.length > i) {
          if (
            token.coinAddress === props.serverResponse.assetList[i].coinAddress
          ) {
            let {
              requiredCoinQuantity,
              changedPerc,
              usedPrice,
              feeQuantity,
              totalAmount,
            } = await sendCoinQuanity(
              +props.serverResponse.assetList[i].coinPrice,
              +props.serverResponse.assetList[i].coinQuantity,
              +props.serverResponse.totalBal,
              token.coinPerc,
              +props.serverResponse.assetList[i].coinPerc,
              props.serverResponse.assetList[i].coinSymbol,
              props.serverResponse.assetList[i].coinDecimal
            );
            let {
              requiredCoinQuantityRED,
              changedPercRED,
              usedPriceRED,
              feeQuantityRED,
              totalAmountRED,
            } = await sendCoinQuanityToReduce(
              +props.serverResponse.assetList[i].coinPrice,
              +props.serverResponse.assetList[i].coinQuantity,
              +props.serverResponse.totalBal,
              token.coinPerc,
              +props.serverResponse.assetList[i].coinPerc,
              props.serverResponse.assetList[i].coinSymbol,
              props.serverResponse.assetList[i].coinDecimal
            );
            // console.log("nit7878",totalAmount)
            if (+token.coinPerc < +props.serverResponse.assetList[i].coinPerc) {
              _changedCoins.reducedCoins.push({
                coinAddress: token.coinAddress,
                coinName: tokenList[i].coinName,
                requiredCoinQuantityRED,
                changedPercRED,
                usedPriceRED,
                coinPrice: +props.serverResponse.assetList[i].coinPrice,
                coinDecimal: props.serverResponse.assetList[i].coinDecimal,
                sellToken: props.serverResponse.assetList[i].coinSymbol,
                buyToken: "Wei",
                sellAmount:
                  requiredCoinQuantityRED *
                  10 ** +props.serverResponse.assetList[i].coinDecimal,
                feeQuantityRED,
                totalAmountRED,
                coinLogoUrl: props.serverResponse.assetList[i].coinLogo,
              });
            }

            if (+token.coinPerc > +props.serverResponse.assetList[i].coinPerc) {
              // console.log("check1",requiredCoinQuantity,changedPerc,usedPrice,feeQuantity,totalAmount)
              _changedCoins.increasedCoins.push({
                coinAddress: token.coinAddress,
                coinName: tokenList[i].coinName,
                requiredCoinQuantity,
                changedPerc,
                usedPrice,
                coinSymbol: props.serverResponse.assetList[i].coinSymbol,
                buyAmount:
                  requiredCoinQuantity *
                  10 ** +props.serverResponse.assetList[i].coinDecimal,
                coinDecimal: props.serverResponse.assetList[i].coinDecimal,
                feeQuantity,
                totalAmount,
                coinLogoUrl: props.serverResponse.assetList[i].coinLogo,
              });
              increasedPerc += +changedPerc;
            }
            //  console.log("check2",_changedCoins)
          }
        } else {
          // console.log("token", tempTokenList[i]);
          if (token.coinAddress === tempTokenList[i].coinAddress) {
            let { requiredCoinQuantity, changedPerc, usedPrice, totalAmount } =
              await sendCoinQuanity(
                +tokenList[i].coinPrice,
                0,
                +props.serverResponse.totalBal,
                formatValue(+tempTokenList[i].coinPerc, 2),
                0,
                tokenList[i].coinSymbol,
                +tokenList[i].coinDecimalPlaces
              );
            _changedCoins.increasedCoins.push({
              coinAddress: token.coinAddress,
              coinName: tokenList[i].coinName,
              requiredCoinQuantity,
              changedPerc,
              usedPrice,
              coinSymbol: tokenList[i].coinSymbol,
              coinDecimal: tokenList[i].coinDecimalPlaces,
              buyToken: tokenList[i].coinSymbol,
              totalAmount,
              buyAmount:
                requiredCoinQuantity * 10 ** tokenList[i].coinDecimalPlaces,
              coinLogoUrl: tempTokenList[i].coinLogoUrl,
            });
            increasedPerc += +changedPerc;
          }
        }
        i += 1;
      }
      if (
        !_changedCoins.increasedCoins.length ||
        !_changedCoins.reducedCoins.length
      ) {
        // console.log("insideErrorMsg")
        throw new Error(
          "Please make changes in your vault to proceed with transactions."
        );
      }
      setProgressperc(5);
      // console.log("_changedCoins", _changedCoins);
      setChangedCoins(_changedCoins);
      setShowSuccessModal(true);
      // console.log("sit99", props, props.chain);
      if (props.web3InStance) {
        await generateMultiSwap(
          _changedCoins,
          props.web3InStance,
          props.walletAddress.toString(),
          increasedPerc,
          props.chain
        );
      } else {
        await generateMultiSwap(
          _changedCoins,
          web3InstanceforTx,
          props.walletAddress.toString(),
          increasedPerc,
          props.chain
        );
      }
      setChangedCoins(_changedCoins);
      // setShowSuccessModal(true)
      setTxWaiting(false);
    } catch (error) {
      console.log("error", error, error.message);
      setShowSuccessModal(false);
      setError(error.message);
      setTxWaiting(false);
    }
  };

  const checkPerc90 = async (input) => {
    try {
      // console.log("checkPerc func")
      let sum = 0;
      input.tempTokenList.forEach((e) => {
        sum = new BigNumber(+e.coinPerc).plus(sum);
      });
      sum = sum.toNumber();
      sum = formatValue(sum, 2);
      // console.log("sum68",sum)

      if (sum === 99.99) {
        sum = 100.0;
      }

      if (sum < 100.0 || sum > 100.0) {
        // console.log("Total percentage should be 100%.")
        return setError("Total percentage should be 100%.");
      }
      setTxWaiting(true);
      setProgressperc(3);
      let _changedCoins = { increasedCoins: [], reducedCoins: [] };
      // console.log("tempTokenList",input.tempTokenList,input.tokenList)
      let i = 0;
      for (let token of input.tempTokenList) {
        // console.log(token.coinAddress,props.serverResponse.assetList[i].coinAddress,props.serverResponse.assetList.length , i)
        if (input.tokenList.length > i) {
          if (token.coinAddress === input.tokenList[i].coinAddress) {
            let {
              requiredCoinQuantity,
              changedPerc,
              usedPrice,
              feeQuantity,
              totalAmount,
            } = await sendCoinQuanity(
              +input.tokenList[i].coinPrice,
              +input.tokenList[i].coinQuantity,
              +input.totalAmount,
              token.coinPerc,
              +input.tokenList[i].coinPerc,
              input.tokenList[i].coinSymbol,
              input.tokenList[i].coinDecimal
            );
            // console.log("nit7878",totalAmount)
            if (+token.coinPerc < +input.tokenList[i].coinPerc) {
              _changedCoins.reducedCoins.push({
                coinAddress: token.coinAddress,
                coinName: input.tokenList[i].coinName,
                requiredCoinQuantity,
                changedPerc,
                usedPrice,
                coinPrice: +input.tokenList[i].coinPrice,
                coinDecimal: input.tokenList[i].coinDecimal,
                sellToken: input.tokenList[i].coinSymbol,
                buyToken: "Wei",
                sellAmount:
                  requiredCoinQuantity * 10 ** +input.tokenList[i].coinDecimal,
                feeQuantity,
                totalAmount,
              });
            }

            if (+token.coinPerc > +input.tokenList[i].coinPerc) {
              // console.log("check1",requiredCoinQuantity,changedPerc,usedPrice,feeQuantity,totalAmount)
              _changedCoins.increasedCoins.push({
                coinAddress: token.coinAddress,
                coinName: input.tokenList[i].coinName,
                requiredCoinQuantity,
                changedPerc,
                usedPrice,
                coinSymbol: input.tokenList[i].coinSymbol,
                buyAmount:
                  requiredCoinQuantity * 10 ** +input.tokenList[i].coinDecimal,
                coinDecimal: input.tokenList[i].coinDecimal,
              }),
                feeQuantity,
                totalAmount;
            }
            //  console.log("check2",_changedCoins)
          }
        } else {
          // console.log("token",input.tempTokenList[i])
          if (token.coinAddress === input.tempTokenList[i].coinAddress) {
            let { requiredCoinQuantity, changedPerc, usedPrice, totalAmount } =
              await sendCoinQuanity(
                +input.tokenList[i].coinPrice,
                0,
                +input.totalAmount,
                formatValue(+input.tempTokenList[i].coinPerc, 2),
                0,
                input.tokenList[i].coinSymbol,
                +input.tokenList[i].coinDecimalPlaces
              );
            _changedCoins.increasedCoins.push({
              coinAddress: token.coinAddress,
              coinName: input.tokenList[i].coinName,
              requiredCoinQuantity,
              changedPerc,
              usedPrice,
              coinSymbol: input.tokenList[i].coinSymbol,
              coinDecimal: input.tokenList[i].coinDecimal,
              buyToken: input.tokenList[i].coinSymbol,
              totalAmount,
              buyAmount:
                requiredCoinQuantity * 10 ** tokenList[i].coinDecimalPlaces,
            });
          }
        }
        // console.log("changes",_changedCoins)
        i += 1;
      }
      // if(!_changedCoins.increasedCoins.length && !_changedCoins.reducedCoins.length){
      //   throw new Error('Please make changes in your vault to proceed with transactions.')
      // }
      // setProgressperc(5)
      // console.log("_changedCoins",_changedCoins)
      // setChangedCoins(_changedCoins)
      // setShowSuccessModal(true)
      // // console.log("sit99",props,props.web3InStance,web3InstanceforTx)
      // if(props.web3InStance){
      //   await generateMultiSwap(_changedCoins,props.web3InStance,props.walletAddress.toString())
      // }
      // else{
      // await generateMultiSwap(_changedCoins,web3InstanceforTx,props.walletAddress.toString())
      // }
      // setChangedCoins(_changedCoins)
      // // setShowSuccessModal(true)
      // setTxWaiting(false)
    } catch (error) {
      console.log("error", error, error.message);
      setShowSuccessModal(false);
      setError(error.message);
      setTxWaiting(false);
    }
  };

  //function calculates changes in given coin
  async function sendCoinQuanity(
    price,
    coinQuantity,
    totalBal,
    newCoinPerc,
    oldCoinPerc,
    coinSymbol,
    coinDecimal
  ) {
    // totalBal = getTotalBalance()
    // console.log("CoinSymbol",price,coinQuantity,totalBal,newCoinPerc,oldCoinPerc,coinSymbol,coinDecimal)

    if (newCoinPerc < oldCoinPerc && newCoinPerc !== 0) {
      // console.log("percCheck",newCoinPerc,oldCoinPerc)
      let changedPerc = oldCoinPerc - newCoinPerc;
      // let feeQuantity =  (((((1)* (coinQuantity*price))/(100*price)).toFixed(4))*(10**coinDecimal))
      // console.log("changedPerc",changedPerc,process.env.REACT_APP_TxFee)

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
      // console.log("into1910",requiredCoinQuantity*(10**coinDecimal),usedPrice,feeQuantity,totalAmount,1- (+process.env.REACT_APP_TxFee),totalAmount, new BigNumber(requiredCoinQuantity).plus(new BigNumber(_feeQuantity)).toNumber())
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
      // console.log("into090",requiredCoinQuantity*(10**coinDecimal),feeQuantity,totalAmount)
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
      // console.log("check123",newCoinPerc,oldCoinPerc,changedPerc,requiredCoinQuantity)
      return {
        requiredCoinQuantity,
        changedPerc,
        usedPrice,
        feeQuantity: 0,
        totalAmount: requiredCoinQuantity,
      };
    }
  }

  async function sendCoinQuanityToReduce(
    price,
    coinQuantity,
    totalBal,
    newCoinPerc,
    oldCoinPerc,
    coinSymbol,
    coinDecimal
  ) {
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
  }

  const findBalance = (_balance, _decimals) => {
    return +_balance / 10 ** +_decimals;
  };

  //function to compute changes and update state
  const changeperc = (value, index, percentageMode) => {
    try {
      // console.log("value",value)
      if (percentageMode) {
        if (value === "%") {
          value = 0;
        }
        if (value[value.length - 1] === "%") {
          value = parseFloat(value.slice(0, -1));
        }
        if (value === "" || value === null) {
          value = 0;
        }
        if (isNaN(value)) {
          throw new Error("Please enter valid number.");
          // setError('Please enter valid value.')
        }
      } else {
        if (value[0] === "~") {
          value = value.slice(1, value.length);
        }
        if (value[0] === "$") {
          value = value.slice(1, value.length);
        }
        if (value === "" || value === null) {
          value = 0;
        }
        if (isNaN(+value)) {
          // setError('Please enter valid value.')
          throw new Error("Please enter valid number.");
        }
        value = parseFloat(value);
      }

      let tempVar = tempTokenList;
      if (percentageMode) {
        // console.log("test98",tempVar[index])
        let tempOldCoinPerc1 = +formatValue(tempVar[index].exactCoinPerc, 2);
        let tempOldCoinPerc2 = parseFloat(
          Math.floor(tempVar[index].exactCoinPerc)
        );
        let decimalCheck1 = new BigNumber(tempOldCoinPerc1)
          .minus(new BigNumber(tempOldCoinPerc2))
          .toNumber();
        // console.log("checkSum1",tempOldCoinPerc1,tempOldCoinPerc2,decimalCheck1)
        let tempNewCoinPerc1 = +formatValue(value, 2);
        let tempNewCoinPerc2 = +Math.floor(value);
        let decimalCheck2 = new BigNumber(tempNewCoinPerc1)
          .minus(new BigNumber(tempNewCoinPerc2))
          .toNumber();
        // console.log("checkSum2",tempNewCoinPerc1,tempNewCoinPerc2,decimalCheck2)
        // console.log("decimalChecks",decimalCheck2,decimalCheck1,tempOldCoinPerc1,tempOldCoinPerc2,tempNewCoinPerc1,tempNewCoinPerc2)
        let checkDiff = new BigNumber(decimalCheck2)
          .minus(new BigNumber(decimalCheck1))
          .toNumber();
        if (!checkDiff) {
          // console.log("here7878",decimalCheck2- decimalCheck1)
          let tempOldCoinPerc12 = Math.floor(+tempVar[index].exactCoinPerc);
          let requiredDecimals = new BigNumber(tempVar[index].exactCoinPerc)
            .minus(new BigNumber(tempOldCoinPerc12))
            .toNumber();
          // console.log("here7878",tempVar[index].exactCoinPerc, tempOldCoinPerc12)
          // console.log("tim9090",requiredDecimals,tempNewCoinPerc2)
          value = new BigNumber(tempNewCoinPerc2)
            .plus(new BigNumber(requiredDecimals))
            .toNumber();
        }
        //  if( parseFloat(tempVar[index].exactCoinPerc) >= +value){
        tempVar[index].coinValue = new BigNumber(value)
          .multipliedBy(new BigNumber(props.serverResponse.totalBal))
          .dividedBy(new BigNumber(100))
          .toNumber();
        //  }
        //  else{
        //   tempVar[index].coinValue = ((value * parseFloat(props.serverResponse.totalBal)/100))
        //  }
        tempVar[index].coinPerc = value;
        setChangedToken(value);
        //  console.log("tempVar",tempVar,value,index,((((value / parseFloat(props.serverResponse.totalBal)) *100))) )
      } else {
        // if( parseFloat(tempVar[index].coinValue) >= value){
        tempVar[index].coinPerc = new BigNumber(value)
          .dividedBy(new BigNumber(props.serverResponse.totalBal))
          .multipliedBy(new BigNumber(100))
          .toNumber();
        //  }
        //  else{
        //   tempVar[index].coinPerc = ((value / parseFloat(props.serverResponse.totalBal)) *100)
        //  }
        tempVar[index].coinValue = value;
        setChangedToken(value);
        // console.log("tempVar",tempVar,value,index,((((value / parseFloat(props.serverResponse.totalBal)) *100))) )
      }
      sumPerc(tempVar, true);
      //  console.log("t321",tempVar)
      setTempTokenList(tempVar);
    } catch (error) {
      console.log("error", error, error.message);
      setError(error.message);
    }
  };

  //function to set percentage of adding tokens
  const setCoinPerc = (value) => {
    // console.log("percValue",value)
    let actualValue;
    //condition to see if given value is null
    if (value) {
      let lastOne = value.toString().slice(-1);
      if (lastOne === "%") {
        actualValue = lastOne.slice(0, value.length - 1);
      } else {
        actualValue = value;
      }
      // console.log("actualValue",actualValue)
      setaddCoinPerc(actualValue);
    } else {
      setaddCoinPerc(0);
    }
  };

  //function to change edit vault mode to walallet mode
  const restToWalletMode = () => {
    setEditVaultMode(false);
    selectAddCoin([]);
  };

  return (
    <>
      {/* {console.log("propsCreds", props)} */}
      {props.error || error ? (
        <ErrorComponent
          setError={setError}
          error={error ? error : props.error}
        />
      ) : null}
      {props.loader || isLoading ? (
        <Loader />
      ) : //allSelected={allSelected}
      props.isWalletConnected ? (
        <>
          <div className="section my-vault-wc">
            {/* {isAuthenticated && <button className="btn btn-primary btn-sm section1-button" onClick={disconnectWallet}>disconnect</button>} */}

            {editVaultMode ? (
              <>
                {/* hidden edit tokens section  */}

                <section className="edit-vault-section">
                  <div className="container">
                    <div className="section-top-heading-naviagte editvault-mobile">
                      <button
                        className="navigate-btn"
                        onClick={restToWalletMode}
                      >
                        <MdArrowBackIosNew className="naviagte-arrow-icon" />
                      </button>
                      <div className="section-heading">
                        <h3 className="section-title">edit vault</h3>
                      </div>
                    </div>

                    {/* {showSuccessModal &&
                      changedCoins.increasedCoins.length ? (
                        <TxSuccessModal
                          changedCoins={changedCoins}
                          showSuccessModal={showSuccessModal}
                          setShowSuccessModal={setShowSuccessModal}
                          setEditVaultMode={setEditVaultMode}
                        />
                      ) : null} */}

                    {/* <div className="alphavault-sec-box p-4">
                        <div className="input-group edit-vault-input-grp">
                          <input
                            type="text"
                            className="form-control edit-vault-input"
                            placeholder="0&nbsp;&nbsp;%"
                            aria-label="Recipient's username"
                            aria-describedby="button-addon2"
                            ref={percIpRef}
                            onChange={(e) => setCoinPerc(e.target.value)}
                          />

                          {addCoin.length ? (
                            <button
                              className="btn btn-light edit-vault-btn "
                              type="button"
                              id="button-addon2"
                              onClick={() => setTokenAddModeSection(true)}
                            >
                              {addCoin.map((token, i) => {
                                if (i < 5) {
                                  return (
                                    <img
                                      className="me-1 edit-vault-input-img"
                                      src={token.coinLogoUrl}
                                      alt=""
                                    />
                                  );
                                }
                              })}
                              {addCoin.length > 5 ? "..." : null}
                              <MdArrowForwardIos className="edit-vault-icon" />
                            </button>
                          ) : (
                            <>
                              <button
                                className="btn btn-light edit-vault-btn edit-vault-not-active-button mobile-stake-btnhide"
                                type="button"
                                id="button-addon2"
                                onClick={() => setTokenAddModeSection(true)}
                              >
                                Select Token
                                <MdArrowForwardIos className="edit-vault-icon ms-2" />
                              </button>

                              <TokenAddComponentMobile
                                setEditVaultMode={setEditVaultMode}
                                setTokenAddModeSection={setTokenAddModeSection}
                                selectAddCoin={selectAddCoin}
                                setCoinList={setCoinList}
                                addCoin={addCoin}
                                tokenList={tokenList}
                                selectedTokens={selectedTokens}
                                setSelectedTokens={setSelectedTokens}
                                setSelectAllSelector={setSelectAllSelector}
                                isAllSelectedActive={isAllSelectedActive}
                                setAllSelectedActive={setAllSelectedActive}
                                selectAllSelector={selectAllSelector}
                                removed={removed}
                                setRemoved={setRemoved}
                                formatCoins={formatCoins}
                              />
                            </>
                          )}
                        </div>
                        <div className="section-btn text-center mt-4 mt-sm-5">
                          <button
                            type="button"
                            className="btn btn-light section-button"
                            disabled={addCoin.length ? false : true}
                            onClick={formatCoins}
                          >
                            add coins
                          </button>
                        </div>
                      </div> */}
                  </div>
                </section>
              </>
            ) : (
              <>
                <div className="container">
                  <HomeWalletInfo />
                  <div className="section-heading">
                    <h3 className="section-title mb-4">my wallet</h3>
                  </div>
                  <div className="alphavault-sec-box my-vault-wc-box">
                    <h6 className="alphavault-box-title mb-3">
                      current wallet balance
                    </h6>
                    {props.serverResponse ? (
                      <>
                        <h1>
                          <span className="tile me-1 wallet-tile">∼</span>$
                          {props.serverResponse.totalBal.toFixed(5)}
                        </h1>
                        <MyWalletTokens />
                      </>
                    ) : (
                      <></>
                    )}
                    {/* <div className="section-btn text-center mt-4 mt-sm-5">
                        <NavLink
                          to="/payTmentOptions"
                          className="payment-option-link"
                        >
                          <button
                            type="button"
                            className="btn btn-light section-button"
                          >
                            {" "}
                            add funds{" "}
                          </button>
                        </NavLink>
                      </div> */}
                  </div>
                </div>
              </>
            )}
            {editVaultMode ? (
              <div className="container edit-vault-header-container">
                {/* <div className="edit-vault-button-container">
                  <button>Same Chain</button>
                  <button>Cross Chain</button>
                </div> */}
                {/* chainging chain buttons */}
                <Tabs
                  defaultActiveKey="profile"
                  id="uncontrolled-tab-example"
                  activeKey={chainKey}
                  onSelect={(k) => setChainKey(k)}
                  className="tabs"
                >
                  <Tab eventKey="sameChain" title="Same Chain"></Tab>
                  <Tab eventKey="crossChain" title="Cross Chain"></Tab>
                </Tabs>
                <h5 className="alphavault-sub-title home-sections-box edit-wallet-balance-info">
                  Wallet Balance: <span className="ms-1">~</span>
                  <span className="ms-1">
                    {props.serverResponse ? (
                      <span>${props.serverResponse.totalBal.toFixed(2)}</span>
                    ) : (
                      <></>
                    )}
                  </span>
                </h5>
                {/* <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",}}>
                 <div>
                 {addCoin.length ? (
                            <button
                              className="btn btn-light  "
                              type="button"
                              id="button-addon2"
                              onClick={() => setTokenAddModeSection(true)}
                            >
                              {addCoin.map((token, i) => {
                                if (i < 5) {
                                  return (
                                    <img
                                      className="me-1 edit-vault-input-img"
                                      src={token.coinLogoUrl}
                                      alt=""
                                    />
                                  );
                                }
                              })}
                              {addCoin.length > 5 ? "..." : null}
                              <MdArrowForwardIos className="edit-vault-icon" />
                            </button>
                          ) : (
                            <>
                              <button
                                className="btn btn-light  edit-vault-not-active-button mobile-stake-btnhide"
                                type="button"
                                id="button-addon2"
                                onClick={() => setTokenAddModeSection(true)}
                              >
                                Select Token
                                <MdArrowForwardIos className="edit-vault-icon ms-2" />
                              </button>

                              <TokenAddComponentMobile
                               setEditVaultMode={setEditVaultMode}
                               setTokenAddModeSection={setTokenAddModeSection}
                               selectAddCoin={selectAddCoin}
                               setCoinList={setCoinList}
                               addCoin={addCoin}
                               tokenList={tokenList}
                               selectedTokens={selectedTokens}
                               setSelectedTokens={setSelectedTokens}
                               setSelectAllSelector={setSelectAllSelector}
                               isAllSelectedActive={isAllSelectedActive}
                               setAllSelectedActive={setAllSelectedActive}
                               selectAllSelector={selectAllSelector}
                               removed={removed}
                               setRemoved={setRemoved}
                               formatCoins={formatCoins}
                              />
                            </>
                          )}
                 </div>
                           <div className="section-btn text-center  mt-sm-5">
                          <button
                            type="button"
                            className="btn btn-light"
                            disabled={addCoin.length ? false : true}
                            onClick={formatCoins}
                            style={{backgroundColor:"purple" ,color:"white" ,marginBottom:"10px"}}
                          >
                            add coins
                          </button>
                        </div>
                 </div> */}
              </div>
            ) : (
              <>
                {/* <ReserveComponent /> */}
                {/* <WethExchange  network={props.chain} web3Instance={props.web3InStance} walletAddress={props.walletAddress}/> */}
                {/* <div className="container">
                    <h5 className="alphavault-sub-title home-sections-box wallet-tokens-left">
                      Wallet Tokens
                    </h5>
                  </div> */}
              </>
            )}

            {/* {
              console.log(editVaultMode,addCoin)
             } */}
            {
              !props.loader ? (
                !editVaultMode ? (
                  <></>
                ) : // <MyWalletTokens />
                (tokenList?.length && tempTokenList?.length) || editLength ? (
                  //condition for showing same chain editor
                  chainKey == "sameChain" ? (
                    <EditVault
                      tokenList={tokenList}
                      changedToken={changedToken}
                      tempTokenList={tempTokenList}
                      changeperc={changeperc}
                      sum={sum}
                      setTokenList={setTokenList}
                      setTempTokenList={setTempTokenList}
                      elementRemoved={elementRemoved}
                      setElementRemoved={setElementRemoved}
                      sumPerc={sumPerc}
                      addCoin={addCoin}
                      editLength={editLength}
                      setEditLength={setEditLength}
                      setLoading={setLoading}
                      setTokenAddModeSection={setTokenAddModeSection}
                      setEditVaultMode={setEditVaultMode}
                      selectAddCoin={selectAddCoin}
                      setCoinList={setCoinList}
                      selectedTokens={selectedTokens}
                      setSelectedTokens={setSelectedTokens}
                      setSelectAllSelector={setSelectAllSelector}
                      isAllSelectedActive={isAllSelectedActive}
                      setAllSelectedActive={setAllSelectedActive}
                      selectAllSelector={selectAllSelector}
                      removed={removed}
                      setRemoved={setRemoved}
                      formatCoins={formatCoins}
                      percIpRef={percIpRef}
                      setCoinPerc={setCoinPerc}
                      addCoinPerc={addCoinPerc}
                      tokenAddMode={tokenAddMode}
                    />
                  ) : (
                    // rendering cross chain editor
                    <Widget />
                  )
                ) : (
                  //condtion for showing multi chain editor

                  <></>
                )
              ) : (
                <></>
              )
              // <EditVault tokenList={tokenList} tempTokenList={tempTokenList} changeperc={changeperc} sum={sum}/>              :
              //   <></>
            }
            {editVaultMode ? (
              <div className="container">
                {chainKey === "sameChain" ? (
                  <div className="section-btn text-center mb-5 mt-3 px-sm-0 px-4">
                    <button
                      type="button"
                      className="btn btn-light section-button"
                      disabled={
                        props.serverResponse?.totalBal === 0 ? true : false
                      }
                      onClick={() => checkPerc()}
                    >
                      CONFIRM
                    </button>
                    {props.serverResponse?.totalBal === 0 && (
                      <p className="mt-2 text-danger text-center edit-v-msg">
                        Due to insufficient Wallet Balance,you can't able to
                        swap using edit vault.{" "}
                      </p>
                    )}

                    {showSuccessModal ? (
                      <TxSuccessModal
                        changedCoins={changedCoins}
                        showSuccessModal={showSuccessModal}
                        setShowSuccessModal={setShowSuccessModal}
                        setEditVaultMode={setEditVaultMode}
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="container">
                <div className="section-btn text-center mt-3 edit-vault-button">
                  {/* // <NavLink to="buysellvaults/"> */}
                  <button
                    type="button"
                    className="btn btn-light section-button"
                    onClick={editVault}
                  >
                    edit
                  </button>
                  {/* </NavLink> */}
                </div>
              </div>
            )}

            {editVaultMode ? null : (
              <a
                href={"https://etherscan.io/address/" + props.walletAddress}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className=" my-vault-wc-tranaction-hstry mt-3 wallet-tokens-left">
                  {" "}
                  Transaction History &nbsp;
                  <IoArrowRedoSharp className="curve-arrow" />
                </div>
              </a>
            )}
          </div>
          {/* </div> */}
        </>
      ) : (
        <>
          {/* {
          policyConfirmation1 == false ||
          policyConfirmation2 == false ||
          !showWalletOption ?  */}
          (
          <section className="section wallet-connect">
            <div className="container">
              <div className="wallet-connect-wrp">
                {/* <div className="wallet-connect-img ">
                    <img src={artwork} alt="" />
                  </div> */}

                {/* Wallet Connect Options Start */}

                <div className="option-connect-wallet-btm-sec pt-xl-0 pt-5">
                  <button
                    className="option-connect-box"
                    onClick={connectMetamask}
                  >
                    <div className="option-connect-box-img">
                      <img src={fox} alt="" />
                    </div>

                    <button className="btn option-connect-box-btn">
                      Metamask
                    </button>
                  </button>
                  <button
                    className="option-connect-box"
                    onClick={connectWalletConnect}
                  >
                    <div className="option-connect-box-img mt-2 mb-2 mb-sm-3">
                      <img src={walletconnect} alt="" />
                    </div>

                    <button className="btn option-connect-box-btn">
                      wallet connect
                    </button>
                  </button>
                </div>

                {/* Wallet Connect Options End */}

                <div className="wallet-connect-text mt-4 mb-5">
                  <h3 className="wallet-title ">Connect Your Wallet</h3>
                  <p className="wallet-p">
                    Connect your wallet to start investing
                  </p>
                </div>

                {/* <div className="section-btn">
                    <button
                      type="button"
                      className="btn btn-light section-button connect-wallet-mobilev-btn"
                      onClick={() => openModel()}
                    >
                      connect
                    </button>
                  </div> */}
              </div>
            </div>
          </section>
          )
          {/* : (
            <>
              <section className="section option-connect-wallet">
                <div className="container">
                  <div className="option-connect-wallet-top-sec mb-4 ms-4">
                    <button
                      className="navigate-btn option-connect-wallet-nbtn"
                      onClick={resetConfirmations}
                    >
                      <MdArrowBackIosNew className="naviagte-arrow-icon me-5" />
                    </button>

                    <div className="section-heading naviagte-hidden">
                      <h3 className="section-title">connect wallet</h3>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )} */}
        </>
      )}

      {show ? (
        <PermissionModal
          show={show}
          handleConfirm={handleConfirm}
          handleClose={handleClose}
          policyConfirmation1={policyConfirmation1}
          policyConfirmation2={policyConfirmation2}
          setConfirmations1={setConfirmations1}
          setConfirmations2={setConfirmations2}
        />
      ) : (
        <></>
      )}

      {tokenAddMode && (
        <TokenAddComponent
          setEditVaultMode={setEditVaultMode}
          setTokenAddModeSection={setTokenAddModeSection}
          selectAddCoin={selectAddCoin}
          setCoinList={setCoinList}
          addCoin={addCoin}
          tokenList={tokenList}
          selectedTokens={selectedTokens}
          setSelectedTokens={setSelectedTokens}
          setSelectAllSelector={setSelectAllSelector}
          isAllSelectedActive={isAllSelectedActive}
          setAllSelectedActive={setAllSelectedActive}
          selectAllSelector={selectAllSelector}
          removed={removed}
          setRemoved={setRemoved}
          tempTokenList={tempTokenList}
          formatCoins={formatCoins}
          percIpRef={percIpRef}
          sumPerc={sumPerc}
          setTempTokenList={setTempTokenList}
          setCoinPerc={setCoinPerc}
          addCoinPerc={addCoinPerc}
          setTokenList={setTokenList}
          tokenAddMode={tokenAddMode}
        />
      )}
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    walletAddress: state.wallet.walletAddress,
    chain: state.wallet.chain,
    isWalletConnected: state.wallet.isWalletConnected,
    isPolicyAccepted: state.wallet.isPolicyAccepted,
    assets: state.wallet.assets,
    loader: state.wallet.loader,
    serverResponse: state.wallet.serverResponse,
    web3InStance: state.wallet.web3InStance,
    error: state.wallet.error,
  };
};

const mapStateToDispatch = (dispatch) => {
  return {
    initWallet: (walletInfo) => dispatch(initWallet(walletInfo)),
    fetchWalletResponse: (reqBody) => dispatch(fetchWalletResponse(reqBody)),
    changeChainId: (newChainId) => dispatch(changeChainId(newChainId)),
    setActiveWallet: (walletConnector) =>
      dispatch(setActiveWallet(walletConnector)),
    resetWallet: () => dispatch(resetWallet()),
  };
};

export default connect(mapStateToProps, mapStateToDispatch)(ConnectWallet);
