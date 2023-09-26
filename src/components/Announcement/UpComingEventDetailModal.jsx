import React, { useEffect, useState } from 'react';
import styles from "./announcement.module.scss";

import { Modal } from "semantic-ui-react";
import TimerIcon from "../../images/timer.png";
import LocationIcon from "../../images/location.png";
import { toast } from 'react-toastify';

export const UpComingEventDetailModal = (props) => {
    const { data, date } = props;
    const [detail, setDetail] = useState([]);

    useEffect(() => {
        if (data) {
            let events = data[date.getDate()];
            events && setDetail(events[0]);
        }
    }, [data, date]);

    const isPastEvent = () => {
        return new Date() > date;
    }

    const handleRegister = () => {
        if (detail?.registration)
            window.open(detail.registration);
        else {
            toast('Registration is not ready yet.');
        }
    }

    return (
        <Modal
            open={props.isOpen}
            id={"detail-event"}
        >
            <Modal.Content style={{ padding: 0 }}>
                <div className={styles.modalContent} >
                    <img
                        src={detail?.location_bg_url}
                        className={styles.locationImage}
                    />
                    <span className={styles.locationText}>{detail?.location}</span>
                    <div className={styles.infoWrapper}>
                        <div className={styles.infoIcon}><img src={TimerIcon} style={{ width: 16 }} /></div>
                        <p className={styles.infoText} style={{ fontWeight: 600 }}>
                            {new Date(detail?.start).toLocaleTimeString('en-US')}-{new Date(detail?.end).toLocaleTimeString('en-US')}
                        </p>
                    </div>
                    <div className={styles.infoWrapper} style={{ marginTop: 10 }}>
                        <div className={styles.infoIcon}><img src={LocationIcon} style={{ width: 13, marginTop: 5, marginLeft: 2, marginRight: 2 }} /></div>
                        <p className={styles.infoText}>
                            {detail?.location}
                        </p>
                    </div>
                    <div className={styles.splitterLine} />
                    <span className={styles.infoText} style={{ fontWeight: 500, color: '#FC0', lineHeight: '2.0' }}>
                        {detail?.plus_title}
                    </span>
                    <p className={styles.infoText} style={{ fontWeight: 500 }}>
                        {detail?.plus_description}
                    </p>
                    <p className={styles.infoText}>
                        {detail?.description}
                    </p>
                    <p className={styles.infoText}>
                        {detail?.registration}
                    </p>
                    <div className={styles.splitterLine} />
                    <div className={styles.actionWrapper}>
                        <button
                            className={styles.actionBtn}
                            onClick={handleRegister}
                            disabled={isPastEvent()}
                            style={{
                                cursor: isPastEvent() ? 'not-allowed' : 'pointer',
                                opacity: isPastEvent() ? 0.5 : 1.0
                            }}
                        >
                            Register Now
                        </button>
                        <button
                            className={styles.actionBtn}
                            onClick={() => props.setModalOpened(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal.Content>
        </Modal>
    )
}