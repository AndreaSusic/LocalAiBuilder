import React, { useState } from "react";
import Menu from "../components/sections/Menu.jsx";
import Footer from "../components/sections/Footer.jsx";

// Token schema for reusability
export const serviceTokens = {
  slug: "invisalign",
  companyName: "YourPractice",
  heroBg: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1740&q=60",
  heroTitle: "Invisalign® Clear Aligners",
  heroText: [
    "Discreet, removable and digitally-planned orthodontics tailored for busy adults.",
    "No brackets, no wires — just comfortable, crystal-clear trays that fit your lifestyle.",
    "Eat what you love, brush normally, and watch your smile transform week by week.",
    "Start your journey today with Austin's most trusted Invisalign® provider."
  ],
  ctaLabel: "Schedule Now",

  painPoints: [
    {emoji:"😬", title:"Metal-Mouth Worries",
     copy:"You want straight teeth but can't stand the idea of bulky brackets and wires affecting your confidence at work or school."},
    {emoji:"⌛", title:"No Time for Adjustments",
     copy:"Busy careers (and kids!) leave little room for frequent tightening visits and emergency wire repairs."},
    {emoji:"🍿", title:"Food Limitations",
     copy:"Popcorn, apples, caramel – traditional braces force you to give up the foods you love for years on end."}
  ],

  benefits: [
    {icon:"🦷", title:"Nearly Invisible",
     copy:"Crystal-clear trays keep treatment our little secret – no brackets or wires."},
    {icon:"🍎", title:"Eat Anything",
     copy:"Simply remove your aligners at mealtimes – enjoy popcorn, pizza or apples freely."},
    {icon:"⏱️", title:"Fewer Appointments",
     copy:"Check-ups every 6–8 weeks mean less time in the chair and more living life."},
    {icon:"✨", title:"Predictable Results",
     copy:"Digital 3-D planning shows your future smile before we even begin."}
  ],

  beforeImg: "https://images.unsplash.com/photo-1658849350672-7a708745b68e?w=900&auto=format&fit=crop&q=60",
  afterImg: "https://images.unsplash.com/photo-1660732205495-f65510d8180e?w=900&auto=format&fit=crop&q=60",

  testimonials: [
    {avatar:"https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=96&q=60",
     text:"I never imagined straightening my teeth could be this comfortable. Zero metal-mouth drama!",
     name:"Samantha K.", stars:5},
    {avatar:"https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=96&q=60",
     text:"The 3-D simulation sold me right away – and my real smile looks even better!",
     name:"Daniel R.", stars:5}
  ],

  faqs: [
    {q:"How long does Invisalign® take?",
     a:"Most cases finish within 6-14 months, depending on complexity and how diligently you wear the trays."},
    {q:"Is it painful?",
     a:"Expect gentle pressure the first day of a new tray; patients report far less discomfort than braces."},
    {q:"Will insurance cover Invisalign®?",
     a:"Many orthodontic policies apply. We'll check your benefits and offer flexible payment plans if needed."}
  ],

  similar: [
    {title:"Teeth Whitening", img:"https://images.unsplash.com/photo-1674775372064-8c75d3f8c757?w=900&auto=format&fit=crop&q=60", href:"#"},
    {title:"Cosmetic Veneers", img:"https://plus.unsplash.com/premium_photo-1661768571778-52173afa5a74?w=900&auto=format&fit=crop&q=60", href:"#"},
    {title:"Dental Implants", img:"https://plus.unsplash.com/premium_photo-1674998806375-58edc35ddf3b?w=900&auto=format&fit=crop&q=60", href:"#"}
  ],

  practice: {
    name: "YourPractice",
    address: "123 Dental St, Austin, TX 78701",
    phone: "+1 234 567 89",
    mapEmbed: "https://maps.google.com/maps?q=austin%20dentist&t=&z=13&ie=UTF8&iwloc=&output=embed"
  }
};

