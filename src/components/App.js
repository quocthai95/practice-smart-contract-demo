import React, { Component } from 'react'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import ThaiFarm from '../abis/ThaiFarm.json'
import Navbar from './Navbar'
import './App.css'
import Web3 from 'web3'
import Main from './Main'

class App extends Component {
  async componentDidMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!',
      )
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    // Load DAI token
    const networkId = await web3.eth.net.getId()
    const daiTokenData = DaiToken.networks[networkId]
    if (daiTokenData) {
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      let daiTokenBalance = await daiToken.methods
        .balanceOf(this.state.account)
        .call()
      this.setState({ daiToken, daiTokenBalance: daiTokenBalance.toString() })
    } else {
      window.alert('DaiToken contract not deployed to detected network')
    }

    // Load dappToken
    const dappTokenData = DappToken.networks[networkId]
    if (dappTokenData) {
      const dappToken = new web3.eth.Contract(
        DappToken.abi,
        dappTokenData.address,
      )
      let dappTokenBalance = await dappToken.methods
        .balanceOf(this.state.account)
        .call()
      this.setState({
        dappToken,
        dappTokenBalance: dappTokenBalance.toString(),
      })
    } else {
      window.alert('DappToken contract not deployed to detected network')
    }

    // Load dappToken
    const thaiFarmData = ThaiFarm.networks[networkId]
    if (thaiFarmData) {
      const thaiFarm = new web3.eth.Contract(ThaiFarm.abi, thaiFarmData.address)
      let stakingBalance = await thaiFarm.methods
        .stakingBalance(this.state.account)
        .call()
      this.setState({ thaiFarm, stakingBalance: stakingBalance.toString() })
    } else {
      window.alert('DappToken contract not deployed to detected network')
    }

    this.setState({ loading: false })
  }

  stakeToken = (amount) => {
    this.setState({ loading: true })
    this.state.daiToken.methods
      .approve(this.state.thaiFarm._address, amount)
      .send({ from: this.state.account })
      .on('transactionHash', (hash) => {
        this.state.thaiFarm.methods
          .stakeTokens(amount)
          .send({ from: this.state.account })
          .on('transactionHash', (hash) => {
            this.setState({ loading: false })
          })
      })
  }

  unstakeToken = () => {
    this.setState({ loading: true })
    this.state.thaiFarm.methods
      .unstakeToken()
      .send({ from: this.state.account })
      .on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},
      dappToken: {},
      thaiFarm: {},
      daiTokenBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      loading: true,
    }
  }

  render() {
    let content
    if (this.state.loading) {
      content = (
        <p id="loader" className="text-center">
          Loading...
        </p>
      )
    } else {
      content = (
        <Main
          daiTokenBalance={this.state.daiTokenBalance}
          dappTokenBalance={this.state.dappTokenBalance}
          stakingBalance={this.state.stakingBalance}
          stakeToken={this.stakeToken}
          unstakeToken={this.unstakeToken}
        />
      )
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto"
              style={{ maxWidth: '600px' }}
            >
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                ></a>
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }
}

export default App
