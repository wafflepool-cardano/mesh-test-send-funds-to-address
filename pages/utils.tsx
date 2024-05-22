import { MeshTxBuilder, MaestroProvider, UTxO } from '@meshsdk/core'

const maestro = new MaestroProvider({
    network: 'Preprod',
    apiKey: 'vWvPIFcq6VtKDhdIersvb44ljUFEZ4pu',
})

const mesh = new MeshTxBuilder({
    fetcher: maestro,
    submitter: maestro,
    evaluator: maestro,
})

export async function queryUtxos(wallet: string) {
    if (!wallet) {
        console.error('No wallet address provided')
        return
    }

    const utxos = await maestro.fetchAddressUTxOs(wallet)
    console.log(utxos)
    return utxos
}

export async function getUtxosWithMinLovelace(
    lovelace: number,
    providedUtxos: UTxO[] = [],
    wallet: string
) {
    let utxos: UTxO[] = providedUtxos
    if (!providedUtxos || providedUtxos.length === 0) {
        utxos = await maestro.fetchAddressUTxOs(wallet)
    }
    const utxosMinLovelace = utxos.filter((utxo) => {
        const lovelaceAmount = utxo.output.amount.find(
            (a: any) => a.unit === 'lovelace'
        )?.quantity
        console.log(Number(lovelaceAmount) >= lovelace)
        return Number(lovelaceAmount) >= lovelace
    })
    console.log(typeof utxosMinLovelace)
    return utxosMinLovelace
}

export async function sendTx(
    txInHash: string,
    txInIndex: number,
    addressToSend: string,
    ownAddress: string,
    lovelaceAmount: number
) {
    try {
        await mesh
            .txIn(txInHash, txInIndex)
            .txOut(addressToSend, [
                { unit: 'lovelace', quantity: lovelaceAmount * 100000 },
            ])
            .changeAddress(ownAddress)
            .complete()

        const signedTx = await mesh.completeSigning()
        return signedTx
    } catch (error) {
        console.error(error)
        throw error
    }
}
