// @ts-check
//  remember to run: `npm run rnode-generate`
import * as R from 'ramda';
import { ec } from 'elliptic';
import * as protoLoader from '@grpc/proto-loader';
import * as grpcLibrary from 'grpc';
// import { addressCtrl } from '../web/controls/address-ctrl.js';
import {
  rnodeDeploy, signDeploy, getAddrFromPrivateKey, // rnodePropose,  getAddrFromPublicKey, getAddrFromEth,
  verifyRevAddr, // rhoParToJson, verifyDeploy  newRevAddress, 
} from '@tgrospic/rnode-grpc-js';

//const { rnodeDeploy, rnodePropose, signDeploy, verifyDeploy, rhoParToJson } = require('@tgrospic/rnode-grpc-js')
//import  { rnodeExample } from '../nodejs/client.js';

import * as protoSchema from '../../rnode-grpc-gen/js/pbjs_generated.json';
//import { encodeBase16, decodeBase16 } from '../lib.js';
//import { verifyDeployEth, recoverPublicKeyEth } from '../eth/eth-sign.js';
// import { ethDetected, ethereumAddress, ethereumSign, } from '../eth/eth-wrapper.js';
// import { signDeploy, verifyDeploy, deployDataProtobufSerialize, } from '../rnode-sign'; */
import * as grpc from '@grpc/grpc-js';

const main = (args: string[]) => {
  //console.log(args);
  //console.log(args.length);
  const privKey = args.slice(2)[0];
  if (args.length < 3 || !privKey) {
    console.warn(`usage: ${args[0]}: must include private key`)
    console.warn(privKey);
    process.exit(1);
  }

  //const packageDefinition = protoLoader.loadSync(
    //{}
  // );
  //const packageObject = grpcLibrary.loadPackageDefinition(packageDefinition);
  //console.warn('reading grpc Protobuf definitions...');
  // console.dir(packageObject);
  const val = privKey.replace(/^0x/, '').trim()
  const keys = {
    privateKey: val,
    fromPriv_account: getAddrFromPrivateKey(val),
    //fromPub:  getAddrFromPublicKey(val),
    //fromEth:  getAddrFromEth(val),
    isRev: verifyRevAddr(val)
  };
  console.dir(keys);
  // rnodeExample();

  const rnodeInternalUrl = 'localhost:40402'
  const options = host => ({ grpcLib: grpc, host, protoSchema })
  const deployObj = rnodeDeploy(options(rnodeInternalUrl));
  const {
    getBlocks,
    lastFinalizedBlock,
    visualizeDag,
    deployStatus,
    doDeploy,
    listenForDataAtName,
  } = deployObj;

  console.dir(deployObj);
  grpcSignDeploy(keys, lastFinalizedBlock);
};

const grpcSignDeploy = async (keys, lastFinalizedBlock) => {
  const lastBlockObj = await lastFinalizedBlock()
  const sampleRholangCode = `
    new return(\`rho:rchain:deployId\`), out(\`rho:io:stdout\`), x in {
    out!("Nodejs deploy test") |

    // Return value from Rholang
    return!(("Return value from deploy", [1], true, Set(42), {"my_key": "My value"}, *x))
    }
  `
  console.log('LAST BLOCK', lastBlockObj)
  const deployData = {
    term: sampleRholangCode,
    timestamp: Date.now(),
    phloprice: 1,
    phlolimit: 10e3,
    validafterblocknumber: lastBlockObj.blockinfo?.blockinfo.blocknumber || 0,
    shardid: 'root',
  }
  console.dir(signDeploy(keys.privateKey, deployData));
}

main(process.argv);

process.exit(0);
