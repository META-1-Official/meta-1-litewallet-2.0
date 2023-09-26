import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { AnnouncementCard } from './AnnouncementCard';
import { AnnouncementDetailModal } from './AnnouncementDetailModal';
import styles from "./announcement.module.scss";

import { getAllAnnouncements } from '../../API/API';

export const Announcement = (props) => {
    const [data, setData] = useState();
    const [index, setIndex] = useState(0);
    const [modalOpened, setModalOpened] = useState(false);

    const handleClick = (index) => {
        setIndex(index);
        setModalOpened(true);
    }

    useEffect(async () => {
        let res = await getAllAnnouncements();
        setData(res);
    }, []);

    return (
        <div>
            {
                data ? data.map((ele, index) => {
                    return index < 3 && <AnnouncementCard
                        title={ele.title}
                        description={ele.description}
                        time={moment(ele.created_at).fromNow()}
                        onClick={() => handleClick(index)}
                    />
                }) : <div>No Annoucement</div>
            }
            <div className={styles.viewAll} onClick={() => props.setActiveScreen('announcements')}>View All Announcements</div>
            <AnnouncementDetailModal data={data} index={index} isOpen={modalOpened} setModalOpened={(value) => setModalOpened(value)} />
        </div>
    )
}