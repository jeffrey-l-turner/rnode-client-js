// @ts-check
//  remember to run: `npm run rnode-generate`
import {
  rnodeDeploy, signDeploy, getAddrFromPrivateKey, // rnodePropose,  getAddrFromPublicKey, getAddrFromEth,
  verifyRevAddr, // rhoParToJson, verifyDeploy  newRevAddress, 
} from '@tgrospic/rnode-grpc-js';

import * as protoSchema from '../../rnode-grpc-gen/js/pbjs_generated.json';
import * as grpc from '@grpc/grpc-js';
import * as rnodeSign from '../rnode-sign.js';
import { toWebDeploy } from '../rnode-web.js';

const main = (args: string[]) => {
  const privKey = args.slice(3)[0];
  const usage = () => {
    console.warn(`usage: ${args[0]} <--grpc | --http> <private key>: must include private key argument`)
    console.warn(privKey);
    process.exit(1);
  };
  if (!privKey) {
    usage();
  }
  const val = privKey.replace(/^0x/, '').trim()
  const keys = {
    privateKey: val,
    fromPriv_account: getAddrFromPrivateKey(val),
    isRev: verifyRevAddr(val)
  };
  console.warn('keys:');
  console.dir(keys);
  console.warn('------------------------------------------------');

  const rnodeInternalUrl = 'localhost:40401';
  // ToDo: this is updated from Grospic's but still does not look right
  const options = host => ({ grpcLib: grpc, clientOptions: '', host: host, protoSchema });
  
const deployObj = rnodeDeploy(options(rnodeInternalUrl));

  const flag = args.slice(2)[0];
  switch (flag) {
    case '--http':
      const signedDeploy = httpSignDeploy(keys.privateKey, deployObj);
      // console.warn('signedDeploy:');
      // console.dir(signedDeploy);
      signedDeploy.term = 'some term';
      signedDeploy.timestamp = Date.now();
      signedDeploy.phloPrice = '500';
      signedDeploy.phloLimit = '1000';
      signedDeploy.shardId = 'root';
      signedDeploy. validAfterBlockNumber  =0;
      signedDeploy.language = '';
      const httpResult = toWebDeploy(signedDeploy);
      console.dir(httpResult);
      break;
    case '--grpc':
      const { lastFinalizedBlock, } = deployObj;
      const grpcResult = grpcSignDeploy(keys, lastFinalizedBlock);
      console.dir(grpcResult);
      break;
    default:
      usage();
      break;
    }
};

const httpSignDeploy = (privateKey, deployObj) => rnodeSign.signDeploy(privateKey, deployObj);
  // console.log('inside grpcSignDeploy...');
  // let lastBlockObj = { blockinfo: { blockinfo: { blocknumber: 0 } } };
  // try {
  //   lastBlockObj = (await lastFinalizedBlock());
  // } catch (err) {
  //   console.warn(`could not call lastFinalizedBlock(): ${err}`);
  //   process.exit(1);
  // }
  // console.log('lastBlockObj:');
  // console.dir(lastBlockObj);

  // const sampleRholangCode = `
  //   new return(\`rho:rchain:deployId\`), out(\`rho:io:stdout\`), x in {
  //   out!("Nodejs deploy test") |

  //   // Return value from Rholang
  //   return!(("Return value from deploy", [1], true, Set(42), {"my_key": "My value"}, *x))
  //   }
  // `
  // console.log('LAST BLOCK', lastBlockObj)
  // const deployData = {
  //   term: sampleRholangCode,
  //   timestamp: Date.now(),
  //   phloprice: 1,
  //   phlolimit: 10e3,
  //   validafterblocknumber: lastBlockObj.blockinfo?.blockinfo.blocknumber || 0,
  //   shardid: 'root',
  // }
  // const result = signDeploy(keys.privateKey, deployData);
  // console.log(result);
//}
const grpcSignDeploy = async (keys, lastFinalizedBlock) => {
  console.log('inside grpcSignDeploy...');
  let lastBlockObj = { blockinfo: { blockinfo: { blocknumber: 0 } } };
  try {
    lastBlockObj = (await lastFinalizedBlock());
  } catch (err) {
    console.warn(`could not call lastFinalizedBlock(): ${err}`);
    process.exit(1);
  }
  console.log('lastBlockObj:');
  console.dir(lastBlockObj);

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
  const result = signDeploy(keys.privateKey, deployData);
  console.log(result);
}

 main(process.argv);
