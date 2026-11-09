import { motion, useScroll, useSpring } from "framer-motion";
import SmoothScroll from "./components/SmoothScroll.jsx";
import Cursor from "./components/Cursor.jsx";
import Atmosphere from "./components/Atmosphere.jsx";
import Marquee from "./components/Marquee.jsx";
import Nav from "./sections/Nav.jsx";
import Hero from "./sections/Hero.jsx";
import Manifesto from "./sections/Manifesto.jsx";
import Archive from "./sections/Archive.jsx";
import Stats from "./sections/Stats.jsx";
import TasteScore from "./sections/TasteScore.jsx";
import Details from "./sections/Details.jsx";
import Ritual from "./sections/Ritual.jsx";
import Product from "./sections/Product.jsx";
import Bento from "./sections/Bento.jsx";
import FinalCTA from "./sections/FinalCTA.jsx";
import Footer from "./sections/Footer.jsx";
import Museum from "./components/Museum.jsx";
import { MEALS } from "./data/content.js";
import "./components/Atmosphere.css";
import "./components/fx.css";
import "./components/shared.css";

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 110, damping: 30, mass: 0.35 });

  const dishes = MEALS.map((m) => m.name);
  const phrases = ["Keep the good ones", "Order again", "Good food, remembered", "Taste 0 – 100", "Your private vault", "A second life"];

  return (
    <>
      <SmoothScroll />
      <Cursor />
      <Atmosphere />
      <div className="grain" aria-hidden="true" />
      <motion.div className="progress" style={{ scaleX }} aria-hidden="true" />

      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Marquee items={dishes} speed={46} />
        <Archive />
        <Stats />
        <TasteScore />
        <Details />
        <Ritual />
        <Product />
        <Bento />
        <Marquee items={phrases} speed={52} reverse />
        <FinalCTA />
      </main>
      <Footer />
      <Museum />
    </>
  );
}
