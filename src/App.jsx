import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { ethers } from 'ethers';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import smileyNFT from './utils/SmileyNFT.json';
import smiley1 from './assets/smiley1.svg';
import smiley2 from './assets/smiley2.svg';
import smiley3 from './assets/smiley3.svg';

// Constants
const TWITTER_HANDLE = 'bgsamz';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/smileynft-v4';
const TOTAL_MINT_COUNT = 50;
const MINING_GIF_ADDRESS = "https://thumbs.gfycat.com/ExaltedWeirdAntarcticgiantpetrel-max-1mb.gif";
const CONTRACT_ADDRESS = "0x2cc2628bE54d84AB1B5550Ce59eD83b33F5358EC";
// String, hex code of the chainId of the Rinkebey test network
const CHAIN_ID = "0x4"; 

const App = () => {

  // State variable to store user's public wallet
  const [currentAccount, setCurrentAccount] = useState("");
  // We'll open up a modal with a loading animation later
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [currentSmileyCount, setCurrentSmileyCount] = React.useState(0);
  const [onRightChain, setIsOnRightChain] = React.useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const checkOnRightChain = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Please install MetaMask!");
      setIsOnRightChain(false);
      return;
    }

    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);

    if (chainId !== CHAIN_ID) {
      alert("You are not connected to the Rinkeby Test Network!");
      setIsOnRightChain(false);
    } else {
      setIsOnRightChain(true);
    }
  }

  const checkIfWalletIsConnected = async () => {

    const { ethereum } = window;

    if (!ethereum) {
      console.log("Please install MetaMask!");
      return;
    } else {
      console.log("Ethereum object found", ethereum);
    }

    // Check if we're authorized for this user's wallet
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    // Just grab the first authorized account
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found authorized account: ", account);
      setCurrentAccount(account);

      setupEventListener();
    } else {
      console.log("No authorized accounts found.");
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask to continue!");
        return;
      }

      // Request access to account
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected to ", accounts[0]);
      setCurrentAccount(accounts[0]);

      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  }

  const getNumSmileysMinted = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, smileyNFT.abi, signer);

        let getNumTxn = await connectedContract.getNumberMinted();

        console.log(`Got number minted as ${getNumTxn}`);
        setCurrentSmileyCount(parseInt(getNumTxn));
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, smileyNFT.abi, signer);

        connectedContract.on("NewSmileyNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(`NFT has been minted and sent to your wallet. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
          getNumSmileysMinted();
        });

        console.log("Setup event listener.");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, smileyNFT.abi, signer);

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.mintSmileyNFT();

        console.log("Mining, please wait...");
        openModal();
        await nftTxn.wait();
        closeModal();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log("Ethereum object does not exist.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} disabled={!onRightChain} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  // Runs when page is loaded
  useEffect(() => {
    checkOnRightChain();
    checkIfWalletIsConnected();
    getNumSmileysMinted();
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Smiley NFT Collection</p>
          <p className="sub-text">
            A collection of uniquely generated smiley (and frowny) faces.
          </p>
          <div className="center-container">
            <img className="img-smiley" src={smiley1} />
            <img className="img-smiley" src={smiley2} />
            <img className="img-smiley" src={smiley3} />
          </div>
          <p className="header mint-count center-container">{currentSmileyCount}/100 Smileys minted so far.</p>
          <div className="center-container">
            {
              currentAccount === "" || !onRightChain
              ? (renderNotConnectedContainer()) 
              : (
                  <button onClick={askContractToMintNft} disabled={!onRightChain} className="cta-button mint-button">
                    Mint NFT
                  </button>
              )
            }
          </div>
          <div className="center-container">
            {
            <a href={OPENSEA_LINK}>
              <button className="cta-button opensea-button">
              🌊 View Collection on OpenSea 🌊
              </button>
            </a>
            }
          </div>
        </div>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Mining..."
          className="modal"
        >
          <div> 
            <p className="header mining-modal-text">Mining, this may take a while...</p>
          </div>
          <div>
            <img className="modal-img" src={MINING_GIF_ADDRESS}/>
          </div>
        </Modal>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`@${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;