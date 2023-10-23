import React, { useEffect } from 'react';
import styles from "./notification.module.scss";
import { Modal } from "semantic-ui-react";
import { useDispatch, useSelector } from 'react-redux';
import { accountsSelector } from "../../store/account/selector";


import NotiIcon from "../../images/notification.png";
import { getNotificationsRequest } from '../../store/account/actions';

export const NotificationDetailModal = (props) => {
  const detail = props.detail;
  const dispatch = useDispatch();
  const accountNameState = useSelector(accountsSelector);

  const handleClick = () => {
    props.setModalOpened(false);
  };

  useEffect(() => {
    if (props.detail) {
      let readNotifications = JSON.parse(localStorage.getItem('readNotifications')) ?? [];
      if (!readNotifications.includes(props.detail.id))
        readNotifications.push(props.detail.id);
      localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
      dispatch(getNotificationsRequest({login: accountNameState}));
    }
  }, [props.detail?.id]);

  return (
    <>
      {detail ? <Modal
        open={props.isOpen}
        id={"detail-notification"}
      >
        <Modal.Content style={{ padding: 0 }}>
          <div className={styles.notificationModalContent} >
            <div className={styles.modalHeader}>
              <div className={styles.left}>
                <div className={styles.iconWrapper}>
                  <img src={NotiIcon} />
                </div>
                <div className={styles.titleWrapper}>
                  <span className={styles.title}>{detail?.category ?? 'Notification'}</span>
                  <div className={styles.time}>{detail?.time}</div>
                </div>
              </div>
              <div className={styles.cancelBtn} onClick={handleClick}>X</div>
            </div>
            <div className={styles.modalBody}>
              <p>{detail?.content}</p>
            </div>
          </div>
        </Modal.Content>
      </Modal> : <div></div>
      }
    </>
  )
}