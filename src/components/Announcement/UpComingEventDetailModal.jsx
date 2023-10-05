import React, { useEffect, useState } from 'react';
import styles from "./announcement.module.scss";

import { Modal } from "semantic-ui-react";
import TimerIcon from "../../images/timer.png";
import LocationIcon from "../../images/location.png";
import { toast } from 'react-toastify';

export const UpComingEventDetailModal = (props) => {
    const { data, date } = props;
    const [detail, setDetail] = useState([]);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (data) {
            let events = data[date.getDate()];
            events && setDetail(events[0]);
            events && setEvents(events);
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
            onClose={() => props.setModalOpened(false)}
        >
            <Modal.Content style={{ padding: 0, overflowY: 'auto', maxHeight: 750 }}>
                {events.map((detail, index) => {
                    return <div
                        className={styles.modalContent}
                        key={index}
                        style={{ 
                            flexDirection: events.length > 1 ? 'row' : 'column',
                            width: events.length > 1 ? '1200px' : '468px',
                            borderBottom: events.length > 1 ? '1px solid #E5E5E5' : 'unset',
                        }}
                    >
                        <img
                            src={detail?.location_bg_url}
                            className={styles.locationImage}
                            alt={detail?.location}
                            style={{ 
                                marginRight: events.length > 1 ? '30px' : 'unset'
                            }}
                        />
                        <div>
                            <span className={styles.locationText}>{detail?.location}</span>
                            <div className={styles.infoWrapper}>
                                <div className={styles.infoIcon}><img src={TimerIcon} style={{ width: 16 }} alt="" /></div>
                                <p className={styles.infoText} style={{ fontWeight: 600 }}>
                                    {new Date(detail?.start).toLocaleTimeString('en-US')}-{new Date(detail?.end).toLocaleTimeString('en-US')}
                                </p>
                            </div>
                            <div className={styles.infoWrapper} style={{ marginTop: 10 }}>
                                <div className={styles.infoIcon}><img src={LocationIcon} style={{ width: 13, marginTop: 5, marginLeft: 2, marginRight: 2 }} alt="" /></div>
                                <p className={styles.infoText}>
                                    {detail?.location}
                                </p>
                            </div>
                            <div className={styles.splitterLine} />
                            <p dangerouslySetInnerHTML={{ __html: detail?.description }} className={styles.infoText} />
                            <p className={styles.infoText}>
                                {detail?.registration}
                            </p>
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
                            </div>
                        </div>
                    </div>
                })}
            </Modal.Content>
        </Modal>
    )
}