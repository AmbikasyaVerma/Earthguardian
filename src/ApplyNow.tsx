import React, { useState, useEffect } from "react";

/* ===== APPLY NOW PAGE ===== */
const ApplyNow = ({ onBack }: { onBack?: () => void }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    organization: "",
    country: "",
    experience: "",
    motivation: "",
    skills: [] as string[],
  });
  const [submitted, setSubmitted] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes successPop {
        0% { transform: scale(0.5); opacity: 0; }
        70% { transform: scale(1.1); }
        100% { transform: scale(1); opacity: 1; }
      }
      .apply-input:focus {
        outline: none;
        border-color: #88aaff !important;
        box-shadow: 0 0 0 3px rgba(136,170,255,0.15), 0 0 20px rgba(136,170,255,0.1);
      }
      .skill-tag:hover {
        background: rgba(136,170,255,0.2) !important;
        border-color: #88aaff !important;
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const roles = [
    { value: "developer", label: "🧑‍💻 Software Developer", color: "#3b82f6" },
    { value: "researcher", label: "🔬 Researcher / Scientist", color: "#a855f7" },
    { value: "responder", label: "🆘 Disaster Response Expert", color: "#ef4444" },
    { value: "analyst", label: "📊 Data Analyst", color: "#f59e0b" },
    { value: "designer", label: "🎨 UI/UX Designer", color: "#ec4899" },
    { value: "other", label: "🌐 Other", color: "#10b981" },
  ];

  const skillOptions = [
    "Python", "React", "AI/ML", "Satellite Data", "GIS",
    "Emergency Management", "Climate Science", "Blockchain",
    "Cybersecurity", "Defense Tech", "Data Engineering", "DevOps",
  ];

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    padding: "14px 18px",
    background: activeField === field ? "rgba(136,170,255,0.08)" : "rgba(20,20,30,0.8)",
    border: `1px solid ${activeField === field ? "#88aaff" : "rgba(136,170,255,0.2)"}`,
    borderRadius: "14px",
    color: "#fff",
    fontSize: "15px",
    transition: "all 0.3s ease",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  });

  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "fixed",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              background: `rgba(136,170,255,${Math.random() * 0.3})`,
              borderRadius: "50%",
              animation: `float ${Math.random() * 10 + 8}s infinite`,
              pointerEvents: "none",
            }}
          />
        ))}
        <div
          style={{
            textAlign: "center",
            animation: "successPop 0.6s ease",
            maxWidth: "500px",
          }}
        >
          <div
            style={{
              fontSize: "80px",
              marginBottom: "30px",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            🛰️
          </div>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #88aaff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              margin: "0 auto 30px",
              boxShadow: "0 0 40px rgba(136,170,255,0.4)",
            }}
          >
            ✓
          </div>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: 800,
              background: "linear-gradient(135deg, #ffffff, #88aaff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "16px",
            }}
          >
            Application Received!
          </h2>
          <p style={{ color: "#aaa", fontSize: "18px", lineHeight: "1.7", marginBottom: "40px" }}>
            Thank you, <span style={{ color: "#88aaff", fontWeight: 600 }}>{formData.name}</span>!
            Our team will review your application and reach out within{" "}
            <span style={{ color: "#88aaff" }}>3–5 business days</span>.
          </p>
          <div
            style={{
              background: "rgba(136,170,255,0.08)",
              border: "1px solid rgba(136,170,255,0.2)",
              borderRadius: "20px",
              padding: "24px",
              marginBottom: "40px",
              textAlign: "left",
            }}
          >
            {[
              { icon: "📧", label: "Confirmation sent to", value: formData.email },
              { icon: "🎯", label: "Applied as", value: roles.find(r => r.value === formData.role)?.label || formData.role },
              { icon: "🌍", label: "Country", value: formData.country },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", marginBottom: i < 2 ? "12px" : 0 }}>
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                <div>
                  <span style={{ color: "#666", fontSize: "12px" }}>{item.label}</span>
                  <div style={{ color: "#fff", fontSize: "14px", fontWeight: 500 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={onBack}
            style={{
              padding: "14px 40px",
              background: "linear-gradient(135deg, #3b82f6, #88aaff)",
              borderRadius: "50px",
              border: "none",
              color: "white",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 0 30px rgba(59,130,246,0.4)",
              letterSpacing: "1px",
            }}
          >
            ← Back to Community
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        paddingTop: "120px",
        paddingBottom: "80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "fixed",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(136,170,255,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Floating particles */}
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "fixed",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            background: `rgba(136,170,255,${Math.random() * 0.25})`,
            borderRadius: "50%",
            animation: `float ${Math.random() * 15 + 10}s infinite`,
            animationDelay: `${Math.random() * 5}s`,
            pointerEvents: "none",
          }}
        />
      ))}

      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "0 20px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "1px solid rgba(136,170,255,0.2)",
            borderRadius: "30px",
            color: "#88aaff",
            padding: "8px 20px",
            fontSize: "14px",
            cursor: "pointer",
            marginBottom: "40px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(136,170,255,0.1)";
            e.currentTarget.style.transform = "translateX(-4px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "translateX(0)";
          }}
        >
          ← Back
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "50px", animation: "fadeInUp 0.8s ease" }}>
          <div
            style={{
              display: "inline-block",
              padding: "8px 24px",
              background: "rgba(136,170,255,0.1)",
              borderRadius: "40px",
              border: "1px solid rgba(136,170,255,0.2)",
              marginBottom: "20px",
            }}
          >
            <span style={{ color: "#88aaff", fontSize: "14px", letterSpacing: "2px" }}>
              🌟 JOIN THE MISSION
            </span>
          </div>
          <h1
            style={{
              fontSize: "48px",
              fontWeight: 900,
              background: "linear-gradient(135deg, #ffffff, #88aaff, #aaccff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "16px",
              lineHeight: 1.1,
            }}
          >
            Become a Contributor
          </h1>
          <p style={{ color: "#aaa", fontSize: "17px", maxWidth: "560px", margin: "0 auto", lineHeight: "1.7" }}>
            Help build technology that saves lives. Join EarthGuardian AI's global
            network of experts protecting our world in real time.
          </p>
        </div>

        {/* Step indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0",
            marginBottom: "40px",
          }}
        >
          {[1, 2, 3].map((s, i) => (
            <React.Fragment key={s}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: step >= s
                    ? "linear-gradient(135deg, #3b82f6, #88aaff)"
                    : "rgba(20,20,30,0.8)",
                  border: `1px solid ${step >= s ? "#88aaff" : "rgba(136,170,255,0.2)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: step >= s ? "#fff" : "#555",
                  fontSize: "14px",
                  fontWeight: 700,
                  transition: "all 0.3s ease",
                  boxShadow: step >= s ? "0 0 15px rgba(136,170,255,0.3)" : "none",
                }}
              >
                {step > s ? "✓" : s}
              </div>
              {i < 2 && (
                <div
                  style={{
                    width: "80px",
                    height: "2px",
                    background: step > s
                      ? "linear-gradient(90deg, #3b82f6, #88aaff)"
                      : "rgba(136,170,255,0.15)",
                    transition: "all 0.3s ease",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "60px",
            marginBottom: "40px",
            marginTop: "-20px",
          }}
        >
          {["Personal Info", "Your Role", "Motivation"].map((label, i) => (
            <span
              key={label}
              style={{
                fontSize: "11px",
                color: step >= i + 1 ? "#88aaff" : "#444",
                letterSpacing: "0.5px",
                transition: "color 0.3s ease",
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Form card */}
        <div
          style={{
            background: "rgba(15, 15, 25, 0.85)",
            backdropFilter: "blur(20px)",
            borderRadius: "28px",
            padding: "48px",
            border: "1px solid rgba(136,170,255,0.15)",
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6), 0 0 40px rgba(136,170,255,0.05)",
            animation: "fadeInUp 0.8s ease 0.1s both",
          }}
        >
          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
                Personal Information
              </h2>
              <p style={{ color: "#666", fontSize: "14px", marginBottom: "32px" }}>
                Tell us who you are
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ color: "#888", fontSize: "13px", display: "block", marginBottom: "8px", letterSpacing: "0.5px" }}>
                    FULL NAME *
                  </label>
                  <input
                    className="apply-input"
                    style={inputStyle("name")}
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onFocus={() => setActiveField("name")}
                    onBlur={() => setActiveField(null)}
                  />
                </div>
                <div>
                  <label style={{ color: "#888", fontSize: "13px", display: "block", marginBottom: "8px", letterSpacing: "0.5px" }}>
                    EMAIL ADDRESS *
                  </label>
                  <input
                    className="apply-input"
                    style={inputStyle("email")}
                    type="email"
                    placeholder="you@organization.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={() => setActiveField("email")}
                    onBlur={() => setActiveField(null)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ color: "#888", fontSize: "13px", display: "block", marginBottom: "8px", letterSpacing: "0.5px" }}>
                    ORGANIZATION
                  </label>
                  <input
                    className="apply-input"
                    style={inputStyle("organization")}
                    placeholder="Your company / institution"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    onFocus={() => setActiveField("organization")}
                    onBlur={() => setActiveField(null)}
                  />
                </div>
                <div>
                  <label style={{ color: "#888", fontSize: "13px", display: "block", marginBottom: "8px", letterSpacing: "0.5px" }}>
                    COUNTRY *
                  </label>
                  <input
                    className="apply-input"
                    style={inputStyle("country")}
                    placeholder="Country of residence"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    onFocus={() => setActiveField("country")}
                    onBlur={() => setActiveField(null)}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: "#888", fontSize: "13px", display: "block", marginBottom: "8px", letterSpacing: "0.5px" }}>
                  YEARS OF EXPERIENCE
                </label>
                <select
                  className="apply-input"
                  style={{ ...inputStyle("experience"), cursor: "pointer" }}
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  onFocus={() => setActiveField("experience")}
                  onBlur={() => setActiveField(null)}
                >
                  <option value="" style={{ background: "#1a1a2a" }}>Select experience level</option>
                  <option value="0-2" style={{ background: "#1a1a2a" }}>0–2 years (Early career)</option>
                  <option value="3-5" style={{ background: "#1a1a2a" }}>3–5 years (Mid-level)</option>
                  <option value="6-10" style={{ background: "#1a1a2a" }}>6–10 years (Senior)</option>
                  <option value="10+" style={{ background: "#1a1a2a" }}>10+ years (Expert)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
                Your Role & Skills
              </h2>
              <p style={{ color: "#666", fontSize: "14px", marginBottom: "32px" }}>
                How would you like to contribute?
              </p>

              <label style={{ color: "#888", fontSize: "13px", display: "block", marginBottom: "16px", letterSpacing: "0.5px" }}>
                I WANT TO CONTRIBUTE AS *
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "32px",
                }}
              >
                {roles.map((role) => (
                  <div
                    key={role.value}
                    onClick={() => setFormData({ ...formData, role: role.value })}
                    style={{
                      padding: "16px 20px",
                      borderRadius: "16px",
                      border: `1px solid ${formData.role === role.value ? role.color : "rgba(136,170,255,0.15)"}`,
                      background: formData.role === role.value
                        ? `${role.color}18`
                        : "rgba(20,20,30,0.6)",
                      color: formData.role === role.value ? role.color : "#888",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: formData.role === role.value ? 600 : 400,
                      transition: "all 0.3s ease",
                      boxShadow: formData.role === role.value ? `0 0 20px ${role.color}25` : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (formData.role !== role.value) {
                        e.currentTarget.style.borderColor = "rgba(136,170,255,0.3)";
                        e.currentTarget.style.color = "#aaa";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.role !== role.value) {
                        e.currentTarget.style.borderColor = "rgba(136,170,255,0.15)";
                        e.currentTarget.style.color = "#888";
                      }
                    }}
                  >
                    {role.label}
                  </div>
                ))}
              </div>

              <label style={{ color: "#888", fontSize: "13px", display: "block", marginBottom: "16px", letterSpacing: "0.5px" }}>
                RELEVANT SKILLS (select all that apply)
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {skillOptions.map((skill) => (
                  <div
                    key={skill}
                    className="skill-tag"
                    onClick={() => toggleSkill(skill)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "30px",
                      border: `1px solid ${formData.skills.includes(skill) ? "#88aaff" : "rgba(136,170,255,0.2)"}`,
                      background: formData.skills.includes(skill)
                        ? "rgba(136,170,255,0.2)"
                        : "rgba(20,20,30,0.6)",
                      color: formData.skills.includes(skill) ? "#88aaff" : "#666",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: formData.skills.includes(skill) ? 600 : 400,
                      transition: "all 0.3s ease",
                      userSelect: "none",
                    }}
                  >
                    {formData.skills.includes(skill) ? "✓ " : ""}{skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
                Your Motivation
              </h2>
              <p style={{ color: "#666", fontSize: "14px", marginBottom: "32px" }}>
                Tell us why you want to join EarthGuardian AI
              </p>

              <label style={{ color: "#888", fontSize: "13px", display: "block", marginBottom: "8px", letterSpacing: "0.5px" }}>
                WHY DO YOU WANT TO CONTRIBUTE? *
              </label>
              <textarea
                className="apply-input"
                style={{
                  ...inputStyle("motivation"),
                  minHeight: "160px",
                  resize: "vertical",
                  lineHeight: "1.6",
                }}
                placeholder="Tell us about your passion for disaster response, climate safety, or defense tech. What impact do you hope to make?"
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                onFocus={() => setActiveField("motivation")}
                onBlur={() => setActiveField(null)}
              />

              {/* Summary card */}
              <div
                style={{
                  marginTop: "28px",
                  padding: "24px",
                  background: "rgba(136,170,255,0.06)",
                  border: "1px solid rgba(136,170,255,0.15)",
                  borderRadius: "20px",
                }}
              >
                <h4 style={{ color: "#88aaff", fontSize: "13px", marginBottom: "16px", letterSpacing: "1px" }}>
                  APPLICATION SUMMARY
                </h4>
                {[
                  { label: "Name", value: formData.name },
                  { label: "Email", value: formData.email },
                  { label: "Role", value: roles.find(r => r.value === formData.role)?.label || "—" },
                  { label: "Skills", value: formData.skills.join(", ") || "—" },
                  { label: "Country", value: formData.country || "—" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginBottom: "10px",
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ color: "#555", fontSize: "12px", minWidth: "60px" }}>{item.label}</span>
                    <span style={{ color: "#ccc", fontSize: "13px", flex: 1 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "40px",
              gap: "16px",
            }}
          >
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  padding: "14px 32px",
                  background: "transparent",
                  border: "1px solid rgba(136,170,255,0.25)",
                  borderRadius: "50px",
                  color: "#88aaff",
                  fontSize: "15px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(136,170,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                ← Previous
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                style={{
                  padding: "14px 40px",
                  background: "linear-gradient(135deg, #3b82f6, #88aaff)",
                  borderRadius: "50px",
                  border: "none",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 0 25px rgba(59,130,246,0.35)",
                  transition: "all 0.3s ease",
                  letterSpacing: "0.5px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.04)";
                  e.currentTarget.style.boxShadow = "0 0 40px rgba(59,130,246,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 0 25px rgba(59,130,246,0.35)";
                }}
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                style={{
                  padding: "14px 40px",
                  background: "linear-gradient(135deg, #3b82f6, #88aaff)",
                  borderRadius: "50px",
                  border: "none",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 0 25px rgba(59,130,246,0.35)",
                  transition: "all 0.3s ease",
                  letterSpacing: "0.5px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.04)";
                  e.currentTarget.style.boxShadow = "0 0 40px rgba(59,130,246,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 0 25px rgba(59,130,246,0.35)";
                }}
              >
                🚀 Submit Application
              </button>
            )}
          </div>
        </div>

        {/* Trust badges */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            marginTop: "40px",
            flexWrap: "wrap",
          }}
        >
          {[
            { icon: "🔒", text: "Your data is secure" },
            { icon: "⚡", text: "Response in 3–5 days" },
            { icon: "🌍", text: "Open to all countries" },
          ].map((badge) => (
            <div
              key={badge.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#555",
                fontSize: "13px",
              }}
            >
              <span>{badge.icon}</span>
              <span>{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApplyNow;
