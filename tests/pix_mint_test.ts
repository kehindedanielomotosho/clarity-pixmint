[... existing tests remain unchanged, adding new tests below ...]

Clarinet.test({
  name: "Cannot mint with empty metadata URI",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('pix-mint', 'mint', [
        types.ascii(""),
      ], wallet1.address)
    ]);
    
    block.receipts[0].result.expectErr().expectUint(107);
  },
});

Clarinet.test({
  name: "Cannot batch mint with empty list",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('pix-mint', 'batch-mint', [
        types.list([])
      ], wallet1.address)
    ]);
    
    block.receipts[0].result.expectErr().expectUint(107);
  },
});

Clarinet.test({
  name: "Cannot set zero mint price",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('pix-mint', 'set-mint-price', [
        types.uint(0)
      ], deployer.address)
    ]);
    
    block.receipts[0].result.expectErr().expectUint(108);
  },
});
