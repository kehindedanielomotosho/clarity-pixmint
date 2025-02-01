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
    
    block.receipts[0].result.expectOk().expectUint(1);
    block.receipts[0].events.expectNonFungibleTokenMint('pix-nft', types.uint(1), wallet1.address);
  },
});

Clarinet.test({
  name: "Can batch mint multiple NFTs",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    const uris = [
      "ipfs://Qm1",
      "ipfs://Qm2",
      "ipfs://Qm3"
    ];
    
    let block = chain.mineBlock([
      Tx.contractCall('pix-mint', 'batch-mint', [
        types.list(uris.map(uri => types.ascii(uri)))
      ], wallet1.address)
    ]);
    
    block.receipts[0].result.expectOk().expectUint(1);
    assertEquals(block.receipts[0].events.length, 3);
  },
});

Clarinet.test({
  name: "Can set and collect royalties",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // First mint token
    let mintBlock = chain.mineBlock([
      Tx.contractCall('pix-mint', 'mint', [
        types.ascii("ipfs://QmExample"),
      ], wallet1.address)
    ]);
    
    // Set custom royalty
    let royaltyBlock = chain.mineBlock([
      Tx.contractCall('pix-mint', 'set-token-royalty', [
        types.uint(1),
        types.uint(10)
      ], wallet1.address)
    ]);
    
    royaltyBlock.receipts[0].result.expectOk();
    
    // Transfer will trigger royalty payment
    let transferBlock = chain.mineBlock([
      Tx.contractCall('pix-mint', 'transfer', [
        types.uint(1),
        types.principal(wallet1.address),
        types.principal(wallet2.address)
      ], wallet1.address)
    ]);
    
    transferBlock.receipts[0].result.expectOk();
    transferBlock.receipts[0].events.expectSTXTransferEvent(
      1000000, // 10% of mint price
      wallet2.address,
      wallet1.address
    );
  },
});

Clarinet.test({
  name: "Can retrieve token metadata and creator",
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
    let metadataBlock = chain.mineBlock([
      Tx.contractCall('pix-mint', 'get-token-uri', [
        types.uint(1)
      ], wallet1.address)
    ]);
    
    metadataBlock.receipts[0].result
      .expectOk()
      .expectSome()
      .expectAscii(metadataUri);
      
    // Get creator
    let creatorBlock = chain.mineBlock([
      Tx.contractCall('pix-mint', 'get-token-creator', [
        types.uint(1)
      ], wallet1.address)
    ]);
    
    creatorBlock.receipts[0].result
      .expectOk()
      .expectSome()
      .expectPrincipal(wallet1.address);
  },
});
