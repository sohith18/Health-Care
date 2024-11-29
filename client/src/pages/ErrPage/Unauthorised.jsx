import styles from "../../Styles/Unauthorised.module.css";

export default function Unauthorized() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Access Denied</h1>
            <p className={styles.message}>
                You do not have the necessary permissions to view this page.
            </p>
        </div>
    );
}
