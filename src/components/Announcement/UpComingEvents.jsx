import React, { useState } from 'react';
import styles from "./announcement.module.scss";

import Calendar from 'react-calendar';
import './Calendar.scss';

import prevIcon from '../../images/prev.png';
import nextIcon from '../../images/next.png';

export const UpComingEvents = () => {
    const [value, onChange] = useState(new Date());

    const prevIcon = <i class="fas fa-chevron-left event" />;
    const nextIcon = <i class="fas fa-chevron-right event" />;
    const titleContent = <div className={styles.eventCard}>
        style
    </div>

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
                tileContent={titleContent}
            />
        </div>
    )
}