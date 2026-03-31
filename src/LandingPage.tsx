import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Stars,
  useTexture,
  Sparkles,
  Trail,
  Float,
  MeshDistortMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import { Suspense } from "react";

/* ===== ANIMATED GRADIENT OVERLAY ===== */
const AnimatedGradient = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background:
          "radial-gradient(circle at 30% 40%, rgba(136,170,255,0.08) 0%, transparent 50%)",
        animation: "pulseGradient 8s ease-in-out infinite",
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  );
};

/* ===== ENHANCED ROTATING GLOBE WITH ALL EFFECTS ===== */
const RotatingGlobe = () => {
  const globeRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  const texture = useTexture(
    "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg"
  );
  const cloudTexture = useTexture(
    "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png"
  );
  const specularTexture = useTexture(
    "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg"
  );
  const normalTexture = useTexture(
    "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg"
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (globeRef.current) globeRef.current.rotation.y = time * 0.03;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += 0.001;
      ring1Ref.current.rotation.x += 0.0005;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= 0.0015;
      ring2Ref.current.rotation.x -= 0.0003;
    }
    if (glowRef.current) {
      const pulse = Math.sin(time * 2) * 0.1 + 0.9;
      if (glowRef.current.material) {
        (glowRef.current.material as THREE.Material).opacity = 0.18 * pulse;
      }
    }
  });

  return (
    <group ref={globeRef} position={[0, -1.2, 0]} rotation={[0.15, -0.2, 0.05]}>
      {/* EARTH CORE */}
      <mesh>
        <sphereGeometry args={[5.5, 256, 256]} />
        <meshPhongMaterial
          map={texture}
          specularMap={specularTexture}
          shininess={20}
          emissive="#224466"
          emissiveIntensity={0.3}
          normalMap={normalTexture}
          normalScale={new THREE.Vector2(0.5, 0.5)}
        />
      </mesh>

      {/* VOLUMETRIC CLOUDS */}
      <mesh>
        <sphereGeometry args={[5.53, 128, 128]} />
        <MeshDistortMaterial
          map={cloudTexture}
          transparent
          opacity={0.5}
          distort={0.02}
          speed={0.5}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* INNER ATMOSPHERE */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[5.7, 64, 64]} />
        <meshBasicMaterial
          color="#4466aa"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {/* OUTER ATMOSPHERE */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[6.0, 64, 64]} />
        <meshBasicMaterial
          color="#88aaff"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
        />
      </mesh>

      {/* DECORATIVE RINGS */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[7.2, 0.08, 32, 128]} />
        <meshBasicMaterial
          color="#88aaff"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={ring2Ref} rotation={[-Math.PI / 4, Math.PI / 6, 0]}>
        <torusGeometry args={[7.8, 0.06, 32, 128]} />
        <meshBasicMaterial
          color="#aaccff"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* SATELLITES WITH TRAILS */}
      <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.3}>
        <Trail
          width={0.6}
          length={4}
          color={new THREE.Color("#88aaff")}
          attenuation={(t) => t * t}
        >
          <mesh position={[8.5, 1.2, 2]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#88aaff"
              emissiveIntensity={2}
            />
          </mesh>
        </Trail>
      </Float>

      <Float speed={1.0} rotationIntensity={0.3} floatIntensity={0.4}>
        <Trail
          width={0.5}
          length={3}
          color={new THREE.Color("#4466aa")}
          attenuation={(t) => t * t}
        >
          <mesh position={[-8, -1.5, 3]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#4466aa"
              emissiveIntensity={1.8}
            />
          </mesh>
        </Trail>
      </Float>

      {/* ADDITIONAL GLOWING RING */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[8.5, 0.03, 16, 128]} />
        <meshBasicMaterial
          color="#88aaff"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

/* ===== FLOATING PARTICLES BACKGROUND ===== */
const FloatingParticles = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {[...Array(60)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            background: `rgba(136, 170, 255, ${Math.random() * 0.4})`,
            borderRadius: "50%",
            animation: `float ${Math.random() * 20 + 15}s infinite`,
            animationDelay: `${Math.random() * 5}s`,
            filter: "blur(0.5px)",
          }}
        />
      ))}
    </div>
  );
};

