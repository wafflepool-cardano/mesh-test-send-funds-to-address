import { useState } from 'react'
import {
    MeshTxBuilder,
    MaestroProvider,
    BrowserWallet,
    UTxO,
} from '@meshsdk/core'
import { useWallet, CardanoWallet } from '@meshsdk/react'
import { queryUtxos, getUtxosWithMinLovelace, sendTx } from './utils'

const maestro = new MaestroProvider({
    network: 'Preprod',
    apiKey: 'vWvPIFcq6VtKDhdIersvb44ljUFEZ4pu',
})

const mesh = new MeshTxBuilder({
    fetcher: maestro,
    submitter: maestro,
    evaluator: maestro,
})

export default function Home() {
    const { name, connecting, connected, wallet, connect, disconnect, error } =
        useWallet()

    const [walletConnection, setWalletConnection] = useState(false)
    const [address, setAddress] = useState('')
    const [utxosWithAda, setUtxosWithAda] = useState<UTxO[]>([])
    const [txInHash, setTxInHash] = useState('')
    const [txInIndex, setTxInIndex] = useState(0)

    /// handling address to send ADA to
    const [inputAddressValue, setInputAddressValue] = useState('')
    const [addressToSend, setAddressToSend] = useState('')
    // handling amount of ADA to send
    const [inputAmountValue, setInputAmountValue] = useState(0)
    const [sendAmount, setSendAmount] = useState(0)

    const connectWallet = () => {
        if (!walletConnection) {
            connect('eternl')
            setWalletConnection(true)
        } else {
            disconnect()
            setWalletConnection(false)
        }
    }

    async function walletAddress() {
        const address = await wallet.getChangeAddress()
        console.log(address)
        setAddress(address)
    }

    async function utxos() {
        const utxos = await getUtxosWithMinLovelace(1000000, [], address)
        console.log(utxos)
        setUtxosWithAda(utxos)
        setTxInHash(utxos[0]?.input.txHash)
        setTxInIndex(utxos[0]?.input.outputIndex)
    }

    /// handling address to send ADA to
    const handleAddressChange = (e: any) => {
        setInputAddressValue(e.target.value)
    }
    const handleSaveAddress = () => {
        setAddressToSend(inputAddressValue)
        console.log(inputAddressValue)
    }

    // handling amount of ADA to send
    const handleAmountChange = (e: any) => {
        setInputAmountValue(e.target.value)
    }
    const handleSaveAmount = () => {
        setSendAmount(inputAmountValue as number)
        console.log(inputAmountValue as number)
    }

    const sendFunds = async () => {
        const signedTx = await sendTx(
            txInHash,
            txInIndex,
            addressToSend,
            address,
            Number(sendAmount)
        )
        console.log(signedTx)
    }

    return (
        <div className="bg-white">
            <span className="text-black">
                Connected: {connected ? 'Yes' : 'No'}
            </span>
            <button className="m-2 p-2 bg-slate-500" onClick={connectWallet}>
                {walletConnection ? 'Disconnect' : 'Connect'}
            </button>
            <button className="m-2 p-2 bg-slate-500" onClick={walletAddress}>
                Get Address
            </button>
            <button
                className="m-2 p-2 bg-slate-500"
                onClick={() => queryUtxos(address)}
            >
                Get UTXOs
            </button>
            <button className="m-2 p-2 bg-slate-500" onClick={() => utxos()}>
                Get UTXOs with minimum lovelace
            </button>
            {/* Handling Address */}
            <form method="post" className="m-2 p-2 bg-slate-500">
                <label htmlFor="addressToSend">Address to Send to </label>
                <input
                    type="text"
                    id="addressToSend"
                    name="addressToSend"
                    value={inputAddressValue}
                    onChange={handleAddressChange}
                    className="border rounded px-2 py-1 text-black"
                />
            </form>
            <button
                onClick={handleSaveAddress}
                className="mt-2 bg-blue-500 text-white rounded px-4 py-2"
            >
                Set Address
            </button>
            {addressToSend && (
                <div className="mt-4 text-black">
                    <h2 className="text-xl">Saved Address:</h2>
                    <p className="border rounded p-2">{addressToSend}</p>
                </div>
            )}
            {/*  */}

            {/* Handling Amount to send */}
            <form method="post" className="m-2 p-2 bg-slate-500">
                <label htmlFor="addressToSend">Amount of ADA to send</label>
                <input
                    type="text"
                    id="amountToSend"
                    name="amountToSend"
                    value={inputAmountValue}
                    onChange={handleAmountChange}
                    className="border rounded px-2 py-1 text-black"
                />
            </form>
            <button
                onClick={handleSaveAmount}
                className="mt-2 bg-blue-500 text-white rounded px-4 py-2"
            >
                Set amount to send{'  '}
            </button>
            {sendAmount && (
                <div className="mt-4 text-black">
                    <h2 className="text-xl">Amount of ADA to send:</h2>
                    <p className="border rounded p-2">{sendAmount}</p>
                </div>
            )}
            <br />
            <button onClick={sendFunds} className="m-2 p-2 bg-slate-500">
                Send to Address
            </button>
        </div>
    )
}

// () => sendTx(txInHash, txInIndex, addressToSend, address, sendAmount)
