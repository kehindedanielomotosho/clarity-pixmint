// Adding new tests for enhanced security features

Clarinet.test({
  name: "Cannot mint with duplicate URI",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    const uri = "ipfs://QmTest123";
    
    let block = chain.mineBlock([
      Tx.contractCall('pix-mint', 'mint', [
        types.ascii(uri),
      ], wallet1.address),
      Tx.contractCall('pix-mint', 'mint', [
        types.ascii(uri),
      ], wallet1.address)
    ]);
    
    block.receipts[0].result.expectOk();
    block.receipts[1].result.expectErr().expectUint(109);
  },
});

// Original tests remain unchanged...
