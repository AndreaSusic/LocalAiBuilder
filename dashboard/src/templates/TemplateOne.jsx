import React from "react";
import data from "../data/home-v1.json";
import Hero from "../components/sections/Hero";
import Features from "../components/sections/Features";
import Services from "../components/sections/Services";
import Testimonials from "../components/sections/Testimonials";
import Team from "../components/sections/Team";
import Gallery from "../components/sections/Gallery";
import ContactMap from "../components/sections/ContactMap";
import SecondaryCTA from "../components/sections/SecondaryCTA";
import Footer from "../components/sections/Footer";

export default function TemplateOne() {
  return (
    <>
      <Hero data={data.hero} />
      <Features data={data.features} />
      <Services data={data.services} />
      <Testimonials data={data.testimonials} />
      <Team data={data.team} />
      <Gallery data={data.gallery} />
      <ContactMap data={data.contact} />
      <SecondaryCTA data={data.cta} />
      <Footer data={data.footer} />
    </>
  );
}