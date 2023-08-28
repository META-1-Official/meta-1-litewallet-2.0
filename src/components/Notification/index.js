import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import moment from 'moment';
import AnnouncementIcon from '../../images/announcements.png';
import EventIcon from '../../images/events.png';
import DepositIcon from '../../images/deposit.png';
import WithdrawlIcon from '../../images/withdrawal.png';
import OrderCreatedIcon from '../../images/order-created.png';
import OrderCancelledIcon from '../../images/order-cancelled.png';

import { NotificationItem } from './NotificationItem';
import { notificationsSelector } from "../../store/account/selector";

import styles from "./notification.module.scss";

const Notification = () => {
    const [data, setData] = useState();
    const notificationsState = useSelector(notificationsSelector);

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

    const handleClick = (event) => {
        console.log('Click Notification');
    }

    useEffect(() => {
        for (const notification of notificationsState) {
            notification.time = moment(notification.createdAt).fromNow();
        }
        setData(notificationsState);
    }, [notificationsState]);

    return (
        <div className={styles.notificationWrapper}>
            {
                data && data.map((ele, index) => {
                    return index < 4 && <NotificationItem
                        icon={getItem(ele.category)}
                        title={ele.title}
                        category={ele.category}
                        description={ele.content}
                        time={ele.time}
                        onClick={handleClick}
                    />
                })
            }
            <div className={styles.viewAll}>View All Notifications</div>
        </div>
    )
}

export default Notification;