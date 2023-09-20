import { Button, Icon, Modal } from "semantic-ui-react";
const ModalTemplate = (props) => {
    return <Modal
    size="mini"
    className={`${props.className}`}
    onClose={() => {
        props.onClose();
    }}
    open={props.onOpen}
    id={"modal-1"}
  >
    <div className="modal-content">
        <div
          className="copy_passkey_paper_wallet_modal_div"
        >
        <div className={`padding-bottom-class ${props.isCloseIcon ? 'flex_title_close_icon' : ''}`}>
          <h3 className={`claim_model_content ${props.isCloseIcon ? 'title_width' : ''}`} >
            {props.accountName}
          </h3>
        {props.isCloseIcon && <Icon className="close close_icon_width" onClick={()=> props.onClose()} />}
        </div>
        {props.text && <div dangerouslySetInnerHTML={{__html: props.text}} />}
      </div>
      {props.okBtnText && <Button
        className="claim_wallet_btn"
        onClick={() => {
            props.onSubmit();
        }}
      >
        {props.okBtnText}
      </Button>}
      {props.continueBtnText && <Button
        className="claim_wallet_btn"
        onClick={() => {
            props.onContinue();
        }}
      >
        {props.continueBtnText}
      </Button>}
    </div>
  </Modal>
}
export default ModalTemplate;
