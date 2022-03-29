import { BigInt, Address, ipfs } from "@graphprotocol/graph-ts"
import {
  nftClaimed, TempMint
} from "../generated/TempMint/TempMint"
import { Mint, NFT, Metadata } from "../generated/schema"
import { PhamNFTs, Transfer } from "../generated/PhamNFTs/PhamNFTs";
import { getDateString } from "./datetime";

export function handlenftClaimed(event: nftClaimed): void {

  let mint = Mint.load(event.transaction.from.toHexString());
  if (!mint) {
    mint = new Mint(event.transaction.from.toHexString())
    mint.count = BigInt.fromI32(0)
  }

  let contract = TempMint.bind(event.address);
  let nftContract = PhamNFTs.bind(Address.fromString("0x7D19ee7b025874009A77a20FdC244DCe005d6c07"));

  let nft = NFT.load("0x7D19ee7b025874009A77a20FdC244DCe005d6c07" + event.params.nftId.toString());
  if(!nft){
    nft = new NFT("0x7D19ee7b025874009A77a20FdC244DCe005d6c07" + event.params.nftId.toString());
  }
  nft.contract_type = "ERC721";
  nft.token_address = nftContract._address;
  nft.token_id = event.params.nftId;
  nft.owner_of = event.params.receiver;
  
  let metadata = Metadata.load("0x7D19ee7b025874009A77a20FdC244DCe005d6c07"+event.params.nftId.toString());
  if(!metadata){
    metadata = new Metadata("0x7D19ee7b025874009A77a20FdC244DCe005d6c07"+event.params.nftId.toString());
  }
  metadata.type = "ERC721";
  let uri = nftContract.try_tokenURI(event.params.nftId);
  if(!uri.reverted){
    metadata.uri = uri.value;
  }
  let name = nftContract.try_name();
  if(!name.reverted){
    metadata.name = name.value;
  }
  let symbol = nftContract.try_symbol();
  if(!symbol.reverted){
    metadata.symbol = symbol.value;
  }
  metadata.nft = nft.id;

  metadata.save();

  let price = contract.fetchMintPrice();
  mint.price = price;

  mint.count = mint.count + BigInt.fromI32(1);

  mint.minter = event.params.minter;
  mint.receiver = event.params.receiver;
  mint.token_id = event.params.nftId;
  mint.nft = nft.id;
  let date = getDateString(event.block.timestamp)
  mint.date = date;
  
  mint.save();
  nft.save();
}

export function handleTransfer(event: Transfer): void {

  let nft = NFT.load("0x7D19ee7b025874009A77a20FdC244DCe005d6c07" + event.params.tokenId.toString());
  if(!nft){
    nft = new NFT("0x7D19ee7b025874009A77a20FdC244DCe005d6c07" + event.params.tokenId.toString());
  }

  nft.owner_of = event.params.to;
  
  nft.save();

}
