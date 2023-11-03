import Card from 'react-bootstrap/Card';
import styles from './cards.module.css'
import { Link } from 'react-router-dom';

function Box({cardImage,cardTitle,cardText,cardDestination}) {

  return (
    <Card className={styles.card_customised}>
      <Card.Img variant="top" src={cardImage} />
      <Card.Body>
        <Card.Title>{cardTitle}</Card.Title>
        <Card.Text>
          {cardText}
        </Card.Text>
        <button><Link className="a-css-card" to={cardDestination}>Consult Now</Link></button>
      </Card.Body>
    </Card>
  );
}

export default Box;