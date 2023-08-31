import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import moment from 'moment';
import AnnouncementIcon from '../../images/announcements.png';
import EventIcon from '../../images/events.png';
import DepositIcon from '../../images/deposit.png';
import WithdrawlIcon from '../../images/withdrawal.png';
import OrderCreatedIcon from '../../images/order-created.png';
import OrderCancelledIcon from '../../images/order-cancelled.png';
import PriceChangeIcon from '../../images/price-change.png';
import NotificationTimeIcon from '../../images/notification-time.png';

import { NotificationItem } from './NotificationItem';
import { notificationsSelector } from "../../store/account/selector";

import styles from "./notification.module.scss";

const Notifications = (props) => {
    const [data, setData] = useState();
    const notificationsState = useSelector(notificationsSelector);
    const { showAllNotifications } = props;


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
                return PriceChangeIcon;
            default:
                return AnnouncementIcon;
        }
    }

    const handleClick = (id) => {
        let unreadNotifications = [];
        if (localStorage.getItem('unreadNotifications'))
            unreadNotifications = JSON.parse(localStorage.getItem('unreadNotifications'));

        if (unreadNotifications.indexOf(id) > -1) {
            unreadNotifications.splice(unreadNotifications.indexOf(id), 1);
        }
        localStorage.setItem('unreadNotifications', JSON.stringify(unreadNotifications));
    }

    useEffect(() => {
        for (const notification of notificationsState) {
            notification.time = moment(notification.createdAt).fromNow();
        }
        setData(notificationsState);
    }, [notificationsState]);


    return (
        <div className={styles.notifications}>
            <p className={styles.allNotifications}> All Notifications </p>
            {
                data && data.map((ele, index) => {
                     return (<div className={styles.allNotifcationsCard} onClick={() => handleClick(ele.id)}>
                        <img
                            style={{ width: "40px", height: "40px" }}
                            src={getItem(ele.category)}
                            alt='meta1'
                        />
                        <div className={styles.info}>
                            
                            <div className={styles.time}>
                                <div>
                                    <h4>{ele.category}</h4>
                                    <p>{ele.content}</p>
                                </div>
                                <div>
                                <span>{ele.time}</span>
                                <img
                                    style={{ width: "20px", height: "20px", marginLeft: '10px' }}
                                    src={NotificationTimeIcon}
                                    alt='meta1'
                                />
                                </div>
                            </div>
                        </div>
                    </div>)       
                })
            }
        </div>
    )
}

export default Notifications;