// Hero Component
const Hero = ({ tokens }) => (
  <section style={{
    position: "relative",
    backgroundImage: `url('${tokens.heroBg}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    textAlign: "center",
    padding: "6rem 1rem",
    color: "white"
  }}>
    <div style={{
      content: "",
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.4)",
      zIndex: 1
    }} />
    <div style={{ position: "relative", zIndex: 2, margin: "0 auto", padding: "0 2rem" }}>
      <h1 style={{
        fontSize: "3.5rem",
        marginBottom: "2rem",
        color: "white",
        fontFamily: "var(--font-heading)"
      }}>
        {tokens.heroTitle}
      </h1>
      {tokens.heroText.map((text, i) => (
        <p key={i} style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
          {text}
        </p>
      ))}
      <button style={{
        background: "var(--secondary)",
        color: "var(--text)",
        border: "none",
        padding: "0.75rem 1.5rem",
        borderRadius: "4px",
        fontSize: "1rem",
        fontWeight: "500",
        cursor: "pointer",
        marginTop: "2rem"
      }}>
        {tokens.ctaLabel}
      </button>
    </div>
  </section>
);

// Pain Points Component
const PainPoints = ({ tokens }) => (
  <section style={{ background: "#fff", padding: "4rem 2rem" }}>
    <div style={{ margin: "0 auto", textAlign: "center" }}>
      <h2 style={{ fontSize: "2.5rem", marginBottom: "3rem", fontFamily: "var(--font-heading)" }}>
        Traditional Braces Challenges
      </h2>
      <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        {tokens.painPoints.map((point, i) => (
          <div key={i} style={{
            background: "var(--bg-light)",
            padding: "2rem",
            borderRadius: "8px",
            textAlign: "left"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{point.emoji}</div>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem", fontFamily: "var(--font-heading)" }}>
              {point.title}
            </h3>
            <p style={{ color: "#555", lineHeight: "1.6" }}>{point.copy}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Benefits Component
const Benefits = ({ tokens }) => (
  <section style={{ background: "var(--bg-light)", padding: "4rem 2rem" }}>
    <div style={{ margin: "0 auto", textAlign: "center" }}>
      <h2 style={{ fontSize: "2.5rem", marginBottom: "3rem", fontFamily: "var(--font-heading)" }}>
        Why Choose Invisalign®
      </h2>
      <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
        {tokens.benefits.map((benefit, i) => (
          <div key={i} style={{
            background: "#fff",
            padding: "2rem",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem", color: "var(--primary)" }}>
              {benefit.icon}
            </div>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem", fontFamily: "var(--font-heading)" }}>
              {benefit.title}
            </h3>
            <p style={{ color: "#555", lineHeight: "1.6" }}>{benefit.copy}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Before/After Component
const BeforeAfter = ({ tokens }) => (
  <section style={{ background: "#fff", padding: "4rem 2rem" }}>
    <div style={{ margin: "0 auto", textAlign: "center" }}>
      <h2 style={{ fontSize: "2.5rem", marginBottom: "3rem", fontFamily: "var(--font-heading)" }}>
        Real Results
      </h2>
      <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <h3 style={{ marginBottom: "1rem", fontFamily: "var(--font-heading)" }}>Before</h3>
          <img src={tokens.beforeImg} alt="Before treatment" style={{
            width: "100%",
            height: "300px",
            objectFit: "cover",
            borderRadius: "8px"
          }} />
        </div>
        <div>
          <h3 style={{ marginBottom: "1rem", fontFamily: "var(--font-heading)" }}>After</h3>
          <img src={tokens.afterImg} alt="After treatment" style={{
            width: "100%",
            height: "300px",
            objectFit: "cover",
            borderRadius: "8px"
          }} />
        </div>
      </div>
    </div>
  </section>
);

// Testimonials Component
const Testimonials = ({ tokens }) => (
  <section style={{ background: "var(--bg-light)", padding: "4rem 2rem" }}>
    <div style={{ margin: "0 auto", textAlign: "center" }}>
      <h2 style={{ fontSize: "2.5rem", marginBottom: "3rem", fontFamily: "var(--font-heading)" }}>
        Patient Stories
      </h2>
      <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        {tokens.testimonials.map((testimonial, i) => (
          <div key={i} style={{
            background: "#fff",
            padding: "2rem",
            borderRadius: "8px",
            borderLeft: "4px solid var(--primary)"
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
              <img src={testimonial.avatar} alt={testimonial.name} style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                marginRight: "1rem"
              }} />
              <div>
                <div style={{ fontWeight: "600" }}>{testimonial.name}</div>
                <div style={{ color: "gold" }}>{"★".repeat(testimonial.stars)}</div>
              </div>
            </div>
            <p style={{ fontStyle: "italic", color: "#555" }}>"{testimonial.text}"</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// FAQ Accordion Component
const FaqAccordion = ({ tokens }) => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section style={{ background: "#fff", padding: "4rem 2rem" }}>
      <div style={{ margin: "0 auto" }}>
        <h2 style={{ fontSize: "2.5rem", marginBottom: "3rem", textAlign: "center", fontFamily: "var(--font-heading)" }}>
          Frequently Asked Questions
        </h2>
        {tokens.faqs.map((faq, i) => (
          <div key={i} style={{
            border: "1px solid #eee",
            borderRadius: "8px",
            marginBottom: "1rem",
            overflow: "hidden"
          }}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{
                width: "100%",
                padding: "1.5rem",
                textAlign: "left",
                background: openFaq === i ? "var(--bg-light)" : "#fff",
                border: "none",
                fontSize: "1.1rem",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              {faq.q}
              <span style={{ fontSize: "1.5rem" }}>{openFaq === i ? "−" : "+"}</span>
            </button>
            {openFaq === i && (
              <div style={{ padding: "1rem 1.5rem", background: "var(--bg-light)", color: "#555" }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

// Secondary CTA Component
const SecondaryCta = ({ tokens }) => (
  <section style={{
    background: "var(--secondary)",
    padding: "4rem 1rem",
    textAlign: "center"
  }}>
    <div style={{ margin: "0 auto" }}>
      <h2 style={{ fontSize: "2.75rem", marginBottom: "2rem", fontFamily: "var(--font-heading)" }}>
        Ready to Transform Your Smile?
      </h2>
      <p style={{ fontSize: "1.1rem", marginBottom: "2rem", color: "var(--text)" }}>
        Schedule your free Invisalign® consultation today and discover how easy it can be to achieve the smile you've always wanted.
      </p>
      <button style={{
        background: "var(--primary)",
        color: "white",
        border: "none",
        padding: "0.75rem 1.5rem",
        borderRadius: "4px",
        fontSize: "1rem",
        fontWeight: "500",
        cursor: "pointer"
      }}>
        {tokens.ctaLabel}
      </button>
    </div>
  </section>
);

// Similar Services Component
const SimilarServices = ({ tokens }) => (
  <section style={{ background: "var(--bg-light)", padding: "4rem 2rem" }}>
    <div style={{ margin: "0 auto", textAlign: "center" }}>
      <h2 style={{ fontSize: "2.5rem", marginBottom: "3rem", fontFamily: "var(--font-heading)" }}>
        Other Services You Might Like
      </h2>
      <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
        {tokens.similar.map((service, i) => (
          <a key={i} href={service.href} style={{
            textDecoration: "none",
            color: "inherit",
            background: "#fff",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            transition: "transform 0.2s"
          }}>
            <img src={service.img} alt={service.title} style={{
              width: "100%",
              height: "200px",
              objectFit: "cover"
            }} />
            <div style={{ padding: "1.5rem" }}>
              <h3 style={{ fontFamily: "var(--font-heading)" }}>{service.title}</h3>
            </div>
          </a>
        ))}
      </div>
    </div>
  </section>
);

// Map Block Component
const MapBlock = ({ tokens }) => (
  <section style={{ background: "#fff", padding: "4rem 2rem" }}>
    <div style={{ margin: "0 auto" }}>
      <h2 style={{ fontSize: "2.5rem", marginBottom: "3rem", textAlign: "center", fontFamily: "var(--font-heading)" }}>
        Visit Our Practice
      </h2>
      <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <h3 style={{ marginBottom: "1rem", fontFamily: "var(--font-heading)" }}>{tokens.practice.name}</h3>
          <p style={{ marginBottom: "0.5rem", color: "#555" }}>{tokens.practice.address}</p>
          <p style={{ marginBottom: "2rem", color: "#555" }}>{tokens.practice.phone}</p>
          <button style={{
            background: "var(--primary)",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "4px",
            fontSize: "1rem",
            fontWeight: "500",
            cursor: "pointer"
          }}>
            Get Directions
          </button>
        </div>
        <div style={{ position: "relative", height: "300px" }}>
          <iframe
            src={tokens.practice.mapEmbed}
            style={{
              width: "100%",
              height: "100%",
              border: 0,
              borderRadius: "8px"
            }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  </section>
);

// Sticky Bar Component (placeholder for mobile)
const StickyBar = () => (
  <div style={{
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "var(--primary)",
    padding: "1rem",
    textAlign: "center",
    zIndex: 1000,
    display: "none" // Show on mobile with media queries
  }}>
    <button style={{
      background: "white",
      color: "var(--primary)",
      border: "none",
      padding: "0.75rem 2rem",
      borderRadius: "25px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      width: "100%",
      maxWidth: "300px"
    }}>
      Schedule Consultation
    </button>
  </div>
);

// Main Service Invisalign Component
export default function ServiceInvisalign() {
  return (
    <div style={{
      fontFamily: "'Roboto', sans-serif",
      color: "var(--text)",
      lineHeight: "1.5",
      margin: 0,
      padding: 0
    }}>
      <style>{`
        :root {
          --primary: #5DD39E;
          --secondary: #EFD5BD;
          --text: #3f3f3f;
          --bg-light: #f9f9f9;
          --bg-dark: #f5f5f5;
          --font-sans: 'Roboto', sans-serif;
          --font-heading: 'Work Sans', sans-serif;
        }
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          padding: 0;
        }
        @media (max-width: 768px) {
          .sticky-bar {
            display: block !important;
          }
        }
      `}</style>
      
      <Menu tokens={serviceTokens} />
      
      <Hero tokens={serviceTokens} />
      <PainPoints tokens={serviceTokens} />
      <Benefits tokens={serviceTokens} />
      <BeforeAfter tokens={serviceTokens} />
      <Testimonials tokens={serviceTokens} />
      <FaqAccordion tokens={serviceTokens} />
      <SecondaryCta tokens={serviceTokens} />
      <SimilarServices tokens={serviceTokens} />
      <MapBlock tokens={serviceTokens} />
      
      <Footer data={{
        practice: serviceTokens.practice.name,
        address: serviceTokens.practice.address,
        phone: serviceTokens.practice.phone,
        services: ["General Dentistry", "Cosmetic Veneers", "Invisalign®"],
        links: ["About Us", "Contact", "Privacy Policy", "Terms of Service"]
      }} />
      
      <StickyBar />
    </div>
  );
}