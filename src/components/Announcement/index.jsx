import React, { useEffect, useState } from 'react';

import { AnnouncementCard } from './AnnouncementCard';
import { AnnouncementDetailModal } from './AnnouncementDetailModal';

export const Announcement = () => {
    const [data, setData] = useState();
    const [selectedData, setSelectedData] = useState(null);
    const [modalOpened, setModalOpened] = useState(false);

    const fetchAnnouncementsData = async (month) => {
        return [
            {
                title: "Ambassador New Opportunity Call Schedule",
                description: "Lorem Ipsum is simply dummy text of the printing and type setting industry. Lorem Ipsum has been the industry's standard dummy text .",
                time: "1 Hour Ago"
            },
            {
                title: "Ambassador New Opportunity Call Schedule",
                description: "Lorem Ipsum is simply dummy text of the printing and type setting industry. Lorem Ipsum has been the industry's standard dummy text .",
                time: "1 Hour Ago"
            },
            {
                title: "Ambassador New Opportunity Call Schedule",
                description: "Lorem Ipsum is simply dummy text of the printing and type setting industry. Lorem Ipsum has been the industry's standard dummy text .",
                time: "1 Hour Ago"
            },
            {
                title: "Ambassador New Opportunity Call Schedule",
                description: "Lorem Ipsum is simply dummy text of the printing and type setting industry. Lorem Ipsum has been the industry's standard dummy text .",
                time: "1 Hour Ago"
            },
            {
                title: "Ambassador New Opportunity Call Schedule",
                description: "Lorem Ipsum is simply dummy text of the printing and type setting industry. Lorem Ipsum has been the industry's standard dummy text .",
                time: "1 Hour Ago"
            }
        ]
    }

    const handleClick = (event) => {
        setModalOpened(true);
    }

    useEffect(async () => {
        let res = await fetchAnnouncementsData('July');
        setData(res);
    }, []);

    return (
        <div>
            {
                data && data.map((ele, index) => {
                    return index < 3 && <AnnouncementCard
                        title={ele.title}
                        description={ele.description}
                        time={ele.time}
                        onClick={handleClick}
                    />
                })
            }
            <AnnouncementDetailModal data={data} isOpen={modalOpened} setModalOpened={(value) => setModalOpened(value)} />
        </div>
    )
}