const DappToken = artifacts.require('DappToken')
const DaiToken = artifacts.require('DaiToken')
const ThaiFarm = artifacts.require('ThaiFarm')

require('chai').use(require('chai-as-promised')).should()

function token(n) {
  return web3.utils.toWei(n, 'Ether')
}

contract('ThaiFarm', ([owner, investor]) => {
  let daiToken, dappToken, thaiFarm

  before(async () => {
    // Load contracts
    daiToken = await DaiToken.new()
    dappToken = await DappToken.new()
    thaiFarm = await ThaiFarm.new(dappToken.address, daiToken.address)

    // Transfer all Dapp tokens to farm (1 milion)
    await dappToken.transfer(thaiFarm.address, token('1000000'))

    // Transfer 100 mock DAI token to investor
    await daiToken.transfer(investor, token('100'), { from: owner })
  })

  describe('Mock Dai deployment', async () => {
    it('has a name', async () => {
      const name = await daiToken.name()
      assert.equal(name, 'Mock DAI Token')
    })
  })

  describe('Dapp Token deployment', async () => {
    it('has a name', async () => {
      const name = await dappToken.name()
      assert.equal(name, 'DApp Token')
    })
  })

  describe('Thai Farm deployment', async () => {
    it('has a name', async () => {
      const name = await thaiFarm.name()
      assert.equal(name, 'Thai Token Farm')
    })

    it('contract has tokens', async () => {
      let balance = await dappToken.balanceOf(thaiFarm.address)
      assert.equal(balance.toString(), token('1000000'))
    })
  })

  describe('Farming tokens', async () => {
    it('rewards investors for staking mDai tokens', async () => {
      let result
      // Check investor balance before staking
      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), token('100'), 'investor Mock Dai wallet balance correct before staking')
      
      // Stake Mock DAI Tokens
      await daiToken.approve(thaiFarm.address, token('100'), { from: investor })
      await thaiFarm.stakeTokens(token('100'), { from: investor })

      // Check staking result
      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), token('0'), 'investor Mock Dai wallet balance correct after staking')
      
      result = await daiToken.balanceOf(thaiFarm.address)
      assert.equal(result.toString(), token('100'), 'Thai Farm Mock Dai wallet balance correct after staking')

      result = await thaiFarm.stakingBalance(investor)
      assert.equal(result.toString(), token('100'), 'investor staking balance correct after staking')

      result = await thaiFarm.isStaking(investor)
      assert.equal(result.toString(), 'true', 'investo isStaking correct after staking')
    
      // Issue Tokens
      result = await thaiFarm.issueToken({ from: owner })

      // Check balance after issuance
      result = await dappToken.balanceOf(investor);
      assert.equal(result.toString(), token('100'), "investor Dapp Token wallet balance correct after issuance")

      // Ensure that only owner can issue tokens
      await thaiFarm.issueToken({ from: investor }).should.be.rejected;

      
      // Unstake token
      await thaiFarm.unstakeToken({ from: investor })

      // Check results after unstaking
      result = await daiToken.balanceOf(investor);
      assert.equal(result.toString(), token('100'), 'investor Mock DAI wallet balance correct after unstaking');

      result = await daiToken.balanceOf(thaiFarm.address);
      assert.equal(result.toString(), token('0'), 'Thai Farm Token Mock DAI wallet balance correct after unstaking');

      result = await thaiFarm.stakingBalance(investor);
      assert.equal(result.toString(), 0, 'investor Mock DAI is no longer has stakingBalance after unstaking');

      result = await thaiFarm.isStaking(investor);
      assert.equal(result.toString(), 'false', 'investor Mock DAI is no longer isStaking after unstaking');
    })

  })

})
