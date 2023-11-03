import Carousel from 'react-bootstrap/Carousel';
import photo1 from '../assets/availablenew.jpg'
import photo2 from '../assets/Slider_img1.jpg'
import photo3 from '../assets/Physician.jpg'


export default function Slider({slides}) {
  return (
    <Carousel>
      
      <Carousel.Item >
        <img
          className="d-block w-100"
          src={photo1}
          alt="Photo"
        />

        <Carousel.Caption>
          <h3></h3>
          <p></p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item >
        <img
          className="d-block w-100"
          src={photo2}
          alt="Photo"
        />

        <Carousel.Caption>
          <h3></h3>
          <p></p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img
          className="d-block w-100"
          src={photo3}
          alt="Photo"
        />

        <Carousel.Caption>
          <h3></h3>
          <p></p>
        </Carousel.Caption>
      </Carousel.Item>
      
    </Carousel>
  );
}

