export interface EthereumTransfer {
    toAddress: string,
    ethKeysId: string,
    password: string,
    amount: number
}

export interface  EthereumTransferDisplay {
    sourceWalletAddress: string,
    targetWalletAddress: string,
    date: number,
    amount: number
}