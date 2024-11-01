import Hero from '../components/Hero';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.css';
import Box from '../components/Cards';
import photo1 from '../assets/cough.png';
import photo2 from '../assets/depression.png';
import photo3 from '../assets/eye.png';
import photo4 from '../assets/pigment.png';
import DoctorBoxes from '../components/DoctorBoxes';


export default function Home() {
  return (
    <>
      <Hero/>
      <DoctorBoxes />
    </>
  )
}
