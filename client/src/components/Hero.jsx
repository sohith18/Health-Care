import photo1 from '../assets/Hero1.jpg'
import { Take_to_Chat } from '../Controllers/HomeController';
import classes from '../Styles/Hero.module.css';



export default function Hero() {
  return(
    <div>
      <img src={photo1} alt="Hero" className={classes.img}/>
      <div className={classes.text}>
        <h1>Feeling Unwell?</h1>
        <p>Click below to connect with our expert team today!</p>
        <button className={classes.button} type='submit' onClick={Take_to_Chat}> Get Help Now</button>
      </div>
      
    </div>
  )
}

{/*// <Carousel>
      
    //   <Carousel.Item >
    //     <img
    //       className="d-block w-100"
    //       src={photo1}
    //       alt="Photo"
    //     />

    //     <Carousel.Caption>
    //       <h3></h3>
    //       <p></p>
    //     </Carousel.Caption>
    //   </Carousel.Item>

    //   <Carousel.Item >
    //     <img
    //       className="d-block w-100"
    //       src={photo2}
    //       alt="Photo"
    //     />

    //     <Carousel.Caption>
    //       <h3></h3>
    //       <p></p>
    //     </Carousel.Caption>
    //   </Carousel.Item>

    //   <Carousel.Item>
    //     <img
    //       className="d-block w-100"
    //       src={photo3}
    //       alt="Photo"
    //     />

    //     <Carousel.Caption>
    //       <h3></h3>
    //       <p></p>
    //     </Carousel.Caption>
    //   </Carousel.Item>
      
    // </Carousel> */}
