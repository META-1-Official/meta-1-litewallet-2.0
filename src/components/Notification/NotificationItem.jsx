import styles from "./notification.module.scss";

export const NotificationItem = (props) => {
    return (
        <div className={styles.notificationCard} onClick={props.onClick}>
            <img
                style={{ width: "40px", height: "40px" }}
                src={props.icon}
                alt='meta1'
            />
            <div className={styles.info}>
                <h4>{props.title}</h4>
                <p>{props.description}</p>
                <div className={styles.time}>
                    <span>{props.category}</span>
                    <span>{props.time}</span>
                </div>
            </div>
        </div>
    )
}