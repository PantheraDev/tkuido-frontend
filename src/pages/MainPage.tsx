import { useEffect } from "react";
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
  useEffect(() => {
    const scrollToHashSection = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;

      const targetSection = document.getElementById(hash);
      if (!targetSection) return;

      const stickyHeaderOffset = 96;
      const top =
        targetSection.getBoundingClientRect().top +
        window.scrollY -
        stickyHeaderOffset;

      window.scrollTo({ top, behavior: "smooth" });
    };

    scrollToHashSection();
    window.addEventListener("hashchange", scrollToHashSection);

    return () => window.removeEventListener("hashchange", scrollToHashSection);
  }, []);

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