/* ===== ENHANCED NAVBAR ===== */
const Navbar = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        background: scrolled
          ? "rgba(10, 10, 20, 0.85)"
          : "rgba(20, 20, 30, 0.7)",
        backdropFilter: "blur(20px)",
        padding: "16px 40px",
        borderRadius: "60px",
        display: "flex",
        gap: "40px",
        zIndex: 100,
        border: "1px solid rgba(136, 170, 255, 0.2)",
        boxShadow:
          "0 15px 35px -15px rgba(0,0,0,0.5), 0 0 30px rgba(136,170,255,0.1)",
        transition: "all 0.3s ease",
      }}
    >
      <b
        style={{
          fontSize: "18px",
          background: "linear-gradient(135deg, #88aaff, #ffffff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "1px",
        }}
      >
        🛰️ EARTHGUARDIAN AI
      </b>
      {["Features", "Docs", "Community"].map((item) => (
        <span
          key={item}
          onMouseEnter={() => setHovered(item)}
          onMouseLeave={() => setHovered(null)}
          style={{
            color: hovered === item ? "#88aaff" : "#aaa",
            cursor: "pointer",
            transition: "all 0.3s ease",
            transform: hovered === item ? "scale(1.05)" : "scale(1)",
            fontWeight: hovered === item ? 600 : 400,
            textShadow: hovered === item ? "0 0 10px #88aaff" : "none",
          }}
        >
          {item}
        </span>
      ))}
    </nav>
  );
};

/* ===== GLOWING BUTTON ===== */
const GlowingButton = ({ onClick, children }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: "16px 48px",
        background: "linear-gradient(135deg, #3b82f6, #88aaff)",
        borderRadius: "50px",
        border: "none",
        color: "white",
        fontSize: "18px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.3s ease",
        transform: isHovered ? "scale(1.05)" : "scale(1)",
        boxShadow: isHovered
          ? "0 0 50px #3b82f6, 0 10px 20px -5px rgba(0,0,0,0.5)"
          : "0 0 30px #3b82f6, 0 5px 15px -5px rgba(0,0,0,0.5)",
        letterSpacing: "1px",
      }}
    >
      {children}
    </button>
  );
};

