// @ts-check
const localhost = process.env.local;
const defaultPorts    = { grpc: 40401, http: 40403, httpAdmin: 40405 }
const defaultPortsSSL = { grpc: 40401, https: 443, httpAdmin: 40405 }

// Shard IDs
const defaultShardId = 'root'
const testNetShardId = 'testnet6'
const mainNetShardId = '' // not used until HF2

// Token name
const tokenName = 'REV'
// Number of decimal places for token display (balance, phlo limit, labels)
const defautTokenDecimal = 8

// Local network

export const localNet = {
  title: 'Local network',
  name: 'localnet',
  tokenName,
  tokenDecimal: defautTokenDecimal,
  hosts: [
    { domain: 'localhost', shardId: defaultShardId, ...defaultPorts },
    { domain: 'localhost', shardId: defaultShardId, grpc: 40411, http: 40413, httpAdmin: 40415 },
    { domain: 'localhost', shardId: defaultShardId, grpc: 40421, http: 40423, httpAdmin: 40425 },
    { domain: 'localhost', shardId: defaultShardId, grpc: 40431, http: 40433, httpAdmin: 40435 },
    { domain: 'localhost', shardId: defaultShardId, grpc: 40441, http: 40443, httpAdmin: 40445 },
    { domain: 'localhost', shardId: defaultShardId, grpc: 40451, http: 40453, httpAdmin: 40455 },
  ],
  readOnlys: [
    { domain: 'localhost', shardId: defaultShardId, ...defaultPorts },
    { domain: 'localhost', shardId: defaultShardId, grpc: 40411, http: 40413, httpAdmin: 40415 },
    { domain: 'localhost', shardId: defaultShardId, grpc: 40421, http: 40423, httpAdmin: 40425 },
    { domain: 'localhost', shardId: defaultShardId, grpc: 40431, http: 40433, httpAdmin: 40435 },
    { domain: 'localhost', shardId: defaultShardId, grpc: 40441, http: 40443, httpAdmin: 40445 },
    { domain: 'localhost', shardId: defaultShardId, grpc: 40451, http: 40453, httpAdmin: 40455 },
  ]
}

// Test network

const range = n => [...Array(n).keys()]

const getTestNetUrls = n => {
  const instance = `node${n}`;
  return {
    domain: localhost ? `127.0.0.1-${n}` : `${instance}.testnet.rchain.coop`,
    instance,
    shardId: testNetShardId,
    ...defaultPortsSSL,
  }
}

const testnetHosts = range(5).map(getTestNetUrls)

export const testNet = {
  title: 'RChain testing network',
  name: 'testnet',
  tokenName,
  tokenDecimal: defautTokenDecimal,
  hosts: testnetHosts,
  readOnlys: [
    { domain: 'observer.testnet.rchain.coop', instance: 'observer', shardId: testNetShardId, ...defaultPortsSSL },
  ],
}

// MAIN network

const getMainNetUrls = n => ({
  domain: `node${n}.root-shard.mainnet.rchain.coop`,
  shardId: mainNetShardId,
  ...defaultPortsSSL,
})

const mainnetHosts = range(30).map(getMainNetUrls)

export const mainNet = {
  title: 'RChain MAIN network',
  name: 'mainnet',
  tokenName,
  tokenDecimal: defautTokenDecimal,
  hosts: mainnetHosts,
  readOnlys: [
    // Load balancer (not gRPC) server for us, asia and eu servers
    { domain: 'observer.services.mainnet.rchain.coop', shardId: mainNetShardId, https: 443 },
    { domain: 'observer-us.services.mainnet.rchain.coop', shardId: mainNetShardId, ...defaultPortsSSL },
    { domain: 'observer-asia.services.mainnet.rchain.coop', shardId: mainNetShardId, ...defaultPortsSSL },
    { domain: 'observer-eu.services.mainnet.rchain.coop', shardId: mainNetShardId, ...defaultPortsSSL },
  ],
}

export const getNodeUrls = ({name, tokenName, tokenDecimal, shardId, domain, grpc, http, https, httpAdmin, httpsAdmin, instance}) => {
  const scheme       = !!https ? 'https' : !!http ? 'http' : ''
  const schemeAdmin  = !!httpsAdmin ? 'https' : !!httpAdmin ? 'http' : ''
  const httpUrl      = !!https || !!http ? `${scheme}://${domain}:${https || http}` : void 8
  const httpAdminUrl = !!httpsAdmin || !!httpAdmin ? `${schemeAdmin}://${domain}:${httpsAdmin || httpAdmin}` : void 8
  const grpcUrl      = !!grpc ? `${domain}:${grpc}` : void 8

  return {
    network      : name,
    tokenName,
    tokenDecimal,
    shardId,
    grpcUrl,
    httpUrl,
    httpAdminUrl,
    statusUrl    : `${httpUrl}/api/status`,
    getBlocksUrl : `${httpUrl}/api/blocks`,
    // Testnet only
    logsUrl : instance && `http://${domain}:8181/logs/name:${instance}`,
  }
}
