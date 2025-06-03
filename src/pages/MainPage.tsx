import AboutUs from "../components/MainPage/AboutUs";
import Advantages from "../components/MainPage/Advantages";
import Contact from "../components/MainPage/Contact";
import FAQ from "../components/MainPage/FAQ";
import Footer from "../components/MainPage/Footer";
import Header from "../components/commons/Header";
import Hero from "../components/MainPage/Hero";
import PlainsAndPrices from "../components/MainPage/PlainsAndPrices";
import Services from "../components/MainPage/Services";

const MainPage = () => {
  return (
    <>
      <Header />
      <Hero />
      <Services />
      <Advantages />
      <PlainsAndPrices />
      <AboutUs />
      <FAQ />
      <Contact />
      <Footer />
    </>
  );
};

export default MainPage;
