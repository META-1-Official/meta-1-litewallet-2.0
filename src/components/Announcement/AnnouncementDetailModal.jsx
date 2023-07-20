import React from 'react';
import styles from "./announcement.module.scss";

import { Modal } from "semantic-ui-react";
import MicroPhoneIcon from "../../images/microphone.png";

export const AnnouncementDetailModal = (props) => {
    return (
        <Modal
            open={props.isOpen}
            id={"detail-announcement"}
        >
            <Modal.Content style={{ padding: 0 }}>
                <div className={styles.announceModalContent} >
                    <div className={styles.modalHeader}>
                        <div className={styles.left}>
                            <div className={styles.iconWrapper}>
                                <img src={MicroPhoneIcon} />
                            </div>
                            <div className={styles.titleWrapper}>
                                <span className={styles.title}>Ambassador New Opportunity Call Schedule</span>
                                <div className={styles.time}>7 Hours ago</div>
                            </div>
                        </div>
                        <div className={styles.cancelBtn} onClick={() => props.setModalOpened(false)}>X</div>
                    </div>
                    <div className={styles.modalBody}>
                        <p>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text.<br /><br />
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.<br /><br />
                            It has survived not only five centuries, but also the leap into electronic type setting, remai ning essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing<br /><br />
                            software like Aldus PageMaker including versions of Lorem Ipsum.<br /><br />
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text.<br /><br />
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.<br /><br />
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text.<br /><br />
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.<br /><br />
                            It has survived not only five centuries, but also the leap into electronic type setting, remai ning essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing<br /><br />
                            software like Aldus PageMaker including versions of Lorem Ipsum.<br /><br />
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text.<br /><br />
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.<br /><br />
                        </p>
                    </div>
                </div>
            </Modal.Content>
        </Modal>
    )
}