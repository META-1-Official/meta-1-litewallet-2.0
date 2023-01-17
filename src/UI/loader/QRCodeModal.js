import { useEffect, useState } from "react";
import { Button, Modal } from "semantic-ui-react";
import { QRCodeSVG } from 'qrcode.react';
import { useInterval } from "../../lib/useInterval";
import { createQRPoll, findQRPoll, removeQRPoll } from "../../API/API";

const QRCodeModal = (props) => {
  const qr_hash = `${props.acc}_${props.email}`;
  const [verified, setVerified] = useState(false);
  const [closeBtnText, setCloseBtnText] = useState('Close');

  // create QR poll.
  useEffect(async () => {
    const {acc, email} = props;

    if (acc && email) {
      await createQRPoll(qr_hash);
    }
  }, []);

  // remove QR poll after verification.
  useEffect(async () => {
    const {acc, email} = props;

    if (acc && email && verified === 1) {
      const poll = await removeQRPoll(qr_hash);
      if (poll) {       
        props.setOpen(false);
      }
    }
  }, [verified]);

  useInterval(async () => {
    const {acc, email} = props;
    if (acc && email) {
      const poll = await findQRPoll(qr_hash);
      if (poll && poll?.bio_verified === 1) {
        setVerified (1);
        props.setPhoto("data:image/jpeg;base64, " + Buffer.from(poll.bio_blob).toString('base64'));
      }
    }
  }, 1000 * 5);

  const handleClose = async () => {
    const {acc, email} = props;

    if (acc && email) {
      const poll = await removeQRPoll(qr_hash);
      if (poll && poll.qr_hash) {
        props.setOpen(false);
      } else setCloseBtnText('Try Again');
    }
  }

  return (
    <Modal
      closeOnEscape={false}
      closeOnDimmerClick={false}
      onOpen={() => props.setOpen(true)}
      open={props.open}
      id={"qrcode"}
      size="mini"
      className="qr-modal"
      centered
    >
      <Modal.Content>
        <div className="qrmodal-content-wrapper">
          <div className="qrmodal-scan-info">Please scan qrcode below on your mobile device</div>
          <QRCodeSVG
            value={`${process.env.REACT_APP_FE_URL}?onMobile=true&accountName=${props.acc}&email=${props.email}`}
            size={300}
          />
        </div>
      </Modal.Content>
      <Modal.Actions className="qrmodal-actions">
        <Button
          onClick={handleClose}
          color="orange"
        >
          {closeBtnText}
        </Button>
      </Modal.Actions>
    </Modal>
  )
}
export default QRCodeModal;
