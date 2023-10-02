import styles from "./notification.module.scss";

export const NotificationItem = (props) => {
    return (
        <div className={styles.notificationCard} onClick={props.onClick}>
            <div className={styles.logoWrapper}>
                <img
                    src={props.icon}
                    alt='meta1'
                />
            </div>
            <div className={styles.info}>
                <h4>{props.title}</h4>
                <p dangerouslySetInnerHTML={{__html: props.description}} className={styles.contentHtml} />
                <div className={styles.time}>
                    <span>{props.category}</span>
                    <span>{props.time}</span>
                </div>
            </div>
        </div>
    )
}