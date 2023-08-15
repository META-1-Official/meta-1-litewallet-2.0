import logo from "../../images/logo_icon.png";
import styles from "./announcement.module.scss";

export const AnnouncementCard = (props) => {
    const getTimeDiff = (time) => {
        var diff = time.getTime() - new Date().getTime();

        var msec = diff;
        var hh = Math.floor(msec / 1000 / 60 / 60);
        msec -= hh * 1000 * 60 * 60;
        var mm = Math.floor(msec / 1000 / 60);
        msec -= mm * 1000 * 60;
        var ss = Math.floor(msec / 1000);
        msec -= ss * 1000;

        return hh + ' hours ago';
    }

    return (
        <div className={styles.announcementCard}>
            <div className={styles.info}>
                <h4 onClick={props.onClick}>{props.title}</h4>
                <p>{props.description}</p>
                <div className={styles.time}>
                    {getTimeDiff(new Date(props.time))}
                </div>
            </div>
            <div className={styles.logo}>
                <img
                    style={{ width: "25px", height: "25px" }}
                    src={logo}
                    alt='meta1'
                />
            </div>
        </div>
    )
}