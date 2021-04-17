const DappToken = artifacts.require('DappToken')
const DaiToken = artifacts.require('DaiToken')
const ThaiFarm = artifacts.require('ThaiFarm')

module.exports = async function (deployer, network, accounts) {
  // Deploy mock DAI token
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()

  // Deploy Dapp token
  await deployer.deploy(DappToken)
  const dappToken = await DappToken.deployed()

  // Deploy ThaiFarm
  await deployer.deploy(ThaiFarm, dappToken.address, daiToken.address)
  const thaiFarm = await ThaiFarm.deployed()

  // Transfer all tokens to ThaiFarm (1 milion)
  await dappToken.transfer(thaiFarm.address, '1000000000000000000000000')

  // Transfer 100 mock DAI token to investor
  await daiToken.transfer(accounts[1], '100000000000000000000')
}
