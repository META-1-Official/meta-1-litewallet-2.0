import logo from "../../images/logo_icon.png";
import styles from "./announcement.module.scss";

import Utils from "../../utils/utils";

export const AnnouncementCard = (props) => {
    return (
        <div className={styles.announcementCard}>
            <div className={styles.info}>
                <h4 onClick={props.onClick}>{props.title}</h4>
                <p>{props.description}</p>
                <div className={styles.time}>
                    {Utils.get_time_diff(props.time)}
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