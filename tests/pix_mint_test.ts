import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Can mint NFT with proper payment",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('pix-mint', 'mint', [
        types.ascii("ipfs://QmExample"),
      ], wallet1.address)
    ]);
    
    block.receipts[0].result.expectOk();
    block.receipts[0].events.expectNonFungibleTokenMint('pix-nft', types.uint(1), wallet1.address);
  },
});

Clarinet.test({
  name: "Can transfer NFT between accounts",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // First mint token
    let mintBlock = chain.mineBlock([
      Tx.contractCall('pix-mint', 'mint', [
        types.ascii("ipfs://QmExample"),
      ], wallet1.address)
    ]);
    
    // Then transfer
    let transferBlock = chain.mineBlock([
      Tx.contractCall('pix-mint', 'transfer', [
        types.uint(1),
        types.principal(wallet1.address),
        types.principal(wallet2.address)
      ], wallet1.address)
    ]);
    
    transferBlock.receipts[0].result.expectOk();
    transferBlock.receipts[0].events.expectNonFungibleTokenTransfer(
      'pix-nft',
      types.uint(1),
      wallet1.address,
      wallet2.address
    );
  },
});

Clarinet.test({
  name: "Can retrieve token metadata",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    const metadataUri = "ipfs://QmExample";
    
    // Mint token first
    let mintBlock = chain.mineBlock([
      Tx.contractCall('pix-mint', 'mint', [
        types.ascii(metadataUri),
      ], wallet1.address)
    ]);
    
    // Get metadata
    let block = chain.mineBlock([
      Tx.contractCall('pix-mint', 'get-token-uri', [
        types.uint(1)
      ], wallet1.address)
    ]);
    
    block.receipts[0].result.expectSome().expectAscii(metadataUri);
  },
});