import { BigInt } from "@graphprotocol/graph-ts"
import {
  nftClaimed, TempMint
} from "../generated/TempMint/TempMint"
import { Mint, NFT } from "../generated/schema"

export function handlenftClaimed(event: nftClaimed): void {

  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let mint = Mint.load(event.transaction.from.toHex())

  let contract = TempMint.bind(event.address)
  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!mint) {
    mint = new Mint(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    mint.count = BigInt.fromI32(0)
  }

  let price = contract.fetchMintPrice()

  mint.price = price

  // BigInt and BigDecimal math are supported
  mint.count = mint.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  mint.minter = event.params.minter
  mint.receiver = event.params.receiver

  // Entities can be written to the store with `.save()`
  mint.save()

  let nft = NFT.load(event.transaction.from.toHex())

  if (!nft) {
    nft = new NFT(event.transaction.from.toHex())
  }

    // Entity fields can be set based on event parameters
    nft.owner_of = event.params.receiver
    nft.token_id = event.params.nftId

  nft.save()
  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.DEFAULT_ADMIN_ROLE(...)
  // - contract.DEV_ROLE(...)
  // - contract.fetchMintPrice(...)
  // - contract.fetchNFTsCreated(...)
  // - contract.fetchNFTsCreatedByAddress(...)
  // - contract.fetchNFTsCreatedCount(...)
  // - contract.getRoleAdmin(...)
  // - contract.hasRole(...)
  // - contract.mintPrice(...)
  // - contract.nftAddress(...)
  // - contract.nftsRedeemed(...)
  // - contract.onERC1155Received(...)
  // - contract.onERC721Received(...)
  // - contract.paused(...)
  // - contract.setMintPrice(...)
  // - contract.setNftAddress(...)
  // - contract.supportsInterface(...)

}
