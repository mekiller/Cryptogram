pragma solidity ^0.5.16;


contract Cryptogram {
  // Code goes here...
  string public name= 'Cryptogram';         //this var is a state var with string data type and will be stored on a block chain 
    
    uint public imageCount =0;
    //STORE IMAGE by using hash of the ipfs image
    mapping (uint =>Image)public images; //solidity fun for image fetching


    //we will use struct to create a data type for images
    struct Image{                 //for data base use
      uint id;
      string hash;              //location of ipfs 
      string description;       
      uint tipAmount;           //we will send to the author
      address payable author;   //address of author
    }
    event ImageCreated(
      uint id,
      string hash,
      string description,
      uint tipAmount,
      address payable author
    );
    event ImageTipped(
      uint id,
      string hash,
      string description,
      uint tipAmount,
      address payable author
    );
    //create images
    function uploadImage(string memory _imageHash,string memory _description) public{
      //why memory

      //make sure the image description  hash address exist 
      require(bytes(_description).length>0);
      require(bytes(_imageHash).length>0);
      require(msg.sender != address(0x0));
      
      imageCount ++;

      //add images to contract
      images[imageCount]= Image(imageCount,_imageHash,_description,0,msg.sender);

      //Trigger an event
      emit ImageCreated(imageCount, _imageHash, _description, 0,msg.sender);
    }
    //tip images
    //ether comes with the fun call bcz its a payable function
    
    
    function tipImageOwner(uint _id)public payable{
        require (_id >0 &&_id <= imageCount);


      //fetch the image from storage 
      //memory is not from the blockchain storage
      Image memory _image =images[_id];
      //Fetch the author
      address payable _author = _image.author;
      //pay
      address(_author).transfer(msg.value);
      //update the tip amount
      _image.tipAmount = _image.tipAmount +msg.value;
      //upload image
      images[_id] = _image; 
      emit ImageTipped(_id,_image.hash,_image.description,_image.tipAmount,_author);
    }
}