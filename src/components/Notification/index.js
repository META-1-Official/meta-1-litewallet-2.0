import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import moment from 'moment';
import NotiIcon1 from '../../images/announcement1.png';
import NotiIcon2 from '../../images/announcement2.png';

import { NotificationItem } from './NotificationItem';
import { notificationsSelector } from "../../store/account/selector";

import styles from "./notification.module.scss";

const Notification = () => {
    const [data, setData] = useState();
    const [selectedData, setSelectedData] = useState(null);
    const notificationsState = useSelector(notificationsSelector)

    const fetchNotificationData = async () => {
        return [
            {
                type: 1,
                title: "Ambassador New Opportunity Call",
                description: "Lorem Ipsum is simply dummy text of the printing and type setting industry. Lorem Ipsum has been the industry's standard dummy text .",
                time: "1 Minute Ago"
            },
            {
                type: 1,
                title: "Ambassador New Opportunity Call",
                description: "Lorem Ipsum is simply dummy text of the printing and type setting industry. Lorem Ipsum has been the industry's standard dummy text .",
                time: "1 Minute Ago"
            },
            {
                type: 2,
                title: "Ambassador New Opportunity Call",
                description: "Lorem Ipsum is simply dummy text of the printing and type setting industry. Lorem Ipsum has been the industry's standard dummy text .",
                time: "1 Minute Ago"
            },
            {
                type: 2,
                title: "Ambassador New Opportunity Call",
                description: "Lorem Ipsum is simply dummy text of the printing and type setting industry. Lorem Ipsum has been the industry's standard dummy text .",
                time: "1 Minute Ago"
            },
            {
                type: 1,
                title: "Ambassador New Opportunity Call",
                description: "Lorem Ipsum is simply dummy text of the printing and type setting industry. Lorem Ipsum has been the industry's standard dummy text .",
                time: "1 Minute Ago"
            }
        ]
    }

    const getItem = (type) => {
        switch (type) {
            case 'ANNOUNCEMENTS':
                return NotiIcon1;
            case 'EVENTS':
                return NotiIcon2;
            default:
                return NotiIcon1;
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
                        icon={getItem(ele.type)}
                        title={ele.title}
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