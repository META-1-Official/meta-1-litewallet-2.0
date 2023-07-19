import React, { useEffect, useState } from 'react';
import styles from "./announcement.module.scss";

import Calendar from 'react-calendar';
import './Calendar.scss';

import { Modal } from "semantic-ui-react";
import TimerIcon from "../../images/timer.png";
import LocationIcon from "../../images/location.png";

export const UpComingEventDetail = (props) => {
    return (
        <Modal
            open={props.isOpen}
            id={"detail-event"}
        >
            <Modal.Content style={{ padding: 0 }}>
                <div className={styles.modalContent} >
                    <img
                        src="https://media.istockphoto.com/id/169960380/photo/downtown-scottsdale-and-suburbs-of-phoenix.jpg?s=1024x1024&w=is&k=20&c=ldM-AWgyZbutOcRFBv74tUqSRWcHLAkNZOHFczwQcfs="
                        className={styles.locationImage}
                    />
                    <span className={styles.locationText}>Scottsdale Arizona</span>
                    <div className={styles.infoWrapper}>
                        <div className={styles.infoIcon}><img src={TimerIcon} style={{ width: 16 }} /></div>
                        <p className={styles.infoText} style={{ fontWeight: 600 }}>
                            Saturday, December 10th, 9:00 AM to 5:00 PM
                        </p>
                    </div>
                    <div className={styles.infoWrapper} style={{ marginTop: 10 }}>
                        <div className={styles.infoIcon}><img src={LocationIcon} style={{ width: 13, marginTop: 5, marginLeft: 2, marginRight: 2 }} /></div>
                        <p className={styles.infoText}>
                            Holiday Inn & Suites Scottsdale North - Airpark
                            14255 North 87th Street, Scottsdale, AZ 85260
                        </p>
                    </div>
                    <div className={styles.splitterLine} />
                    <span className={styles.infoText} style={{ fontWeight: 500, color: '#FC0', lineHeight: '2.0' }}>
                        LUNCH INCLUDED
                    </span>
                    <p className={styles.infoText} style={{ fontWeight: 500 }}>
                        (Bring your favorite dish to share in the pot luck)
                    </p>
                    <p className={styles.infoText}>
                        Free yourself from restraints and subliminal control of corrupt, political and financial overlords. Learn how to claim and secure your Freedom as a living man or woman, and transact in honor while
                        maintaining privacy!
                    </p>
                    <div className={styles.splitterLine} />
                    <div className={styles.actionWrapper}>
                        <button
                            className={styles.actionBtn}
                            onClick={() => console.log('registernow')}
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