import React, {useState, useEffect} from 'react';
import styles from "./announcement.module.scss";

import { Modal } from "semantic-ui-react";
import MicroPhoneIcon from "../../images/microphone.png";

export const AnnouncementDetailModal = (props) => {
    const {data, index} = props;
    const [detail, setDetail] = useState();

    useEffect(() => {
        if (data) {
            setDetail(data[index]);
        }       
    }, [data, index]);

    const getTimeDiff = (time) => {
        var diff = time.getTime() - new Date().getTime();

        var msec = diff;
        var hh = Math.floor(msec / 1000 / 60 / 60);
        msec -= hh * 1000 * 60 * 60;
        var mm = Math.floor(msec / 1000 / 60);
        msec -= mm * 1000 * 60;
        var ss = Math.floor(msec / 1000);
        msec -= ss * 1000;

        return hh + ' hours ago';
    }

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
                                <span className={styles.title}>{detail?.title}</span>
                                <div className={styles.time}>{getTimeDiff(new Date(detail?.announced_time))}</div>
                            </div>
                        </div>
                        <div className={styles.cancelBtn} onClick={() => props.setModalOpened(false)}>X</div>
                    </div>
                    <div className={styles.modalBody}>
                        <p>{detail?.description}</p>
                    </div>
                </div>
            </Modal.Content>
        </Modal>
    )
}