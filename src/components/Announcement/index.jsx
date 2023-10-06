import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { AnnouncementCard } from './AnnouncementCard';
import { AnnouncementDetailModal } from './AnnouncementDetailModal';
import { isLoginSelector } from "../../store/account/selector";
import { useSelector } from "react-redux";

import MetaLoader from "../../UI/loader/Loader";

import styles from "./announcement.module.scss";

import { getAllAnnouncements } from '../../API/API';

export const Announcement = (props) => {
    const [data, setData] = useState();
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [modalOpened, setModalOpened] = useState(false);
    const isLoginState = useSelector(isLoginSelector);

    const handleClick = (index) => {
        setIndex(index);
        setModalOpened(true);
    }

    useEffect(async () => {
        setLoading(true);
        let res = await getAllAnnouncements();
        setData(res);
        setLoading(false);
    }, []);

    return (
        <div>
            {
                isLoginState === false ? <div>Need to login</div> : loading ? <MetaLoader size="mini" /> : data ? data.map((ele, index) => {
                    return index < 3 && <AnnouncementCard
                        title={ele.title}
                        description={ele.description}
                        time={moment(ele.created_at).fromNow()}
                        onClick={() => handleClick(index)}
                        viewMode="feed"
                    />
                }) : <div>No Annoucement</div>
            }
            {isLoginState === true && <div className={styles.viewAll} onClick={() => props.setActiveScreen('announcements')}>View All Announcements</div>}
            <AnnouncementDetailModal data={data} index={index} isOpen={modalOpened} setModalOpened={(value) => setModalOpened(value)} />
        </div>
    )
}