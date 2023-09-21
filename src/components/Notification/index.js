import React, { useEffect, useState, useReducer } from 'react';
import AnnouncementIcon from '../../images/announcements.png';
import EventIcon from '../../images/events.png';
import DepositIcon from '../../images/deposit.png';
import WithdrawlIcon from '../../images/withdrawal.png';
import OrderCreatedIcon from '../../images/order-created.png';
import OrderCancelledIcon from '../../images/order-cancelled.png';
import { useSelector } from 'react-redux';
import { filterNotifications } from '../../utils/common';

import { NotificationItem } from './NotificationItem';
import { NotificationDetailModal } from './NotificationDetailModal';

import styles from "./notification.module.scss";
import { notificationsSelector } from '../../store/account/selector';

const Notification = (props) => {
    const { showAllNotifications } = props;
    const [detail, setDetail] = useState();
    const [notifications, setNotifications] = useState();
    const [modalOpened, setModalOpened] = useState(false);
    const notificationState = useSelector(notificationsSelector);
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

    useEffect(() => {
        setNotifications(filterNotifications(notificationState));
    }, [notificationState]);

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setNotifications(filterNotifications(notificationState));
    //     }, 5000);
    //     return () => clearTimeout(timer);
    // }, []);

    const getItem = (category) => {
        switch (category) {
            case 'Announcements':
                return AnnouncementIcon;
            case 'Events':
                return EventIcon;
            case 'Created Order':
                return OrderCreatedIcon;
            case 'Cancelled Order':
                return OrderCancelledIcon;
            case 'Deposit':
                return DepositIcon;
            case 'Withdraw':
                return WithdrawlIcon;
            case 'Price Change':
                return WithdrawlIcon;
            default:
                return AnnouncementIcon;
        }
    }

    const handleClick = (index) => {
        setDetail(notifications[index]);
        setModalOpened(true);
    }

    const handleModalToggle = (value) => {
        forceUpdate();
        setModalOpened(value);
    }
    return (
        <div className={styles.notificationWrapper}>
            {
                notifications && notifications.map((ele, index) => {
                    return index < 4 && <NotificationItem
                        icon={getItem(ele.category)}
                        title={ele.title}
                        category={ele.category}
                        description={ele.content}
                        time={ele.time}
                        onClick={() => handleClick(index)}
                    />
                })
            }
            <div className={styles.viewAll} onClick={showAllNotifications}>View All Notifications</div>
            <NotificationDetailModal detail={detail} isOpen={modalOpened} setModalOpened={(value) => handleModalToggle(value)} />
        </div>
    )
}

export default Notification;