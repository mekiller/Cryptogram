import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import Cryptogram from '../abis/Cryptogram.json'
import Navbar from './Navbar'
import Main from './Main'
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({host:'ipfs.infura.io',port:5001,protocol:'https'})


class App extends Component {

async componentWillMount(){//call back function in react lib life cycle call backs read about that it will run before render method
  await this.loadWeb3()
  await this.loadBlockchainData()
}

  async loadWeb3(){
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if(window.web3){
      window.web3 = new Web3(window.web3.curretnProvider)
    }
    else{
      window.alert('non-ethereum browser detected .you should consider trying metamask')
    }
  }

async loadBlockchainData(){
  const web3 = window.web3
  //load account
  const accounts = await web3.eth.getAccounts()
  this.setState({account:accounts[0]})
  
  //network id abi next two lines is use to get the Cryptogram contract form the network
  const networkId = await web3.eth.net.getId()
  const networkData = Cryptogram.networks[networkId]
  //using abi networkData 
  if(networkData){
    const cryptogram = new web3.eth.Contract(Cryptogram.abi,networkData.address)
    
    this.setState({cryptogram})  //populating decentergram
    
    const imagesCount = await cryptogram.methods.imageCount().call()//load up all the images in the news fees first get the image count bcz we are using web 3 directly we need to use   .call 
    //anytime we get data from the blockchain we need to use call
    this.setState({imagesCount})//update the state with the images count

  //load images
    for(var i=1;i<=imagesCount;i++){
      const image =await cryptogram.methods.images(i).call()
      this.setState({
        images:[...this.state.images,image]
      })
    }

    //sort images
    this.setState({
      images:this.state.images.sort((a,b)=>b.tipAmount - a.tipAmount)
    })
    this.setState({loading:false})
    }
    else{
    //...
    window.alert('cryptogram contract not deployed to detected network.')
  }

  }
  //pass this capture to main component
  captureFile = event =>{
    event.preventDefault()//bcz we want to submit something and we don't want to refresh the page
                    //read the file
    const file = event.target.files[0]
    const reader = new window.FileReader()            
    reader.readAsArrayBuffer(file)                    //all 3 lines pre process the files that we can basically upload on ipfs

    reader.onloadend =()=>{
      this.setState({buffer: Buffer(reader.result)})
      console.log('buffer',this.state.buffer)
    }
  }
      uploadImage= description =>{
        console.log("submitting file to ipfs...")

        //adding file to ipfs
        ipfs.add(this.state.buffer,(error,result)=>{
          console.log('ipfs result',result)
          if(error){
            console.error(error)
            return
          }
          this.setState({ loading: true })
      this.state.cryptogram.methods.uploadImage(result[0].hash, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
        })
          
        })
      }
      tipImageOwner =(id,tipAmount)=>{
        this.setState({loading:true})
        this.state.cryptogram.methods.tipImageOwner(id).send({ from: this.state.account, value: tipAmount }).on('transactionHash', (hash) => {
          this.setState({ loading: false })
        })
      }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      dryptogram:null,//populate this
      images:[],
      loading: false
    }
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
            // Code...
            images={this.setState.images}
            captureFile={this.captureFile}
            uploadImage={this.uploadImage}
            tipImageOwner={this.tipImageOwner}
            />
        }
        
      </div>
    );
  }
}

export default App;