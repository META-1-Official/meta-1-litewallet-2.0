import { Button, Modal } from "semantic-ui-react";
import {QRCodeSVG} from 'qrcode.react';

const QRCodeModal = (props) => {
  return (
    <Modal
      onClose={() => props.setOpen(false)}
      onOpen={() => props.setOpen(true)}
      open={props.open}
      id={"qrcode"}
      size="mini"
      className="qr-modal"
      centered
    >
      <Modal.Content >
        {/* <QRCodeSVG value="http://localhost:3000?accountName=antman-kok357357" /> */}
      </Modal.Content>
      <Modal.Actions className="">
        <Button
          onClick={() => props.setOpen(false)}
        >
          Close
        </Button>
      </Modal.Actions>
    </Modal>
  )
}
export default QRCodeModal;
