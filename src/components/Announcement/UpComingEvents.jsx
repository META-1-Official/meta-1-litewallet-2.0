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
        return [
            {
                date: 1,
                events: [
                    {
                        title: "Freedom Fest",
                        location: "Colorado City, Arizona",
                        duration: "9:00AM-5:00PM MDT"
                    },
                    {
                        title: "Freedom Fest",
                        location: "Colorado City, Arizona",
                        duration: "9:00AM-5:00PM MDT"
                    }
                ]
            },
            {
                date: 9,
                events: [
                    {
                        title: "Freedom Fest",
                        location: "Colorado City, Arizona",
                        duration: "9:00AM-5:00PM MDT"
                    },
                    {
                        title: "Freedom Fest",
                        location: "Colorado City, Arizona",
                        duration: "9:00AM-5:00PM MDT"
                    }
                ]
            },
            {
                date: 10,
                events: [
                    {
                        title: "Freedom Fest",
                        location: "Colorado City, Arizona",
                        duration: "9:00AM-5:00PM MDT"
                    },
                    {
                        title: "Freedom Fest",
                        location: "Colorado City, Arizona",
                        duration: "9:00AM-5:00PM MDT"
                    }
                ]
            },
            {
                date: 11,
                events: [
                    {
                        title: "Freedom Fest",
                        location: "Colorado City, Arizona",
                        duration: "9:00AM-5:00PM MDT"
                    },
                    {
                        title: "Freedom Fest",
                        location: "Colorado City, Arizona",
                        duration: "9:00AM-5:00PM MDT"
                    }
                ]
            },
            {
                date: 17,
                events: [
                    {
                        title: "Freedom Fest",
                        location: "Colorado City, Arizona",
                        duration: "9:00AM-5:00PM MDT"
                    },
                    {
                        title: "Freedom Fest",
                        location: "Colorado City, Arizona",
                        duration: "9:00AM-5:00PM MDT"
                    }
                ]
            },
            {
                date: 26,
                events: [
                    {
                        title: "Freedom Fest",
                        location: "Colorado City, Arizona",
                        duration: "9:00AM-5:00PM MDT"
                    },
                    {
                        title: "Freedom Fest",
                        location: "Colorado City, Arizona",
                        duration: "9:00AM-5:00PM MDT"
                    }
                ]
            },
        ]
    }

    useEffect(async () => {
        let res = await fetchEventData('July');
        setData(res);
    }, []);

    const prevIcon = <i class="fas fa-chevron-left event" />;
    const nextIcon = <i class="fas fa-chevron-right event" />;

    const eventExistDay = (day) => {
        if (!data) return false;
        return data.filter(ele => ele.date === day).length > 0;
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
                data && data.map(ele => {
                    if (ele.date === dayOfDate) {
                        return ele.events.map((ev, index) => {
                            if (index < 2) {
                                return <div className={styles.cardInfo}>
                                    <div className={styles.title}>{ev.title}</div>
                                    <div className={styles.location}>{ev.location}</div>
                                    <div className={styles.duration}>{ev.duration}</div>
                                </div>
                            }
                        })
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