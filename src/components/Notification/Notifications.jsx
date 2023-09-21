import React, { useEffect, useState, useReducer } from 'react';
import AnnouncementIcon from '../../images/announcements.png';
import EventIcon from '../../images/events.png';
import DepositIcon from '../../images/deposit.png';
import WithdrawlIcon from '../../images/withdrawal.png';
import OrderCreatedIcon from '../../images/order-created.png';
import OrderCancelledIcon from '../../images/order-cancelled.png';
import PriceChangeIcon from '../../images/price-change.png';
import NotificationTimeIcon from '../../images/notification-time.png';
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import { NotificationDetailModal } from './NotificationDetailModal';
import { notificationsSelector } from '../../store/account/selector';
import { useSelector } from 'react-redux';
import { filterNotifications } from '../../utils/common';

import styles from "./notification.module.scss";

const Notifications = (props) => {
    const [detail, setDetail] = useState(0);
    const [modalOpened, setModalOpened] = useState(false);
    const [notifications, setNotifications] = useState();
    const notificationState = useSelector(notificationsSelector);
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

    useEffect(() => {
        setNotifications(filterNotifications(notificationState));
    }, [notificationState])

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

    const handleClick = (index) => {
        setDetail(notifications[index]);
        setModalOpened(true);
    }

    const handleModalToggle = (value) => {
        forceUpdate();
        setModalOpened(value);
    }
    
    return (
        <div className={styles.notifications}>
            {
                notifications && notifications.map((ele, index) => {
                    var d = new Date(ele.createdAt);
                    return (<div className={styles.notificationCard} onClick={() => handleClick(index)}>
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
                                        data-tooltip-id="time-tooltip"
                                        data-tooltip-content={d.toLocaleString()}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>)
                })
            }
            <Tooltip id="time-tooltip" style={{ backgroundColor: "rgb(80, 80, 80)" }} />
            <NotificationDetailModal detail={detail} isOpen={modalOpened} setModalOpened={(value) => handleModalToggle(value)} />
        </div>
    )
}

export default Notifications;