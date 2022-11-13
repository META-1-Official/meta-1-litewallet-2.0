import { Button, Modal } from "semantic-ui-react";
const PaperWalletModal = (props) => {
    return <Modal
    size="mini"
    className="claim_wallet_modal"
    onClose={() => {
        props.onSubmit();
    }}
    open={props.downloadPaperWalletModal}
    id={"modalExch"}
  >
    <Modal.Content >
      <div
        className="claim_wallet_btn_div"
      >
        <h3 className="claim_model_content">
          Hello {props.accountName}<br />
          
        </h3>
      </div>
    </Modal.Content>
    <Modal.Actions className="claim_modal-action">
      <Button
        className="claim_wallet_btn"
        onClick={() => {
            props.onSubmit();
        }}
      >
        Download Paper Wallet</Button>
    </Modal.Actions>
  </Modal>
}
export default PaperWalletModal;
