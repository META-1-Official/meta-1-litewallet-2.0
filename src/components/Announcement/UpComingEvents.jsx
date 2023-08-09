import React, { useEffect, useState } from 'react';
import styles from "./announcement.module.scss";

import Calendar from 'react-calendar';
import './Calendar.scss';

import { UpComingEventDetailModal } from './UpComingEventDetailModal';

export const UpComingEvents = () => {
    const [value, onChange] = useState(new Date());
    const [data, setData] = useState();
    const [selectedData, setSelectedData] = useState(null);
    const [modalOpened, setModalOpened] = useState(false);

    const fetchEventData = async (month) => {
        return {
            "5": [
                {
                    "id": 1,
                    "title": "Scottsdale Arizona",
                    "description": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
                    "location_bg_url": "https://media.istockphoto.com/id/169960380/photo/downtown-scottsdale-and-suburbs-of-phoenix.jpg?s=1024x1024&w=is&k=20&c=ldM-AWgyZbutOcRFBv74tUqSRWcHLAkNZOHFczwQcfs=",
                    "location": "Holiday Inn & Suites Scottsdale North - Airpark 14255 North 87th Street, Scottsdale, AZ 85260",
                    "registration": "",
                    "start": "2023-08-05T00:00:00.000Z",
                    "end": "2023-08-05T04:00:00.000Z",
                    "plus_title": "LUNCH INCLUDED",
                    "plus_description": "(Bring your favorite dish to share in the pot luck)",
                    "created_at": "2023-08-02T10:57:10.486Z",
                    "updated_at": "2023-08-02T10:57:10.486Z"
                }
            ],
            "31": [
                {
                    "id": 2,
                    "title": "Scottsdale Arizona",
                    "description": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
                    "location_bg_url": "https://media.istockphoto.com/id/169960380/photo/downtown-scottsdale-and-suburbs-of-phoenix.jpg?s=1024x1024&w=is&k=20&c=ldM-AWgyZbutOcRFBv74tUqSRWcHLAkNZOHFczwQcfs=",
                    "location": "Holiday Inn & Suites Scottsdale North - Airpark 14255 North 87th Street, Scottsdale, AZ 85260",
                    "registration": "",
                    "start": "2023-08-30T16:00:00.000Z",
                    "end": "2023-08-30T17:00:00.000Z",
                    "plus_title": "LUNCH INCLUDED",
                    "plus_description": "(Bring your favorite dish to share in the pot luck)",
                    "created_at": "2023-08-08T18:08:57.485Z",
                    "updated_at": "2023-08-08T18:08:57.485Z"
                }
            ]
        }
    }

    useEffect(async () => {
        let res = await fetchEventData('08');
        setData(res);
    }, []);

    const prevIcon = <i class="fas fa-chevron-left event" />;
    const nextIcon = <i class="fas fa-chevron-right event" />;

    const eventExistDay = (day) => {
        if (!data) return false;
        return data[day].length > 0;
    };

    const renderTile = (activeStartDate, date, view) => {
        let weekOfDate = date.getDay();
        let dayOfDate = date.getDate();
        let cardBorder = `2px solid ${eventExistDay(dayOfDate) ? '#FFC000' : (weekOfDate === 6 || weekOfDate === 0) ? 'red' : 'black'}`;
        let cardBackground = `${eventExistDay(dayOfDate) ? 'linear-gradient(0, rgba(255, 255, 255, 0.00) 0%, rgba(236, 240, 245, 0.50) 100%)' : 'transparent'}`;
        let cardColor = `${eventExistDay(dayOfDate) ? '#FFC000' : (weekOfDate === 6 || weekOfDate === 0) ? 'red' : 'black'}`;
        return <div className={styles.eventCard} style={{ borderTop: cardBorder, background: cardBackground }}>
            <span className={styles.dateText} style={{ color: cardColor }}>{dayOfDate}</span>
            {
                data[dayOfDate] && data[dayOfDate].map((ev, index) => {
                    if (index < 2) {
                        return <div className={styles.cardInfo}>
                            <div className={styles.title}>{ev.title}</div>
                            <div className={styles.location}>{ev.location}</div>
                            <div className={styles.duration}>{ev.start}</div>
                        </div>
                    }
                })
            }
        </div>
    }

    const handleClick = (value, event) => {
        let dayOfDate = value.getDate();

        let isValid = eventExistDay(dayOfDate);
        isValid && setModalOpened(true);
    }

    return (
        <div className={styles.block}>
            <div className={styles.calendarHeader}>
                <span className={styles.headerTitle}>Upcoming Events</span>
                <button className={styles.addEvBtn}>Add Events</button>
            </div>
            <Calendar
                onChange={onChange}
                value={value}
                allowPartialRange={false}
                view="month"
                prevLabel={prevIcon}
                nextLabel={nextIcon}
                goToRangeStartOnSelect={false}
                onViewChange={() => console.log('view change')}
                tileContent={({ activeStartDate, date, view }) => renderTile(activeStartDate, date, view)}
                onClickDay={handleClick}
            />
            <UpComingEventDetailModal data={data} isOpen={modalOpened} setModalOpened={(value) => setModalOpened(value)} />
        </div>
    )
}