import { Button, Modal } from "semantic-ui-react";
const ModalTemplate = (props) => {
    return <Modal
    size="mini"
    className={`${props.className}`}
    onClose={() => {
        props.onClose();
    }}
    open={props.onOpen}
    id={"modalExch"}
  >
    <Modal.Content >
      <div
        className="claim_wallet_btn_div"
      >
        <h3 className="claim_model_content">
          Hello {props.accountName}<br />
          {props.text && props.text}
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
        {props.okBtnText}
      </Button>
      {props.continueBtnText && <Button
        className="claim_wallet_btn"
        onClick={() => {
            props.onContinue();
        }}
      >
        {props.continueBtnText}
      </Button>}
    </Modal.Actions>
  </Modal>
}
export default ModalTemplate;
