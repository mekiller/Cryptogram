const { assert } = require('chai')
//Cryptogram

const Cryptogram = artifacts.require('./Cryptogram.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Cryptogram', ([deployer, author, tipper]) => {
  let cryptogram      //?

  before(async () => {
    cryptogram = await Cryptogram.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await Cryptogram.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await cryptogram.name()
      
      assert.equal(name,'Cryptogram');
    })
  })
  describe('images',async() =>{
    let result,imageCount
    const hash ='abc123'

    before(async () => {
      result = await cryptogram.uploadImage(hash,'image description',{from: author})
      imageCount =await cryptogram.imageCount()
      
    })

    it('creates images',async() =>{
      //success 
      assert.equal(imageCount,1)
      //testing event in terminal
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(),imageCount.toNumber(),'id is correct')
      assert.equal(event.hash,hash ,'hash is correect')
      assert.equal(event.description,'image description','description is correct')
      assert.equal(event.tipAmount,'0','tip amount is correct')
      assert.equal(event.author,author,'author is correct')
        //failure image must have testing so that it will fail
      await cryptogram.uploadImage('','image description',{from: author}).should.be.rejected
      await cryptogram.uploadImage('image hash','',{from: author}).should.be.rejected
    })
    //check for struct
    it('lists images',async()=>{
      const image = await cryptogram.images(imageCount)
      assert.equal(image.id.toNumber(),imageCount.toNumber(),'id is correct')
      assert.equal(image.hash,hash ,'hash is correect')
      assert.equal(image.description,'image description','description is correct')
      assert.equal(image.tipAmount,'0','tip amount is correct')
      assert.equal(image.author,author,'author is correct')
    })
      //next function
    it('allows users to tip images',async()=>{
      //track the author balance before the purchase
      let oldAuthorBalance
      oldAuthorBalance = await web3.eth.getBalance(author)//making sure auth receives tip
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)


      result = await cryptogram.tipImageOwner(imageCount,{from:tipper, value: web3.utils.toWei('1','Ether')})

      //success
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(),imageCount.toNumber(),'id is correct')
      assert.equal(event.hash,hash ,'hash is correect')
      assert.equal(event.description,'image description','description is correct')
      assert.equal(event.tipAmount,'1000000000000000000','tip amount is correct')
      assert.equal(event.author,author,'author is correct')
      
      //check that the author receives funds
      let newAuthorBalance
      newAuthorBalance = await web3.eth.getBalance(author)
      newAuthorBalance = new web3.utils.BN(newAuthorBalance)

      let tipImageOwner
      tipImageOwner = web3.utils.toWei('1','Ether')
      tipImageOwner = new web3.utils.BN(tipImageOwner)

      const expectedbalance = oldAuthorBalance.add(tipImageOwner)
      assert.equal(newAuthorBalance.toString(),expectedbalance.toString())

      //failure tries to tip a image that does not exist
      await decentragram.tipImageOwner(99,{from :tipper,value: web3.utils.toWei('1','Ether')}).should.be.rejected
    })
  })

})