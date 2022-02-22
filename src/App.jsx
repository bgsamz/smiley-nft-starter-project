import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { ethers } from 'ethers';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import smileyNFT from './utils/SmileyNFT.json';

// Constants
const TWITTER_HANDLE = 'bgsamz';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const MINING_GIF_ADDRESS = "https://walfiegif.files.wordpress.com/2020/11/out-transparent-12.gif";
const CONTRACT_ADDRESS = "0xFAAa4aC58dA87b89d0D97698140feAC5d86e1273";

const App = () => {

  // State variable to store user's public wallet
  const [currentAccount, setCurrentAccount] = useState("");
  // We'll open up a modal with a loading animation later
  const [modalIsOpen, setIsOpen] = React.useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
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

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, smileyNFT.abi, signer);

        connectedContract.on("NewSmileyNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(`NFT has been minted and sent to your wallet. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
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
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  // Runs when page is loaded
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Smiley NFT Collection</p>
          <p className="sub-text">
            A collection of uniquely generated smiley (and frowny) faces.
          </p>
            {
              currentAccount === "" 
              ? (renderNotConnectedContainer()) 
              : (
                  <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                    Mint NFT
                  </button>
              )
            }
            {
            // <button onClick={openModal} className="cta-button connect-wallet-button">
            // TEST OPEN MODAL
            // </button>
            }
        </div>
        <Modal
          isOpen={modalIsOpen}
          // onAfterOpen={afterOpenModal}
          onRequestClose={closeModal}
          // style={customStyles}
          contentLabel="Mining..."
          className="modal"
          // overlayClassName="modal-overlay"
        >
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