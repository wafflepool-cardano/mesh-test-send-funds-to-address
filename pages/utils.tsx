import { MeshTxBuilder, MaestroProvider, IFetcher, UTxO } from '@meshsdk/core'

// const maestro = new MaestroProvider({
//     network: 'Preprod',
//     apiKey: 'vWvPIFcq6VtKDhdIersvb44ljUFEZ4pu',
// })

// const mesh = new MeshTxBuilder({
//     fetcher: maestro,
//     submitter: maestro,
//     evaluator: maestro,
// })

export type InputUTxO = UTxO['input']

// export type SetupConstants = {
//     collateralUTxO: InputUTxO
//     walletAddress: string
//     skey: string
// }

const makeMeshTxBuilderBody = () => {
    return {
        inputs: [],
        outputs: [],
        collaterals: [],
        requiredSignatures: [],
        referenceInputs: [],
        mints: [],
        changeAddress: '',
        metadata: [],
        validityRange: {},
        signingKey: [],
    }
}

// export async function queryUtxos(walletAddress: string) {
//     if (!walletAddress) {
//         console.error('No wallet address provided')
//         return
//     }

//     const utxos = await maestro.fetchAddressUTxOs(walletAddress)
//     console.log(utxos)
//     return utxos
// }

// export async function getUtxosWithMinLovelace(
//     lovelace: number,
//     providedUtxos: UTxO[] = [],
//     wallet: string
// ) {
//     let utxos: UTxO[] = providedUtxos
//     if (!providedUtxos || providedUtxos.length === 0) {
//         utxos = await maestro.fetchAddressUTxOs(wallet)
//     }
//     const utxosMinLovelace = utxos.filter((utxo) => {
//         const lovelaceAmount = utxo.output.amount.find(
//             (a: any) => a.unit === 'lovelace'
//         )?.quantity
//         console.log(Number(lovelaceAmount) >= lovelace)
//         return Number(lovelaceAmount) >= lovelace
//     })
//     console.log(typeof utxosMinLovelace)
//     return utxosMinLovelace
// }

export class Tx {
    mesh: MeshTxBuilder
    fetcher: IFetcher
    // constants: SetupConstants

    constructor(
        mesh: MeshTxBuilder,
        fetcher: IFetcher
        // constants: SetupConstants
    ) {
        this.mesh = mesh
        this.fetcher = fetcher
        // this.constants = constants
    }

    resetTxBody = () => {
        this.mesh.meshTxBuilderBody = makeMeshTxBuilderBody()
    }

    sendTx = async (
        txInHash: string,
        txInIndex: number,
        addressToSend: string,
        ownAddress: string,
        lovelaceAmount: string
    ) => {
        try {
            await this.mesh
                .txIn(txInHash, txInIndex)
                .txOut(addressToSend, [
                    { unit: 'lovelace', quantity: lovelaceAmount },
                ])
                .changeAddress(ownAddress)
                // .signingKey(this.constants.skey)
                .complete()

            const txHash = await this.signSubmitReset()
            return txHash
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    private signSubmitReset = async () => {
        const signedTx = this.mesh.completeSigning()
        const txHash = await this.mesh.submitTx(signedTx)
        this.mesh.meshTxBuilderBody = makeMeshTxBuilderBody()
        return txHash
    }
}