/* ===== ENHANCED TERMINAL ===== */
const Terminal = () => {
  const lines = [
    {
      text: "$ earthguardian monitor --region global",
      color: "#60a5fa",
    },
    { text: "✓ Analyzing 47 active zones...", color: "#60a5fa" },
    { text: "✓ AI threat assessment: 94/100", color: "#4ade80" },
    { text: "✓ 5 critical alerts detected", color: "#f59e0b" },
    { text: "✓ Data verified on blockchain", color: "#a855f7" },
    { text: "Done in 2.3s ✓", color: "#888" },
  ];

  return (
    <div
      style={{
        margin: "30px auto",
        width: "min(600px, 90%)",
        padding: "28px 36px",
        borderRadius: "24px",
        background: "rgba(20, 20, 30, 0.85)",
        backdropFilter: "blur(15px)",
        textAlign: "left",
        border: "1px solid rgba(136, 170, 255, 0.2)",
        boxShadow:
          "0 25px 45px -15px rgba(0,0,0,0.6), 0 0 30px rgba(136,170,255,0.1)",
        animation: "fadeInUp 0.8s ease 0.15s both",
      }}
    >
      {lines.map((line, i) => (
        <p
          key={i}
          style={{
            color: line.color,
            marginBottom: "12px",
            fontFamily: "monospace",
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {line.text.includes("✓") && (
            <span style={{ color: "#4ade80", fontSize: "18px" }}>✓</span>
          )}
          {line.text}
        </p>
      ))}
    </div>
  );
};

/* ===== STATS SECTION ===== */
const StatsSection = () => {
  return (
    <div
      style={{
        display: "flex",
        gap: "60px",
        justifyContent: "center",
        marginTop: "40px",
        animation: "fadeInUp 0.8s ease 0.35s both",
      }}
    >
      {[
        { value: "24/7", label: "Monitoring", color: "#3b82f6" },
        { value: "47", label: "Active Zones", color: "#88aaff" },
        { value: "99.9%", label: "Uptime", color: "#a855f7" },
      ].map((stat, i) => (
        <div key={i} style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: stat.color,
              textShadow: `0 0 20px ${stat.color}`,
              lineHeight: 1,
            }}
          >
            {stat.value}
          </div>
          <div
            style={{
              color: "#888",
              fontSize: "14px",
              letterSpacing: "1px",
              marginTop: "5px",
            }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ===== SIMPLE FEATURE CARD (NO 3D) ===== */
const FeatureCard = ({ icon, title, desc, index }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const colors = [
    "#3b82f6",
    "#a855f7",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#60a5fa",
  ];
  const color = colors[index % colors.length];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "rgba(20, 20, 30, 0.7)",
        backdropFilter: "blur(15px)",
        borderRadius: "24px",
        padding: "32px",
        border: `1px solid ${isHovered ? color : "rgba(255,255,255,0.05)"}`,
        transition: "all 0.3s ease",
        transform: isHovered
          ? "translateY(-8px) scale(1.02)"
          : "translateY(0) scale(1)",
        boxShadow: isHovered
          ? `0 20px 40px -10px ${color}`
          : "0 10px 30px -10px rgba(0,0,0,0.5)",
        cursor: "pointer",
        height: "100%",
      }}
    >
      <div
        style={{
          fontSize: "48px",
          marginBottom: "24px",
          filter: isHovered ? `drop-shadow(0 0 15px ${color})` : "none",
          transform: isHovered ? "scale(1.1)" : "scale(1)",
          transition: "all 0.3s ease",
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: "22px",
          fontWeight: 700,
          marginBottom: "12px",
          color: isHovered ? color : "white",
          transition: "color 0.3s ease",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: "#999",
          fontSize: "15px",
          lineHeight: "1.6",
        }}
      >
        {desc}
      </p>
    </div>
  );
};

/* ===== FEATURES GRID ===== */
const FeaturesGrid = () => {
  const features = [
    {
      icon: "🤖",
      title: "AI Analysis",
      desc: "Powered by advanced AI, get instant analysis of disaster patterns with real-time impact scoring.",
    },
    {
      icon: "📡",
      title: "Satellite Integration",
      desc: "Real-time satellite data integration for accurate monitoring of global disaster zones.",
    },
    {
      icon: "⛓️",
      title: "Immutable Records",
      desc: "All disaster data permanently stored on blockchain, ensuring transparency and trust.",
    },
    {
      icon: "🎯",
      title: "Defense Detection",
      desc: "Advanced camouflage detection for military and defense monitoring applications.",
    },
    {
      icon: "🆘",
      title: "Rescue Coordination",
      desc: "Instant alert system for human detection in disaster zones with rescue team coordination.",
    },
    {
      icon: "📊",
      title: "Real-time Analytics",
      desc: "Comprehensive analytics dashboard with predictive modeling for disaster prevention.",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "30px",
        marginTop: "100px",
        width: "100%",
        padding: "0 20px",
      }}
    >
      {features.map((feature, i) => (
        <FeatureCard key={i} {...feature} index={i} />
      ))}
    </div>
  );
};

/* ===== MAIN LANDING PAGE ===== */
const LandingPage = ({
  onEnterDashboard,
  onLoginClick,
  onSignupClick,
}: any) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 10,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-15px); }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulseGradient {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
      }
      body { margin: 0; overflow-x: hidden; background: #0a0a0a; }
      * { box-sizing: border-box; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      style={{
        background: "#0a0a0a",
        color: "white",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* ANIMATED GRADIENT OVERLAY */}
      <AnimatedGradient />

      {/* BACKGROUND EARTH */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        <Canvas
          camera={{ position: [0, 0.5, 16] }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={2.2} />
            <pointLight position={[-5, 5, 5]} intensity={1.4} color="#88aaff" />
            <pointLight position={[0, 8, 8]} intensity={1.5} color="#ffffff" />
            <Stars
              radius={400}
              depth={80}
              count={20000}
              factor={8}
              saturation={0.3}
              fade
              speed={0.1}
            />
            <Sparkles
              count={100}
              scale={30}
              size={2.5}
              speed={0.3}
              color="#88aaff"
              opacity={0.4}
            />
            <RotatingGlobe />
            <fog attach="fog" args={["#0a0a0a", 15, 30]} />
          </Suspense>
        </Canvas>
      </div>

      {/* FLOATING PARTICLES */}
      <FloatingParticles />

      {/* NAVBAR */}
      <Navbar />

      {/* MAIN CONTENT */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          transform: `perspective(1000px) rotateX(${
            mousePosition.y * 0.01
          }deg) rotateY(${mousePosition.x * 0.01}deg)`,
          transition: "transform 0.1s ease",
        }}
      >
        {/* HERO SECTION */}
        <section
          style={{
            textAlign: "center",
            paddingTop: "160px",
            paddingBottom: "80px",
            maxWidth: "1200px",
            margin: "0 auto",
            paddingLeft: "20px",
            paddingRight: "20px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 24px",
              background: "rgba(136, 170, 255, 0.1)",
              borderRadius: "40px",
              border: "1px solid rgba(136, 170, 255, 0.2)",
              marginBottom: "20px",
              animation: "fadeInUp 0.8s ease",
            }}
          >
            <span
              style={{
                color: "#88aaff",
                fontSize: "14px",
                letterSpacing: "2px",
              }}
            >
              ⚡ NEXT-GEN AI MONITORING
            </span>
          </div>

          {/* HEADING - 2 LINES */}
          <h1
            style={{
              fontSize: "clamp(48px, 8vw, 80px)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "20px",
              animation: "fadeInUp 0.8s ease 0.1s both",
              maxWidth: "1000px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <span
              style={{
                background:
                  "linear-gradient(135deg, #ffffff, #88aaff, #aaccff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "block",
              }}
            >
              Global Disaster & Defense
            </span>
            <span
              style={{
                background:
                  "linear-gradient(135deg, #88aaff, #ffffff, #88aaff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "block",
                fontSize: "0.9em",
                marginTop: "5px",
              }}
            >
              Monitoring System
            </span>
          </h1>

          <p
            style={{
              color: "#aaa",
              fontSize: "clamp(16px, 2vw, 18px)",
              maxWidth: "700px",
              margin: "10px auto 0",
              animation: "fadeInUp 0.8s ease 0.2s both",
            }}
          >
            Real-time monitoring of natural disasters, human rescue operations,
            and defense activities with advanced AI analysis
          </p>

          <Terminal />

          <div style={{ animation: "fadeInUp 0.8s ease 0.3s both" }}>
            <GlowingButton onClick={onEnterDashboard}>
              LAUNCH DASHBOARD
            </GlowingButton>
          </div>

          {/* LOGIN/SIGNUP BUTTONS */}
          <div
            style={{
              display: "flex",
              gap: "15px",
              justifyContent: "center",
              marginTop: "20px",
              animation: "fadeInUp 0.8s ease 0.35s both",
            }}
          >
            <button
              onClick={onLoginClick}
              style={{
                padding: "12px 32px",
                background: "transparent",
                border: "2px solid #88aaff",
                borderRadius: "50px",
                color: "#88aaff",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
                backdropFilter: "blur(10px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#88aaff";
                e.currentTarget.style.color = "#000";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#88aaff";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              SIGN IN
            </button>
            <button
              onClick={onSignupClick}
              style={{
                padding: "12px 32px",
                background: "transparent",
                border: "2px solid #88aaff",
                borderRadius: "50px",
                color: "#88aaff",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
                backdropFilter: "blur(10px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#88aaff";
                e.currentTarget.style.color = "#000";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#88aaff";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              SIGN UP
            </button>
          </div>

          <StatsSection />
        </section>

        {/* FEATURES GRID */}
        <FeaturesGrid />

        {/* FOOTER */}
        <footer
          style={{
            position: "relative",
            zIndex: 10,
            padding: "60px 40px 40px",
            textAlign: "center",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(136, 170, 255, 0.15)",
            marginTop: "80px",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div
              style={{
                fontSize: "36px",
                marginBottom: "20px",
                filter: "drop-shadow(0 0 30px #88aaff)",
              }}
            >
              🛰️
            </div>
            <h3
              style={{
                fontSize: "24px",
                fontWeight: 700,
                background: "linear-gradient(135deg, #88aaff, #ffffff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "10px",
              }}
            >
              EarthGuardian AI
            </h3>
            <p
              style={{
                color: "#888",
                maxWidth: "600px",
                margin: "0 auto 30px",
              }}
            >
              Global Disaster & Defense Monitoring System
            </p>
            <div
              style={{
                display: "flex",
                gap: "30px",
                justifyContent: "center",
                marginBottom: "40px",
                flexWrap: "wrap",
              }}
            >
              {["About", "Privacy", "Terms", "Contact"].map((item) => (
                <span
                  key={item}
                  style={{
                    color: "#666",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    fontSize: "14px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#88aaff";
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#666";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
            <p style={{ color: "#555", fontSize: "13px" }}>
              © 2026 EarthGuardian AI. All rights reserved. Made with 🛰️ for
              global safety
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
