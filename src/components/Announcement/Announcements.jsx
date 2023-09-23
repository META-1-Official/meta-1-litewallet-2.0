import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { AnnouncementCard } from './AnnouncementCard';
import { AnnouncementDetailModal } from './AnnouncementDetailModal';
import Pagination from '@mui/material/Pagination';
import styles from './announcement.module.scss';

import { getAllAnnouncements } from '../../API/API';

const Announcements = (props) => {
    const [data, setData] = useState();
    const [index, setIndex] = useState(0);
    const [modalOpened, setModalOpened] = useState(false);
    const [page, setPage] = useState(1);

    const handleClick = (index) => {
        setIndex(index);
        setModalOpened(true);
    }

    useEffect(async () => {
        let res = await getAllAnnouncements();
        setData(res);
    }, []);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <div className={styles.announcementsWrapper}>
            {
                data ? data.map((ele, index) => {
                    if (index >= page * 10 && (page + 1) * 10 > index) {
                    return <AnnouncementCard
                        title={ele.title}
                        description={ele.description}
                        time={moment(ele.announced_time).fromNow()}
                        onClick={() => handleClick(index)}
                    />
                }}) : <div>No Annoucement</div>
            }
            {data && <Pagination count={Math.floor(data.length / 10)} page={page} onChange={handlePageChange} />}
            <AnnouncementDetailModal data={data} index={index} isOpen={modalOpened} setModalOpened={(value) => setModalOpened(value)} />
        </div>
    )
}

export default Announcements;