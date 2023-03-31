import { Button, Icon, Modal } from "semantic-ui-react";
import React, { useEffect, useState } from "react";
import { Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const isLocked = () => true

const PreviewPDFModal = (props) => {
  const {
    onRegistration,
    accountName,
    password,
    email
  } = props;

  const [url, setUrl] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [pagesCount, setPagesCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const paperWalletData = props.paperWalletData;

  const getPaperWalletUrl = () => {
    if (!paperWalletData) {
      return;
    }

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
    const isMobile = window.matchMedia("(pointer:coarse)").matches;
    if (isMobile && (navigator.userAgent.indexOf("Edg") == -1 && navigator.userAgent.indexOf("CriOS") == -1)) {
      setShowHelp(true);
    }
    setUrl(getPaperWalletUrl());
  }, [paperWalletData]);

  const onPageChange = ({ currentPage }) => setPageIndex(currentPage);
  const onDocumentLoad = ({ doc }) => setPagesCount(doc._pdfInfo.numPages);

  const handleDownload = () => {
    let alink = document.createElement('a');
    alink.href = url;
    const accountName = localStorage.getItem('account', '');
    alink.download = `meta-paper-wallet-${(isLocked() ? 'public-' : 'private-')}${accountName}.pdf`;
    alink.click();
    localStorage.removeItem('paperWalletData');

    onRegistration(accountName, password, email);
  }

  return <Modal
    size="large"
    className={`${props.className}`}
    open={props.onOpen}
    id={"modal-1"}
  >
    <Modal.Content >
      <div
        className="copy_passkey_paper_wallet_modal_div"
      >
        <div className={`padding-bottom-class ${props.isCloseIcon ? 'flex_title_close_icon' : ''}`}>
          <h3 className={`claim_model_content ${props.isCloseIcon ? 'title_width' : ''}`} >
            {props.accountName}
          </h3>
          {props.isCloseIcon && <Icon className="close" onClick={() => props.onClose()} />}
        </div>

        <div
          style={{
            border: '1px solid rgba(0, 0, 0, 0.3)',
          }}
        >
          {url && <Viewer
            fileUrl={url}
            plugins={[defaultLayoutPluginInstance]}
            initialPage={pageIndex}
            onPageChange={onPageChange}
            onDocumentLoad={onDocumentLoad}
          />}

          {url && <div style={{ marginTop: '20px', position: 'relative' }}>
            {showHelp && <p style={{ fontSize: '12px', textAlign: 'center', marginLeft: '20%', marginRight: '20%' }}>
              After tap download button, please tap the share button in preview window, which will bring up the Share Sheet and
              Select Save to Files or Print menu.
            </p>
            }
          </div>
          }
        </div>

      </div>
    </Modal.Content>
    <Modal.Actions className="claim_modal-action">
      <Button
        className="sbBtn"
        onClick={handleDownload}
        type="submit"
        style={{
          marginBottom: '10px'
        }}
      >
        Download
      </Button>
    </Modal.Actions>
  </Modal>
}
export default PreviewPDFModal;
