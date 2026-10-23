import { useState } from "react";
import damianPic from "../assets/damianpic.jpeg";
import sriPic from "../assets/sripic.jpeg";
import savPic from "../assets/savpic.jpeg";
import mannyPic from "../assets/mannypic.jpeg";
import maddiePic from "../assets/maddiepic.jpeg";

const teamMembers = [
  { id: "dw", name: "Damian Williams", role: "Team Lead · Back End", description: "Leads the backend development and system architecture with expertise in machine learning and API design." },
  { id: "sy", name: "Srinithi Yalamanchili", role: "Front End", description: "Designs and implements the user interface with focus on accessibility and user experience." },
  { id: "mng", name: "Manuel Nieves Garcia", role: "Front End", description: "Develops responsive frontend components and integrates APIs for seamless user interactions." },
  { id: "ms", name: "Maddie Sidwell", role: "Back End", description: "Works across frontend and backend, ensuring smooth integration and optimal system performance." },
  { id: "so", name: "Savannah Ostermeyer", role: "Back End", description: "Handles database management and API development with focus on data security and optimization." }
];

export default function Team() {
  const [flippedCards, setFlippedCards] = useState({});

  const images = {
    dw: damianPic,
    sy: sriPic,
    so: savPic,
    mng: mannyPic,
    ms: maddiePic
  };

  const topMembers = teamMembers.slice(0, 3);
  const bottomMembers = teamMembers.slice(3);

  const toggleCard = (memberId) => {
    setFlippedCards((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  const renderFlippableCard = (member, cardWidth) => (
    <div
      key={member.id}
      style={{
        perspective: "1200px",
        width: cardWidth || "100%",
        maxWidth: cardWidth ? 320 : undefined,
        transition: "transform 0.22s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          position: "relative",
          height: 520,
          transformStyle: "preserve-3d",
          transition: "transform 0.6s ease",
          transform: flippedCards[member.id] ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "2px solid #d4af8a",
            borderRadius: 14,
            textAlign: "left",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            backfaceVisibility: "hidden",
          }}
        >
          <div style={{ width: "100%", height: 420, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
            <img src={images[member.id]} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", display: "block" }} />
          </div>
          <div style={{ background: "#f5e6d3", padding: "16px", flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h3 style={{ margin: 0, color: "#111", fontSize: "1.15rem", fontWeight: 800 }}>{member.name}</h3>
              <p style={{ margin: "6px 0 0 0", color: "#422d00", fontWeight: 600, fontSize: "0.95rem" }}>{member.role}</p>
            </div>
            <button
              type="button"
              aria-label={`Flip ${member.name} card`}
              onClick={() => toggleCard(member.id)}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "1px solid #2a2a2a",
                background: "#fff",
                color: "#111",
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              ↻
            </button>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "2px solid #d4af8a",
            borderRadius: 14,
            textAlign: "left",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: "#f5e6d3",
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            padding: "20px 18px",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3 style={{ margin: 0, color: "#111", fontSize: "1.2rem", fontWeight: 800 }}>{member.name}</h3>
            <p style={{ margin: "8px 0 14px 0", color: "#422d00", fontWeight: 700, fontSize: "0.95rem" }}>
              What they did in this project
            </p>
            <p style={{ margin: 0, color: "#1f1f1f", lineHeight: 1.55, fontSize: "0.95rem" }}>
              {member.description}
            </p>
          </div>

          <button
            type="button"
            aria-label={`Flip ${member.name} card back`}
            onClick={() => toggleCard(member.id)}
            style={{
              alignSelf: "center",
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "1px solid #2a2a2a",
              background: "#fff",
              color: "#111",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: 700,
              marginTop: 12,
            }}
          >
            ↻
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <main className="container">
      <section className="section-pad" aria-labelledby="team-title">
        <div style={{ maxWidth: 900, margin: "0 auto 100px", textAlign: "center" }}>
          <h2 style={{ color: "var(--gold)", margin: 0, fontSize: "2rem", fontWeight: 700, letterSpacing: "0.6px" }}>Project Description</h2>
          <p className="muted" style={{ marginTop: 24, lineHeight: 1.7, fontSize: "1rem" }}>
            This Senior Capstone project (2025-2026) develops an AI-driven skin disease classification system that combines convolutional neural networks with expert-system rules to provide explainable, preliminary diagnostic support for clinicians and patients. The system is for demonstration and educational purposes only and is not a substitute for professional medical advice.
          </p>
        </div>

        <h1 id="team-title" className="h-title" style={{ textAlign: "center", color: "#FFFFFF", marginTop: 18 }}>
          Our Team
        </h1>
        <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 22px" }}>
          <div style={{ width: 84, height: 6, background: "var(--gold)", borderRadius: 6, boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }} />
        </div>

        <p className="muted" style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 18px" }}>
          Meet the talented team members behind this project with expertise in backend development, frontend design, and machine learning.
        </p>

        <div style={{ maxWidth: 1500, margin: "0 auto", padding: 24 }}>
          {/* Top row: 3 cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(260px, 1fr))",
            gap: 36,
            marginBottom: 28
          }}>
            {topMembers.map((member) => renderFlippableCard(member))}
          </div>

          {/* Bottom row: centered 2 cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr minmax(640px, 1fr) 1fr",
            gap: 36,
            alignItems: "start"
          }}>
            <div />
            <div style={{ display: "flex", gap: 36, justifyContent: "center" }}>
              {bottomMembers.map((member) => renderFlippableCard(member, "100%"))}
            </div>
            <div />
          </div>
        </div>
      </section>
    </main>
  );
}
