import React, { useState, useEffect } from 'react';
import styles from "./announcement.module.scss";

import { Modal } from "semantic-ui-react";
import MicroPhoneIcon from "../../images/microphone.png";
import moment from 'moment';

export const AnnouncementDetailModal = (props) => {
    const { data, index } = props;
    const [detail, setDetail] = useState();

    useEffect(() => {
        if (data) {
            setDetail(data[index]);
        }
    }, [data, index]);

    return (
        <>
            {detail ? <Modal
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
                                    <span className={styles.title}>{detail?.title}</span>
                                    <div className={styles.time}>{moment(detail?.created_at).fromNow()}</div>
                                </div>
                            </div>
                            <div className={styles.cancelBtn} onClick={() => props.setModalOpened(false)}>X</div>
                        </div>
                        <div className={styles.modalBody}>
                            <p dangerouslySetInnerHTML={{__html: detail?.description}} />
                        </div>
                    </div>
                </Modal.Content>
            </Modal> : <div></div>
            }
        </>
    )
}