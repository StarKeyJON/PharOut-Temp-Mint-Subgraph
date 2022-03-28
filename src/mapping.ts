import { BigInt, Address, ipfs } from "@graphprotocol/graph-ts"
import {
  nftClaimed, TempMint
} from "../generated/TempMint/TempMint"
import { Mint, NFT, Metadata } from "../generated/schema"
import { PhamNFTs, Transfer } from "../generated/PhamNFTs/PhamNFTs";

export function handlenftClaimed(event: nftClaimed): void {

  let mint = Mint.load(event.transaction.from.toHex());
  if (!mint) {
    mint = new Mint(event.transaction.from.toHex())
    mint.count = BigInt.fromI32(0)
  }

  let contract = TempMint.bind(event.address);
  let nftContract = PhamNFTs.bind(Address.fromString("0x851A7c43C148bfA7F79dAA312d09A61306B56006"));

  let nft = NFT.load(nftContract._address.toString() + event.params.nftId.toString());
  if(!nft){
    nft = new NFT(nftContract._address.toString() + event.params.nftId.toString());
  }
  nft.contract_type = "ERC721";
  nft.token_address = nftContract._address;
  nft.token_id = event.params.nftId
  nft.owner_of = event.params.receiver
  
  let metadata = Metadata.load(nftContract._address.toString()+event.params.nftId.toString());
  if(!metadata){
    metadata = new Metadata(nftContract._address.toString()+event.params.nftId.toString());
  }
  metadata.type = "ERC721";
  let uri = nftContract.try_tokenURI(event.params.nftId);
  if(uri){
    metadata.uri = uri.value;
  }
  let name = nftContract.try_name();
  if(name){
    metadata.name = name.value;
  }
  let symbol = nftContract.try_symbol();
  if(symbol){
    metadata.symbol = symbol.value;
  }
  metadata.save();

  let price = contract.fetchMintPrice();
  mint.price = price;

  mint.count = mint.count + BigInt.fromI32(1);

  mint.minter = event.params.minter
  mint.receiver = event.params.receiver
  mint.token_id = event.params.nftId;
  
  mint.save()
  nft.save()
}

export function handleTransfer(event: Transfer): void {

let nftContract = PhamNFTs.bind(Address.fromString("0x851A7c43C148bfA7F79dAA312d09A61306B56006"));
  let nft = NFT.load(nftContract._address.toString() + event.params.tokenId.toString());
  if(!nft){
    nft = new NFT(nftContract._address.toString() + event.params.tokenId.toString());
  }
  nft.contract_type = "ERC721";
  nft.token_address = nftContract._address;
  nft.token_id = event.params.tokenId
  nft.owner_of = event.params.to
  
  let metadata = Metadata.load(nftContract._address.toString()+event.params.tokenId.toString());
  if(!metadata){
    metadata = new Metadata(nftContract._address.toString()+event.params.tokenId.toString());
  }
  metadata.type = "ERC721";
  let uri = nftContract.try_tokenURI(event.params.tokenId);
  if(uri){
    metadata.uri = uri.value;
  }
  let name = nftContract.try_name();
  if(name){
    metadata.name = name.value;
  }
  let symbol = nftContract.try_symbol();
  if(symbol){
    metadata.symbol = symbol.value;
  }
  metadata.save();
  nft.save();

}
