import logo from "../../images/logo_icon.png";
import styles from "./announcement.module.scss";

export const AnnouncementCard = (props) => {
    return (
        <div className={styles.announcementCard} onClick={props.onClick}>
            <div className={styles.info}>
                <h4>{props.title}</h4>
                {props.viewMode === 'all' && <p dangerouslySetInnerHTML={{__html: props.description}} />}
                <div className={styles.time}>
                    {props.time}
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