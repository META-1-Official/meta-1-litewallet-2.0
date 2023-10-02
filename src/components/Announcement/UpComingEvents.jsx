import React, { useEffect, useState } from 'react';
import styles from "./announcement.module.scss";

import Calendar from 'react-calendar';
import './Calendar.scss';
import NoEvent from '../../images/no-event.png';
import { getEventsInMonth } from '../../API/API';

import { UpComingEventDetailModal } from './UpComingEventDetailModal';

export const UpComingEvents = () => {
    const [date, setDate] = useState(new Date());
    const [data, setData] = useState();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [modalOpened, setModalOpened] = useState(false);

    const fetchEventData = async (month) => {
        const res = await getEventsInMonth(month);
        return res;
    }

    useEffect(async () => {
        let res = await fetchEventData(selectedMonth);
        setData(res);
    }, [selectedMonth]);

    const prevIcon = <i class="fas fa-chevron-left" />;
    const nextIcon = <i class="fas fa-chevron-right" />;

    const eventExistDay = (day, month) => {
        if (!data) return false;
        return (month === selectedMonth) && data[day]?.length > 0;
    };

    const renderTile = (activeStartDate, date, view) => {
        let weekOfDate = date.getDay();
        let dayOfDate = date.getDate();
        let month = date.getMonth() + 1;

        let cardBorder = `2px solid ${eventExistDay(dayOfDate, month) ? '#FFC000' : (weekOfDate === 6 || weekOfDate === 0) ? 'red' : 'var(--textBrown)'}`;
        let cardBackground = `${eventExistDay(dayOfDate, month) ? 'linear-gradient(0, rgba(255, 255, 255, 0.00) 0%, rgba(236, 240, 245, 0.50) 100%)' : 'transparent'}`;
        let cardColor = `${eventExistDay(dayOfDate, month) ? '#FFC000' : (weekOfDate === 6 || weekOfDate === 0) ? 'red' : 'var(--textBrown)'}`;
        let events = (eventExistDay(dayOfDate, month) && data && date > activeStartDate) ? data[dayOfDate] : [];
        return <div className={styles.eventCard} style={{ borderTop: cardBorder, background: cardBackground }}>
            <span className={styles.dateText} style={{ color: cardColor }}>{dayOfDate}</span>            
            {
                events && events.map((ev, index) => {
                    if (index < 2) {
                        return <div className={styles.cardInfo}>
                            <div className={styles.title}>{ev.title}</div>
                            <div className={styles.location}>{ev.location}</div>
                            <div className={styles.duration}>{new Date(ev.start).toLocaleTimeString('en-US')}-{new Date(ev.end).toLocaleTimeString('en-US')}</div>
                        </div>
                    }
                })
            }
        </div>
    }

    const handleClick = (value, event) => {
        let dayOfDate = value.getDate();
        let month = value.getMonth() + 1;

        let isValid = eventExistDay(dayOfDate, month);
        isValid && setModalOpened(true);
    }

    const handleViewChange = (e) => {
        setSelectedMonth(e.activeStartDate.getMonth() + 1);
    }

    const handleChange = (value, event) => {
        setDate(value);
    }

    const handleActiveStartDateChange = (e) => {
        setSelectedMonth(e.activeStartDate.getMonth() + 1);
    }

    return (
        <div className={styles.block}>
            <div className={styles.calendarHeader}>
                <span className={styles.headerTitle}>Upcoming Events</span>
            </div>
            <Calendar
                onChange={handleChange}
                value={date}
                allowPartialRange={false}
                view="month"
                prevLabel={prevIcon}
                nextLabel={nextIcon}
                goToRangeStartOnSelect={false}
                onViewChange={handleViewChange}
                tileContent={({ activeStartDate, date, view }) => renderTile(activeStartDate, date, view)}
                onClickDay={handleClick}
                onActiveStartDateChange={handleActiveStartDateChange}
            />
            <UpComingEventDetailModal data={data} date={date} isOpen={modalOpened} setModalOpened={(value) => setModalOpened(value)} />
        </div>
    )
}