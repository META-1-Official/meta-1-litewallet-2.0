import { CopyToClipboard } from 'react-copy-to-clipboard'
import React, { useState, useEffect } from 'react'
import {
	Message,
	Modal,
	Icon,
	Button,
	Grid,
	Header,
	Input
} from 'semantic-ui-react'
import QRCode from 'react-qr-code'

import './style.css'


export default function DepositForm(props) {
	const { fetcher, account, onBackClick, asset } = props
	const [isLoading, setIsLoading] = useState(false)
	const [address, setAddress] = useState(props.address)
	const canDeposit = address.length > 0
	useEffect(() => {
		async function fetchAddress(asset) {
			try {
				setIsLoading(true)
				const fetchedAsset = asset === 'USDT' ? 'eth' : asset
				const resp = await fetcher(fetchedAsset)
				const body = await resp.body.getReader().read()
				if (resp.status === 200) {
					const addr = JSON.parse(
					new TextDecoder('utf-8').decode(body.value)
					).address
					setAddress(addr)
				}
				setIsLoading(false)
			} catch (e) {
				setIsLoading(false)
			}
		}

		if (asset !== undefined) fetchAddress(asset)
	}, [asset])



	return (
	<>
		<div>
		<div className={'headerTitle'} style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
			<h2 className="headTl">Deposit</h2>
			<div style={{marginRight: '1rem', cursor: 'pointer'}}>
			<i className="far fa-arrow-left" style={{color: '#FFC000', marginRight: '.5rem'}}/>
				<span onClick={onBackClick} style={{color: '#FFC000', borderBottom: '1px solid #FFC000', height: '40%', fontWeight: '600'}}>
				Back to Portfolio</span>
			</div>
		</div>


	<div className="qr-section">
		<div style={{background: '#F0F1F4', padding: '1rem', width: '96%', margin: '0 auto', borderRadius: '10px'}}>
			<span style={{color: '#000', fontWeight: 'bold', fontSize: '.8rem', margin: '1rem'}}>DEPOSIT <span style={{color: '#FFC000'}}>BTC</span></span>
			<div className={'needAdaptToQR'}>
			{!isLoading && !canDeposit && (
			<p> Cannot deposit </p>
			)}
			{!isLoading && canDeposit && (
				<QRCode value={address} size={200}/>
			)}
			</div>
		</div>
		<p style={{margin: '1rem', color: '#505361', fontWeight: '600', fontSize: '.8rem'}}>Minimum deposit: 0.001 {asset}</p>
		<div>
			{!isLoading && canDeposit && (
			<CopyToClipboard text={address} onCopy={() => {}}>
				<div style={{width: '100%'}}>
					<Input
						style={{width: '100%'}}
					action={{
						color: 'yellow',
						labelPosition: 'right',
						icon: 'copy',
						content: 'Copy'
					}}
					value={address}
					/>
				</div>
			</CopyToClipboard>
			)}
		</div>

		<Message
			className={'messageRed'}
			icon="attention"
			header="Important information"
			content={`Send only ${asset} to this address. Sending less than 0.001 ${asset} or any other currency to this address may result in the loss of your deposit`}
			/>
	</div>
		</div>
	</>
	)
}
