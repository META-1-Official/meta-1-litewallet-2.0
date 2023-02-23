import React, { useEffect, useState } from "react";
import { Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Button } from "semantic-ui-react";

const isLocked = () => true

const PreviewPDF = (props) => {
	const [url, setUrl] = useState(null);
	const [pagesCount, setPagesCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    const paperWalletData = localStorage.getItem('paperWalletData', null);

    const getPaperWalletUrl = () => {
    	if (!paperWalletData) return;

    	const base64WithoutPrefix = String(paperWalletData).substr('data:application/pdf;filename=generated.pdf;base64,'.length);
	    const bytes = atob(base64WithoutPrefix);
	    let length = bytes.length;
	    let out = new Uint8Array(length);

	    while (length--) {
	        out[length] = bytes.charCodeAt(length);
	    }

	    const blob = new Blob([out], { type: 'application/pdf' });
	    return URL.createObjectURL(blob);
    }

	useEffect(() => {
		setUrl(getPaperWalletUrl());
		localStorage.removeItem('paperWalletData');
	}, []);

	const onPageChange = ({ currentPage }) => setPageIndex(currentPage);
    const onDocumentLoad = ({ doc }) => setPagesCount(doc._pdfInfo.numPages);

    const handleDownload = () => {
    	let alink = document.createElement('a');
        alink.href = url;
        const accountName = localStorage.getItem('account', '');
        alink.download = `meta-paper-wallet-${(isLocked() ? 'public-' : 'private-')}${accountName}.pdf`;
        alink.click();
    }

	return (
		<div
		    style={{
		        border: '1px solid rgba(0, 0, 0, 0.3)',
		        height: '750px',
		    }}
		>
            { url && <Viewer
                fileUrl={url}
                plugins={[defaultLayoutPluginInstance]}
                initialPage={pageIndex}
                onPageChange={onPageChange}
                onDocumentLoad={onDocumentLoad}
            />}
           	{ url && <div style={{
           		display: 'flex',
           		justifyContent: 'center',
           		marginTop: '10px'
	    	}}>
	    		<Button
	                className="sbBtn"
	                onClick={handleDownload}
	                type="submit"
	            >
	                Download
	            </Button>
	    	</div>
	    	}
		</div>
	);
};
export default PreviewPDF;
