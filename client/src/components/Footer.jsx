import styles from '../Styles/Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p className={styles.text}>
          &copy; {new Date().getFullYear()} Healio. All rights reserved.
        </p>
        <ul className={styles.links}>
          <li>
            <a href="https://github.com/sohith18/Health-Care" target="_blank"
              rel="noopener noreferrer" className={styles.link}>
              About Us
            </a>
          </li>
          <li>
            <a href="https://www.iiitb.ac.in/" target="_blank"
              rel="noopener noreferrer" className={styles.link}>
              Contact
            </a>
          </li>
          <li>
            <a href="https://www.freeprivacypolicy.com/live/b0c21ae5-5411-4346-90c5-1b851eb88806" target="_blank"
              rel="noopener noreferrer" className={styles.link}>
              Privacy Policy
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
