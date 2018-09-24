import { Response, Request, NextFunction } from 'express';

import Web3 from 'web3';
import rp from 'request-promise';
import * as aesjs from '../../utils/aesjs';
import * as hex from '../../utils/hexString';

const providerList = {
  main: {
    provider: new Web3('https://mainnet.infura.io/odc6wF4Kjd2Iup2Hvepz'),
    api: 'https://api.etherscan.io/api',
  },
  ropsten: {
    provider: new Web3('https://ropsten.infura.io/odc6wF4Kjd2Iup2Hvepz'),
    api: 'https://api-ropsten.etherscan.io/api',
  },
  rinbeky: {
    provider: new Web3('https://rinkeby.infura.io/odc6wF4Kjd2Iup2Hvepz'),
    api: 'http://api-rinkeby.etherscan.io/',
  },
  kovan: {
    provider: new Web3('https://kovan.infura.io/odc6wF4Kjd2Iup2Hvepz'),
    api: 'http://api-kovan.etherscan.io/',
  }
};


const sendTx = (network, callObject: any, contractAddress: any , privateKey: any) => {
  const web3 = providerList[network].provider;
  const account = web3.eth.accounts.privateKeyToAccount(hex.hexStringFull(privateKey));
  const rawTx = {
    from: account.address,
    to: contractAddress,
    gasPrice: web3.utils.toHex((web3.utils as any).toWei('21', 'gwei')),
    gas: '',
    nonce: '',
    data: callObject.encodeABI(),
  };
  return new Promise((done, fail) => {
    web3.eth.getTransactionCount(account.address)
    .then(count => {
      rawTx.nonce = web3.utils.toHex(count);
      return web3.eth.estimateGas(rawTx);
      // @ts-ignore
    }).then(gas => {
      rawTx.gas = web3.utils.toHex(gas);
      return web3.eth.accounts.signTransaction(rawTx, hex.hexStringFull(privateKey));
    }).then((signedData: any) => {
      return web3.eth.sendSignedTransaction(signedData.rawTransaction, (err, txHash) => {
        if (err) {
          fail(err.message);
        } else {
          done(txHash);
        }
      });
    })
    .catch((err: any) => {
      fail(err);
    });
  });
};

export let createAccount = async (req: Request, res: Response) => {
  const web3 = providerList.main.provider;
  try {
    const newAcc = await web3.eth.accounts.create();
    // Convert text to bytes
    const keyHex = aesjs.encryptPK(newAcc.privateKey);
    return res.json({
      code: 200,
      status: 'success',
      data: {
        address: newAcc.address,
        encryptedKey: keyHex
      }
    });
  } catch (error) {
    return res.status(400).json({
      code: 400,
      status: 'error',
      data: {
        message: 'Bad request',
        error: error.message,
      }
    });
  }
};

export let callMethodsContract = async (req: Request, res: Response) => {
  const { params, method, contractAddress } = req.body;
  const parameters = params ? params.split(',') : [];
  let network = '';
  (req.body.network) ? (network = req.body.network) : (network = 'main');
  if (!(network in providerList)) {
    return res.status(400).json({
      code: 400,
      status: 'error',
      data: {
        message: 'Only support network: main, ropsten, rinbeky, kovan.',
      }
    });
  }
  const web3 = providerList[network].provider;
  const getAbi = providerList[network].api + '?module=contract&action=getabi&address=' + contractAddress;
  const options = {
    uri: getAbi,
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true
  };
  let abiResult = await rp(options);
  if (abiResult.status != 0) {
    abiResult = JSON.parse(abiResult.result);
  } else {
    return res.status(400).json({
      code: 400,
      status: 'error',
      data: {
        message: abiResult.message,
        error: abiResult.result,
      }
    });
  }

  // check abiResult have methods
  const methodObject = abiResult.find((obj: any) => { return obj.name === method; });
  if (methodObject) {
    try {
      const newContract = new web3.eth.Contract(abiResult, contractAddress);
      const balance = await newContract.methods[method](...parameters).call();
      return res.json({
        code: 200,
        status: 'success',
        data: balance
      });
    } catch (error) {
      return res.status(400).json({
        code: 400,
        status: 'error',
        data: {
          message: 'Bad request',
          error: error.message,
        }
      });
    }
  } else {
    return res.status(404).json({
      code: 404,
      status: 'error',
      data: {
        message: 'Method ' + method + ' not found in contract',
      }
    });
  }
};

export let sendMethodsContract = async (req: Request, res: Response) => {
  const { params, contractAddress, method } = req.body;
  const parameters = params ? params.split(',') : [];
  const privateKey = aesjs.decryptPK(req.body.encryptedKey);
  let network = '';
  (req.body.network) ? (network = req.body.network) : (network = 'main');
  if (!(network in providerList)) {
    return res.status(400).json({
      code: 400,
      status: 'error',
      data: {
        message: 'Only support network: main, ropsten, rinbeky, kovan.',
      }
    });
  }
  const web3 = providerList[network].provider;

  const getAbi = providerList[network].api + '?module=contract&action=getabi&address=' + contractAddress;
  const options = {
    uri: getAbi,
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true
  };
  let abiResult = await rp(options);
  // check contract verified or not
  if (abiResult.status != 0) {
    abiResult = JSON.parse(abiResult.result);
  } else {
    return res.status(400).json({
      code: 400,
      status: 'error',
      data: {
        message: abiResult.message,
        error: abiResult.result,
      }
    });
  }

  // check abiResult have methods or not
  const methodObject = abiResult.find((obj: any) => { return obj.name === method; });
  if (methodObject) {
    const newContract = new web3.eth.Contract(abiResult, contractAddress);
    try {
      const methodPromise = await newContract.methods[method](...parameters);
      sendTx(network, methodPromise, contractAddress, privateKey)
      .then(result => {
        return res.json({
          code: 200,
          status: 'success',
          data: {
            result
          }
        });
      })
      .catch(err => {
        return res.status(400).json({
          code: 400,
          status: 'error',
          data: {
            message: 'Bad request',
            error: err.message,
          }
        });
      });
    } catch (error) {
      return res.status(400).json({
        code: 400,
        status: 'error',
        data: {
          message: 'Bad request',
          error: error.message,
        }
      });
    }
  } else {
    return res.status(404).json({
      code: 404,
      status: 'error',
      data: {
        message: 'Method ' + method + ' not found in contract',
      }
    });
  }
};
export let getTransaction = async (req: Request, res: Response) => {
  const { transactionHash } = req.body;
  let network = '';
  (req.body.network) ? (network = req.body.network) : (network = 'main');
  if (!(network in providerList)) {
    return res.status(400).json({
      code: 400,
      status: 'error',
      data: {
        message: 'Only support network: main, ropsten, rinbeky, kovan.',
      }
    });
  }
  const web3 = providerList[network].provider;
  const transactionInfo = web3.eth.getTransaction(transactionHash);
  const transactionReceipt = web3.eth.getTransactionReceipt(transactionHash);
  Promise.all([transactionInfo, transactionReceipt])
  .then(([info, receipt]) => {
    return res.json({
      code: 200,
      status: 'success',
      data: Object.assign({}, info, receipt)
    });
  })
  .catch(err => {
    return res.status(400).json({
      code: 400,
      status: 'error',
      data: {
        message: 'Bad request',
        error: err,
      }
    });
  });
};