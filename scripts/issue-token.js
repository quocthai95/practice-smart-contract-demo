const ThaiFarm = artifacts.require('ThaiFarm')

module.exports = async function (callback) {
  let thaiFarm = await ThaiFarm.deployed()
  await thaiFarm.issueToken()
  callback()
}
