import React, { useEffect, useState, useReducer } from 'react';
import AnnouncementIcon from '../../images/announcements.png';
import EventIcon from '../../images/events.png';
import DepositIcon from '../../images/deposit.png';
import WithdrawlIcon from '../../images/withdrawal.png';
import OrderCreatedIcon from '../../images/order-created.png';
import OrderCancelledIcon from '../../images/order-cancelled.png';
import PriceChangeIcon from '../../images/price-change.png';
import SendIcon from '../../images/send.png';
import ReceiveIcon from '../../images/receive.png';
import NotificationTimeIcon from '../../images/notification-time.png';
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import { NotificationDetailModal } from './NotificationDetailModal';
import { notificationsSelector, accountsSelector } from '../../store/account/selector';
import { useSelector } from 'react-redux';
import { filterNotifications } from '../../utils/common';
import Pagination from '@mui/material/Pagination';

import styles from "./notification.module.scss";
import "./notification.css";

const Notifications = (props) => {
    const [detail, setDetail] = useState(0);
    const [modalOpened, setModalOpened] = useState(false);
    const [notifications, setNotifications] = useState();
    const notificationState = useSelector(notificationsSelector);
    const account = useSelector(accountsSelector);
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(1);

    useEffect(() => {
        initData();
    }, [notificationState])

    useEffect(() => {
        const timer = setTimeout(() => {
            initData();
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    const initData = () => {
        let filtered = filterNotifications(notificationState, account);
        let count = filtered.length % 10 === 0 ? Math.floor(filtered.length / 10) : Math.floor(filtered.length / 10) + 1;
        setNotifications(filtered);
        setCount(count);
        if (page >= count) {
            setPage(count);
        }
    }

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
            case 'Send':
                return SendIcon;
            case 'Receive':
                return ReceiveIcon;
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

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <div className={styles.notifications}>
            <div className={styles.notificationsWrapper}>
                {
                    (notifications && notifications.length > 0) ? notifications.map((ele, index) => {
                        if (index >= (page - 1) * 10 && (page) * 10 > index) {
                            var d = new Date(ele.createdAt);
                            return (<div className={styles.notificationCard} onClick={() => handleClick(index)}>
                                <div className={styles.logoWrapper}>
                                    <img
                                        style={{ width: "30px", height: "30px" }}
                                        src={getItem(ele.category)}
                                        alt='meta1'
                                    />
                                </div>
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
                        }
                    }) : <div>No Notifications</div>
                }
                {(notifications && notifications.length > 0) && <Pagination count={count} page={page} onChange={handlePageChange} />}
            </div>
            <Tooltip id="time-tooltip" style={{ backgroundColor: "rgb(80, 80, 80)" }} />
            <NotificationDetailModal detail={detail} isOpen={modalOpened} setModalOpened={(value) => handleModalToggle(value)} />
        </div>
    )
}

export default Notifications;