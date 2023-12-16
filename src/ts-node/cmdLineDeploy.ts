// @ts-check
//  remember to run: `npm run rnode-generate`
import {
  rnodeDeploy, signDeploy, getAddrFromPrivateKey, // rnodePropose,  getAddrFromPublicKey, getAddrFromEth,
  verifyRevAddr, // rhoParToJson, verifyDeploy  newRevAddress, 
} from '@tgrospic/rnode-grpc-js';

import * as protoSchema from '../../rnode-grpc-gen/js/pbjs_generated.json';
import * as grpc from '@grpc/grpc-js';

const main = (args: string[]) => {
  const privKey = args.slice(3)[0];
  const usage = () => {
    console.warn(`usage: ${args[0]} <--grpc | -http> <private key>: must include private key argument`)
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
  console.dir(keys);

  const rnodeInternalUrl = 'localhost:40402';
  const options = (obj) => ({ grpcLib: grpc, clientOptions: '', host: rnodeInternalUrl, protoSchema })[obj];
  const deployObj = rnodeDeploy(options(rnodeInternalUrl));
                                                                                                                                                                                                                                                                                                                                                                                                        
  const {
    getBlocks,
    lastFinalizedBlock,
    visualizeDag,
    deployStatus,
    doDeploy,
    listenForDataAtName,
  } = deployObj;

  const flag = args.slice(2)[0];
  switch (flag) {
    case '--http':
      httpSignDeploy(keys, lastFinalizedBlock);
      break;
    case '-grpc':
      grpcSignDeploy(keys, lastFinalizedBlock);
      break;
    default:
      usage();
      break;
    }
};

const httpSignDeploy = async (keys, lastFinalizedBlock) => {
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
