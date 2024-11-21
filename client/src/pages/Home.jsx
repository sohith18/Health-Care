import Hero from '../components/Hero';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.css';
import DoctorBoxes from '../components/DoctorBoxes';
import Reviews from '../components/Reviews';
import Footer from '../components/Footer';


export default function Home() {
  return (
    <>
      <Hero/>
      <DoctorBoxes />
      <Reviews />
      <Footer />
    </> 
  )
}
