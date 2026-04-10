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
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import ApplyNow from "./ApplyNow";

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
const Navbar = ({ setCurrentPage }: any) => {
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
          cursor: "pointer",
        }}
        onClick={() => setCurrentPage("home")}
      >
        🛰️ EARTHGUARDIAN AI
      </b>
      {["Features", "Docs", "Community"].map((item) => (
        <span
          key={item}
          onClick={() => setCurrentPage(item.toLowerCase())}
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
          ? "0 0 30px #3b82f6, 0 10px 20px -5px rgba(0,0,0,0.5)"
          : "0 0 15px #3b82f6, 0 5px 15px -5px rgba(0,0,0,0.5)",
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

/* ===== ENHANCED FEATURES PAGE ===== */
const FeaturesPage = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features = [
    {
      icon: "🤖",
      title: "AI-Powered Analysis",
      description:
        "Advanced machine learning algorithms analyze disaster patterns with 99.9% accuracy. Real-time threat assessment and predictive modeling for proactive response.",
      color: "#3b82f6",
      stats: "99.9% Accuracy",
      gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)",
    },
    {
      icon: "📡",
      title: "Satellite Integration",
      description:
        "Direct integration with global satellite networks provides real-time imagery and data from over 50 satellites, ensuring comprehensive global coverage.",
      color: "#88aaff",
      stats: "50+ Satellites",
      gradient: "linear-gradient(135deg, #88aaff, #aaccff)",
    },
    {
      icon: "⛓️",
      title: "Blockchain Security",
      description:
        "All disaster data is immutably recorded on blockchain, ensuring transparency, accountability, and tamper-proof documentation for legal and insurance purposes.",
      color: "#a855f7",
      stats: "100% Immutable",
      gradient: "linear-gradient(135deg, #a855f7, #c084fc)",
    },
    {
      icon: "🎯",
      title: "Defense Detection",
      description:
        "Advanced camouflage detection algorithms identify hidden military installations and equipment with high precision using multispectral analysis.",
      color: "#ec4899",
      stats: "98% Precision",
      gradient: "linear-gradient(135deg, #ec4899, #f472b6)",
    },
    {
      icon: "🆘",
      title: "Rescue Coordination",
      description:
        "AI-powered human detection in disaster zones with real-time rescue team coordination, priority mapping, and resource optimization.",
      color: "#f59e0b",
      stats: "60% Faster Response",
      gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    },
    {
      icon: "📊",
      title: "Predictive Analytics",
      description:
        "Advanced forecasting models predict disaster patterns up to 72 hours in advance, enabling proactive evacuation and resource allocation.",
      color: "#10b981",
      stats: "72h Early Warning",
      gradient: "linear-gradient(135deg, #10b981, #34d399)",
    },
    {
      icon: "🌍",
      title: "Global Coverage",
      description:
        "Monitor every corner of the planet with our global sensor network, providing real-time data from remote locations and urban centers alike.",
      color: "#60a5fa",
      stats: "195+ Countries",
      gradient: "linear-gradient(135deg, #60a5fa, #93c5fd)",
    },
    {
      icon: "🔒",
      title: "Data Privacy",
      description:
        "Military-grade encryption ensures all sensitive data remains secure. End-to-end encryption for all communications and data transfers.",
      color: "#8b5cf6",
      stats: "AES-256 Encryption",
      gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#0a0a0a",
        paddingTop: "140px",
        paddingBottom: "80px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "60px",
            animation: "fadeInUp 0.8s ease",
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
            }}
          >
            <span
              style={{
                color: "#88aaff",
                fontSize: "14px",
                letterSpacing: "2px",
              }}
            >
              ⚡ CUTTING-EDGE TECHNOLOGY
            </span>
          </div>
          <h1
            style={{
              fontSize: "48px",
              fontWeight: 800,
              marginBottom: "20px",
              background: "linear-gradient(135deg, #ffffff, #88aaff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Advanced Features
          </h1>
          <p
            style={{
              color: "#aaa",
              fontSize: "18px",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            Discover the cutting-edge capabilities that make EarthGuardian AI
            the most advanced monitoring system in the world
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "30px",
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                background:
                  hoveredIndex === index
                    ? feature.gradient
                    : "rgba(20, 20, 30, 0.7)",
                backdropFilter: "blur(15px)",
                borderRadius: "24px",
                padding: "32px",
                border: `1px solid ${feature.color}40`,
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                transform:
                  hoveredIndex === index
                    ? "translateY(-12px) scale(1.02)"
                    : "translateY(0) scale(1)",
                boxShadow:
                  hoveredIndex === index
                    ? `0 25px 40px -15px ${feature.color}`
                    : "0 10px 30px -10px rgba(0,0,0,0.5)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {hoveredIndex === index && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: feature.color,
                    animation: "slideIn 0.4s ease",
                  }}
                />
              )}
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "20px",
                  transform:
                    hoveredIndex === index
                      ? "scale(1.1) rotate(5deg)"
                      : "scale(1) rotate(0deg)",
                  transition: "transform 0.4s ease",
                  filter:
                    hoveredIndex === index
                      ? `drop-shadow(0 0 20px ${feature.color})`
                      : "none",
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  marginBottom: "12px",
                  color: hoveredIndex === index ? "white" : feature.color,
                  transition: "color 0.3s ease",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  color:
                    hoveredIndex === index ? "rgba(255,255,255,0.9)" : "#999",
                  lineHeight: "1.6",
                  transition: "color 0.3s ease",
                }}
              >
                {feature.description}
              </p>
              <div
                style={{
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop: `1px solid ${feature.color}40`,
                }}
              >
                <span
                  style={{
                    color: feature.color,
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  📊 {feature.stats}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ===== DOC DETAIL PAGE ===== */
const DocDetailPage = ({
  section,
  onBack,
}: {
  section: any;
  onBack: () => void;
}) => {
  const detailContent: Record<
    string,
    { heading: string; content: string; code?: string }[]
  > = {
    "🚀 Getting Started": [
      {
        heading: "Create your EarthGuardian AI account",
        content:
          "Head to earthguardian.ai/signup and enter your email address. Choose between a free tier (3 monitoring zones) or a Pro plan (unlimited zones). After verifying your email you will be redirected to the onboarding dashboard.",
      },
      {
        heading: "Configure your monitoring preferences",
        content:
          "In the Settings panel, choose which disaster categories to monitor: earthquakes, floods, wildfires, hurricanes, or volcanic activity. Set severity thresholds — for example, alert only for M5.0+ earthquakes.",
        code: `const prefs = {\n  disasters: ['earthquake', 'flood', 'wildfire'],\n  minSeverity: { earthquake: 5.0, flood: 'moderate' },\n  language: 'en',\n  timezone: 'UTC',\n};`,
      },
      {
        heading: "Set up alert notifications",
        content:
          "Go to Alerts → Notification Channels. EarthGuardian supports email, SMS, Slack webhooks, and push notifications. Configure quiet hours and priority levels per channel.",
      },
      {
        heading: "Connect to satellite data streams",
        content:
          "Navigate to Data → Satellite Streams and authorize the NASA and ESA satellite integrations. These provide near real-time imagery (15–30 min latency) for your selected monitoring zones.",
        code: `const response = await fetch('/api/streams/authorize', {\n  method: 'POST',\n  headers: { Authorization: 'Bearer YOUR_API_KEY' },\n  body: JSON.stringify({ provider: 'NASA_EOS', zoneId: 'zone_123' }),\n});`,
      },
      {
        heading: "Start monitoring global disaster zones",
        content:
          "Click 'Add Zone' on the Map view, draw a polygon or enter coordinates, and give it a name. Your zone will start receiving data within 60 seconds. The dashboard refreshes automatically as new events are detected.",
      },
    ],
    "🔌 API Reference": [
      {
        heading: "RESTful API endpoints for data integration",
        content:
          "All API endpoints are available at https://api.earthguardian.ai/v1. Requests must include your API key in the Authorization header. The API returns JSON with standard HTTP status codes.",
        code: `GET  /v1/events\nGET  /v1/events/:id\nGET  /v1/zones\nPOST /v1/zones\nDELETE /v1/zones/:id`,
      },
      {
        heading: "WebSocket connections for real-time updates",
        content:
          "Connect to wss://stream.earthguardian.ai for live event feeds. After connecting, send a subscription message with your zone IDs. The server sends a heartbeat ping every 30 seconds.",
        code: `const ws = new WebSocket('wss://stream.earthguardian.ai');\nws.onopen = () => {\n  ws.send(JSON.stringify({\n    type: 'subscribe',\n    token: 'YOUR_API_KEY',\n    zones: ['zone_abc', 'zone_xyz'],\n  }));\n};\nws.onmessage = (event) => {\n  const data = JSON.parse(event.data);\n  console.log('New event:', data);\n};`,
      },
      {
        heading: "Authentication and API keys",
        content:
          "Generate API keys from Settings → API Keys. Keys are prefixed with eg_live_ or eg_test_. Pass the key as a Bearer token. Old keys remain valid for 24 hours after rotation.",
        code: `Authorization: Bearer eg_live_xxxxxxxxxxxxxxxxxxxx`,
      },
      {
        heading: "Rate limits and usage quotas",
        content:
          "Free tier: 100 requests/min, 10,000/day. Pro: 1,000 req/min, unlimited/day. Rate limit headers are returned with every response. Exceeding limits returns HTTP 429.",
        code: `X-RateLimit-Limit: 1000\nX-RateLimit-Remaining: 842\nX-RateLimit-Reset: 1712871600`,
      },
      {
        heading: "Error handling and response codes",
        content:
          "Errors follow a consistent shape with a code, message, and optional details field. 4xx errors are client-side; 5xx are server-side and are automatically retried.",
        code: `{\n  "error": {\n    "code": "ZONE_NOT_FOUND",\n    "message": "The zone ID provided does not exist.",\n    "status": 404\n  }\n}`,
      },
    ],
    "📡 Data Sources": [
      {
        heading: "NASA Earth Observing System",
        content:
          "EarthGuardian ingests data from the EOS constellation including Terra, Aqua, and Suomi NPP. Global coverage every 1–2 days with multispectral imaging at 250m–1km resolution — ideal for tracking wildfires and flood extents.",
      },
      {
        heading: "ESA Sentinel Satellite Network",
        content:
          "The Copernicus Sentinel fleet provides 10m resolution SAR (Synthetic Aperture Radar) data, enabling monitoring through cloud cover — critical during typhoon and monsoon events. Sentinel-1 repeats every 6–12 days per location.",
      },
      {
        heading: "NOAA Weather Data",
        content:
          "Real-time NOAA GOES-16/18 weather imagery is ingested every 10 minutes for the Americas. This feeds storm tracking and precipitation prediction models. NOAA GFS forecast data is updated every 6 hours.",
        code: `GET /v1/weather?lat=25.7&lon=-80.2&source=NOAA_GOES`,
      },
      {
        heading: "Global Seismic Networks",
        content:
          "We aggregate feeds from IRIS, USGS, and regional seismic networks — over 8,000 monitoring stations. Event detection latency is typically under 5 minutes for M4.0+ earthquakes globally.",
      },
      {
        heading: "Weather Station Integration",
        content:
          "Ground-truth data from 200,000+ personal and public weather stations (via Weather Underground and MesoWest APIs) supplements satellite observations for hyper-local accuracy.",
      },
    ],
    "🌍 Monitoring Zones": [
      {
        heading: "Define custom monitoring regions",
        content:
          "Zones can be defined as a polygon (draw on map), a bounding box (min/max lat-lon), or a radius around a point. Minimum zone area is 1 km²; maximum is 5,000,000 km² on Pro plans.",
        code: `POST /v1/zones\n{\n  "name": "Pacific Ring of Fire",\n  "type": "polygon",\n  "coordinates": [[130,-10],[180,-10],[180,60],[130,60]],\n  "disasters": ["earthquake", "volcanic"]\n}`,
      },
      {
        heading: "Set priority levels for zones",
        content:
          "Each zone can be assigned a priority: Critical, High, Medium, or Low. Priority affects alert delivery speed (Critical = immediate push + SMS; Low = daily digest email) and data refresh rate.",
      },
      {
        heading: "Configure detection sensitivity",
        content:
          "Per zone, override global preferences. In a coastal zone you might lower the flood threshold to 'minor' while keeping earthquake threshold at M5.0+. Thresholds are evaluated in real-time.",
      },
      {
        heading: "Zone-based alert thresholds",
        content:
          "Define minimum severity levels per disaster type, per zone. Alerts fire only when the threshold is crossed, reducing noise for low-priority regions while keeping critical zones fully monitored.",
      },
      {
        heading: "Historical zone analysis",
        content:
          "The Zone Analytics page shows event frequency, severity distribution, and trend graphs over 7, 30, or 90 days. Export charts as PNG or download underlying data as CSV.",
        code: `POST /v1/zones/:id/reports/schedule\n{\n  "frequency": "weekly",\n  "format": "pdf",\n  "recipients": ["ops@yourorg.com"]\n}`,
      },
    ],
    "🤖 AI Models": [
      {
        heading: "Disaster pattern recognition models",
        content:
          "Our core detection model is a Vision Transformer (ViT-L/16) fine-tuned on 4.2M labeled satellite frames across 6 disaster categories. It achieves 94.3% precision and 91.7% recall on our held-out test set.",
      },
      {
        heading: "Predictive analytics algorithms",
        content:
          "The prediction engine uses an ensemble of gradient-boosted trees (XGBoost) and a temporal convolutional network (TCN) to forecast disaster likelihood 24–72 hours ahead with probability scores and confidence intervals.",
        code: `GET /v1/predict/flood?zoneId=zone_123&horizon=72h\n\n// Response\n{\n  "probability": 0.73,\n  "confidence": 0.85,\n  "peak_window": "2026-04-13T06:00Z"\n}`,
      },
      {
        heading: "Camouflage detection networks",
        content:
          "Multispectral analysis using near-infrared and thermal bands detects camouflaged installations with 98% precision. The model runs on Sentinel-2 and Landsat-9 imagery updated every 5 days.",
      },
      {
        heading: "Human detection AI",
        content:
          "Our rescue AI detects human heat signatures in disaster zones using thermal imagery from UAV and satellite feeds. Outputs GPS coordinates with 3m accuracy for rescue team dispatch.",
      },
      {
        heading: "Custom model training",
        content:
          "Pro and Enterprise plans allow you to submit labeled imagery from your specific zones to fine-tune a variant of the base model. Contact sales@earthguardian.ai to discuss requirements and timelines.",
        code: `POST /v1/infer\nContent-Type: multipart/form-data\n\n{ "file": <image.tiff>, "model": "wildfire-v3" }`,
      },
    ],
    "🔒 Security & Compliance": [
      {
        heading: "GDPR compliance guidelines",
        content:
          "EarthGuardian is fully GDPR compliant. We act as a data processor under your instructions. A Data Processing Agreement (DPA) is available for all paid plans. EU users can exercise data rights via Settings → Privacy.",
      },
      {
        heading: "Data encryption standards",
        content:
          "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Satellite imagery is stored in isolated S3 buckets with server-side encryption. API keys are hashed with bcrypt before storage.",
      },
      {
        heading: "Access control policies",
        content:
          "Use Role-Based Access Control (RBAC) to assign teammates roles: Owner, Admin, Analyst, or Viewer. SSO via SAML 2.0 is available on Enterprise plans.",
        code: `POST /v1/team/invite\n{\n  "email": "analyst@yourorg.com",\n  "role": "analyst"\n}`,
      },
      {
        heading: "Audit logging",
        content:
          "All user actions are written to an immutable audit log retained for 12 months on Pro and 7 years on Enterprise. Export as JSON or CSV at any time.",
        code: `GET /v1/audit?limit=50&after=2026-04-01T00:00Z`,
      },
      {
        heading: "Incident response procedures",
        content:
          "In the event of a security incident, we notify affected customers within 72 hours as required by GDPR. The security team is reachable 24/7 at security@earthguardian.ai. Post-incident reports are published within 14 days for P0 incidents.",
      },
    ],
  };

  const sections = detailContent[section.title] || [];

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#0a0a0a",
        paddingTop: "140px",
        paddingBottom: "80px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "1px solid rgba(136,170,255,0.3)",
            color: "#88aaff",
            padding: "10px 24px",
            borderRadius: "40px",
            cursor: "pointer",
            fontSize: "14px",
            marginBottom: "40px",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(136,170,255,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          ← Back to Docs
        </button>

        {/* Header */}
        <div
          style={{
            marginBottom: "3rem",
            paddingBottom: "2rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            animation: "fadeInUp 0.6s ease",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "1rem" }}>
            {section.icon}
          </div>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              fontWeight: 800,
              color: section.color,
              marginBottom: "1rem",
              letterSpacing: "-0.02em",
            }}
          >
            {section.title}
          </h1>
          <span style={{ color: "#555", fontSize: "13px" }}>
            ⏱ {section.timeEstimate} read
          </span>
        </div>

        {/* Sections */}
        {sections.map((item, i) => (
          <div
            key={i}
            style={{
              marginBottom: "2.5rem",
              animation: `fadeInUp 0.6s ease ${i * 0.08}s both`,
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#e2e8f0",
                marginBottom: "0.75rem",
              }}
            >
              <span style={{ color: section.color, marginRight: "8px" }}>
                {String(i + 1).padStart(2, "0")}.
              </span>
              {item.heading}
            </h2>
            <p
              style={{
                color: "#999",
                fontSize: "15px",
                lineHeight: "1.75",
                marginBottom: item.code ? "1rem" : 0,
              }}
            >
              {item.content}
            </p>
            {item.code && (
              <pre
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  overflowX: "auto",
                  fontSize: "13px",
                  fontFamily: "monospace",
                  color: "#a5f3fc",
                  lineHeight: "1.7",
                  margin: 0,
                }}
              >
                <code>{item.code}</code>
              </pre>
            )}
          </div>
        ))}

        {/* Back button bottom */}
        <div
          style={{
            marginTop: "4rem",
            paddingTop: "2rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: "transparent",
              border: "1px solid rgba(136,170,255,0.3)",
              color: "#88aaff",
              padding: "10px 24px",
              borderRadius: "40px",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(136,170,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            ← Back to Docs
          </button>
        </div>
      </div>
    </div>
  );
};

/* ===== ENHANCED DOCS PAGE ===== */
const DocsPage = () => {
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const sections = [
    {
      title: "🚀 Getting Started",
      icon: "🚀",
      content: [
        "Create your EarthGuardian AI account",
        "Configure your monitoring preferences",
        "Set up alert notifications",
        "Connect to satellite data streams",
        "Start monitoring global disaster zones",
      ],
      color: "#f97316",
      timeEstimate: "10 mins",
    },
    {
      title: "🔌 API Reference",
      icon: "🔌",
      content: [
        "RESTful API endpoints for data integration",
        "WebSocket connections for real-time updates",
        "Authentication and API keys",
        "Rate limits and usage quotas",
        "Error handling and response codes",
      ],
      color: "#a78bfa",
      timeEstimate: "30 mins",
    },
    {
      title: "📡 Data Sources",
      icon: "📡",
      content: [
        "NASA Earth Observing System",
        "ESA Sentinel Satellite Network",
        "NOAA Weather Data",
        "Global Seismic Networks",
        "Weather Station Integration",
      ],
      color: "#34d399",
      timeEstimate: "20 mins",
    },
    {
      title: "🌍 Monitoring Zones",
      icon: "🌍",
      content: [
        "Define custom monitoring regions",
        "Set priority levels for zones",
        "Configure detection sensitivity",
        "Zone-based alert thresholds",
        "Historical zone analysis",
      ],
      color: "#60a5fa",
      timeEstimate: "15 mins",
    },
    {
      title: "🤖 AI Models",
      icon: "🤖",
      content: [
        "Disaster pattern recognition models",
        "Predictive analytics algorithms",
        "Camouflage detection networks",
        "Human detection AI",
        "Custom model training",
      ],
      color: "#f472b6",
      timeEstimate: "45 mins",
    },
    {
      title: "🔒 Security & Compliance",
      icon: "🔒",
      content: [
        "GDPR compliance guidelines",
        "Data encryption standards",
        "Access control policies",
        "Audit logging",
        "Incident response procedures",
      ],
      color: "#fbbf24",
      timeEstimate: "25 mins",
    },
  ];

  // Show detail page if a doc is selected
  if (selectedDoc) {
    return (
      <DocDetailPage
        section={selectedDoc}
        onBack={() => setSelectedDoc(null)}
      />
    );
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#0a0a0a",
        paddingTop: "140px",
        paddingBottom: "80px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "60px",
            animation: "fadeInUp 0.8s ease",
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
            }}
          >
            <span
              style={{
                color: "#88aaff",
                fontSize: "14px",
                letterSpacing: "2px",
              }}
            >
              📚 COMPREHENSIVE GUIDES
            </span>
          </div>
          <h1
            style={{
              fontSize: "48px",
              fontWeight: 800,
              marginBottom: "20px",
              background: "linear-gradient(135deg, #ffffff, #88aaff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Documentation
          </h1>
          <p
            style={{
              color: "#aaa",
              fontSize: "18px",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            Comprehensive guides and documentation for EarthGuardian AI
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "30px",
          }}
        >
          {sections.map((section, index) => (
            <div
              key={index}
              onMouseEnter={() => setActiveSection(index)}
              onMouseLeave={() => setActiveSection(null)}
              style={{
                background:
                  activeSection === index
                    ? `linear-gradient(135deg, ${section.color}20, rgba(20,20,30,0.9))`
                    : "rgba(20, 20, 30, 0.7)",
                backdropFilter: "blur(15px)",
                borderRadius: "24px",
                padding: "32px",
                border: `1px solid ${section.color}40`,
                transition: "all 0.4s ease",
                transform:
                  activeSection === index
                    ? "translateY(-8px)"
                    : "translateY(0)",
                boxShadow:
                  activeSection === index
                    ? `0 20px 40px -15px ${section.color}`
                    : "0 10px 30px -10px rgba(0,0,0,0.5)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "20px",
                  animation:
                    activeSection === index ? "bounce 0.5s ease" : "none",
                }}
              >
                {section.icon}
              </div>
              <h3
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  marginBottom: "20px",
                  color: section.color,
                }}
              >
                {section.title}
              </h3>
              <ul
                style={{
                  color: "#999",
                  lineHeight: "1.8",
                  paddingLeft: "20px",
                  marginBottom: "20px",
                }}
              >
                {section.content.map((item, i) => (
                  <li key={i} style={{ marginBottom: "8px" }}>
                    ✓ {item}
                  </li>
                ))}
              </ul>
              <div
                style={{
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop: `1px solid ${section.color}40`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: section.color,
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  ⏱️ {section.timeEstimate} read
                </span>
                <span
                  onClick={() => setSelectedDoc(section)}
                  style={{
                    color: section.color,
                    fontSize: "14px",
                    cursor: "pointer",
                    padding: "6px 16px",
                    border: `1px solid ${section.color}60`,
                    borderRadius: "20px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${section.color}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  Read more →
                </span>
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: "60px",
            textAlign: "center",
            padding: "50px",
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(136,170,255,0.1))",
            borderRadius: "24px",
            border: "1px solid rgba(136, 170, 255, 0.2)",
            animation: "fadeInUp 0.8s ease",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>💬</div>
          <h3
            style={{ fontSize: "28px", marginBottom: "20px", color: "#88aaff" }}
          >
            Need Help?
          </h3>
          <p style={{ color: "#aaa", marginBottom: "30px", fontSize: "18px" }}>
            Our support team is available 24/7 to assist you
          </p>
          <GlowingButton onClick={() => {}}>Contact Support</GlowingButton>
        </div>
      </div>
    </div>
  );
};

/* ===== ENHANCED COMMUNITY PAGE ===== */
const CommunityPage = ({ setCurrentPage }: { setCurrentPage: (page: string) => void }) => {
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const [hoveredTestimonial, setHoveredTestimonial] = useState<number | null>(
    null
  );

  const stats = [
    {
      value: "10K+",
      label: "Active Users",
      color: "#3b82f6",
      icon: "👥",
      growth: "+25% MoM — fastest growing in disaster-tech",
      tagline: "Join 50,000+ professionals",
      why: "From UN coordinators to frontline responders, tomorrow's world will rely on EarthGuardian as an intelligent, real-time decision engine—empowering critical, life-saving actions with speed, precision, and trust.",
    },
    {
      value: "120+",
      label: "Countries",
      color: "#88aaff",
      icon: "🌍",
      growth: "Global reach across 6 continents",
      tagline: "Truly global coverage",
      why: "No matter where a disaster happens, EarthGuardian will already be watching and understanding it—24/7 across the world. In the future, it'll help us act faster, save more lives, and reduce damage by giving real-time alerts and smart decisions before things get worse.",
    },
    {
      value: "5K+",
      label: "Contributors",
      color: "#a855f7",
      icon: "🤝",
      growth: "Backed by defense & climate experts",
      tagline: "Built by the best minds",
      why: "EarthGuardian AI will help us detect disasters early, respond quickly, and protect more lives in the future.",
    },
    {
      value: "100+",
      label: "Partners",
      color: "#ec4899",
      icon: "🏢",
      growth: "UN agencies, NATO allies & Fortune 500",
      tagline: "World-class institutions",
      why: "Partnered with FEMA, NATO, NASA & leading climate institutes — the institutions protecting our world trust EarthGuardian.",
    },
  ];

  const testimonials = [
    {
      name: "Krishna",
      role: "Disaster Response Coordinator, UN",
      content: "",
      avatar: "👩‍⚕️",
      rating: 5,
      date: "March 2026",
    },
    {
      name: "Divya",
      role: "CTO, Global Defense Systems",
      content:
        "The camouflage detection capabilities are unmatched. This technology is a game-changer for national security applications.",
      avatar: "👨‍💻",
      rating: 5,
      date: "February 2026",
    },
    {
      name: "Kartikeya",
      role: "Lead Researcher, Climate Institute",
      content:
        "The accuracy of disaster pattern recognition has exceeded our expectations. A vital tool for climate research.",
      avatar: "👩‍🔬",
      rating: 5,
      date: "March 2026",
    },
    {
      name: "Geet",
      role: "Emergency Management Director, FEMA",
      content:
        "This platform has transformed our emergency response capabilities. The AI predictions are remarkably accurate.",
      avatar: "👨‍⚕️",
      rating: 5,
      date: "January 2026",
    },
  ];

  const communityLinks = [
    {
      icon: "💬",
      title: "Discord Server",
      members: "15,000+",
      color: "#5865F2",
      link: "#",
    },
    {
      icon: "🐙",
      title: "GitHub",
      members: "8,500+ stars",
      color: "#ffffff",
      link: "#",
    },
    {
      icon: "📧",
      title: "Newsletter",
      members: "25,000+ subscribers",
      color: "#88aaff",
      link: "#",
    },
    {
      icon: "🐦",
      title: "Twitter/X",
      members: "50,000+ followers",
      color: "#1DA1F2",
      link: "#",
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#0a0a0a",
        paddingTop: "140px",
        paddingBottom: "80px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "60px",
            animation: "fadeInUp 0.8s ease",
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
            }}
          >
            <span
              style={{
                color: "#88aaff",
                fontSize: "14px",
                letterSpacing: "2px",
              }}
            >
              🌍 GLOBAL COMMUNITY
            </span>
          </div>
          <h1
            style={{
              fontSize: "48px",
              fontWeight: 800,
              marginBottom: "20px",
              background: "linear-gradient(135deg, #ffffff, #88aaff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Join Our Community
          </h1>
          <p
            style={{
              color: "#aaa",
              fontSize: "18px",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            Trusted by leading institutions, defense agencies, and climate
            researchers across 120+ nations — join a rapidly growing ecosystem
            protecting lives and critical infrastructure at scale.
          </p>
        </div>

        {/* ===== 4 STAT BOXES ===== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "30px",
            marginBottom: "80px",
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredStat(i)}
              onMouseLeave={() => setHoveredStat(null)}
              style={{
                background:
                  hoveredStat === i
                    ? `linear-gradient(135deg, ${stat.color}25, rgba(20,20,30,0.95))`
                    : "rgba(20, 20, 30, 0.7)",
                backdropFilter: "blur(15px)",
                borderRadius: "24px",
                padding: "32px 28px",
                textAlign: "center",
                border: `1px solid ${
                  hoveredStat === i ? stat.color + "80" : stat.color + "40"
                }`,
                transition: "all 0.4s ease",
                transform:
                  hoveredStat === i
                    ? "translateY(-10px) scale(1.03)"
                    : "translateY(0) scale(1)",
                cursor: "pointer",
                boxShadow:
                  hoveredStat === i
                    ? `0 20px 50px -15px ${stat.color}60`
                    : "none",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>
                {stat.icon}
              </div>
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: 800,
                  color: stat.color,
                  textShadow: `0 0 20px ${stat.color}`,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  color: "#888",
                  fontSize: "16px",
                  marginTop: "10px",
                  fontWeight: 600,
                }}
              >
                {stat.label}
              </div>

              {/* Shown on hover */}
              {hoveredStat === i ? (
                <div style={{ animation: "fadeInUp 0.3s ease" }}>
                  <div
                    style={{
                      marginTop: "16px",
                      color: stat.color,
                      fontSize: "13px",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                    }}
                  >
                    {stat.tagline}
                  </div>
                  <p
                    style={{
                      marginTop: "10px",
                      color: "#bbb",
                      fontSize: "13px",
                      lineHeight: "1.6",
                    }}
                  >
                    {stat.why}
                  </p>
                  <div
                    style={{
                      marginTop: "12px",
                      color: stat.color,
                      fontSize: "12px",
                      opacity: 0.85,
                    }}
                  >
                    📈 {stat.growth}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    marginTop: "14px",
                    color: stat.color,
                    fontSize: "12px",
                    opacity: 0.7,
                  }}
                >
                  Hover to learn more ↑
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "80px" }}>
          <h2
            style={{
              fontSize: "32px",
              textAlign: "center",
              marginBottom: "40px",
              color: "#88aaff",
            }}
          >
            What Our Users Say
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "30px",
            }}
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredTestimonial(index)}
                onMouseLeave={() => setHoveredTestimonial(null)}
                style={{
                  background:
                    hoveredTestimonial === index
                      ? "rgba(136, 170, 255, 0.15)"
                      : "rgba(20, 20, 30, 0.7)",
                  backdropFilter: "blur(15px)",
                  borderRadius: "24px",
                  padding: "32px",
                  border: `1px solid rgba(136, 170, 255, ${
                    hoveredTestimonial === index ? "0.4" : "0.2"
                  })`,
                  transition: "all 0.4s ease",
                  transform:
                    hoveredTestimonial === index
                      ? "translateY(-8px)"
                      : "translateY(0)",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ fontSize: "60px" }}>{testimonial.avatar}</div>
                  <div>
                    <h4
                      style={{
                        color: "#88aaff",
                        marginBottom: "5px",
                        fontSize: "18px",
                      }}
                    >
                      {testimonial.name}
                    </h4>
                    <p style={{ color: "#666", fontSize: "12px" }}>
                      {testimonial.role}
                    </p>
                    <p style={{ color: "#666", fontSize: "11px" }}>
                      {testimonial.date}
                    </p>
                  </div>
                </div>
                <p
                  style={{
                    color: "#fff",
                    fontSize: "16px",
                    lineHeight: "1.6",
                    marginBottom: "15px",
                    fontStyle: "italic",
                  }}
                >
                  "{testimonial.content}"
                </p>
                <div style={{ color: "#fbbf24", fontSize: "18px" }}>★★★★★</div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "30px",
            marginBottom: "60px",
          }}
        >
          {communityLinks.map((link, index) => (
            <div
              key={index}
              style={{
                background: "rgba(20, 20, 30, 0.7)",
                backdropFilter: "blur(15px)",
                borderRadius: "24px",
                padding: "32px",
                textAlign: "center",
                border: `1px solid ${link.color}40`,
                transition: "all 0.4s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = `0 20px 40px -15px ${link.color}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>
                {link.icon}
              </div>
              <h3
                style={{
                  fontSize: "24px",
                  marginBottom: "10px",
                  color: link.color,
                }}
              >
                {link.title}
              </h3>
              <p style={{ color: "#999", marginBottom: "20px" }}>
                {link.members}
              </p>
              <button
                onClick={() => {}}
                style={{
                  padding: "12px 32px",
                  background: "linear-gradient(135deg, #3b82f6, #88aaff)",
                  borderRadius: "50px",
                  border: "none",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  transform: "scale(1)",
                  boxShadow: "0 0 15px rgba(59,130,246,0.3)",
                  letterSpacing: "1px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0 0 25px rgba(59,130,246,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 0 15px rgba(59,130,246,0.3)";
                }}
              >
                Join Now
              </button>
            </div>
          ))}
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "50px",
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(136,170,255,0.1))",
            borderRadius: "24px",
            animation: "fadeInUp 0.8s ease",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>🌟</div>
          <h3
            style={{ fontSize: "28px", marginBottom: "15px", color: "#88aaff" }}
          >
            Become a Contributor
          </h3>
          <p
            style={{
              color: "#aaa",
              marginBottom: "25px",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
              fontSize: "18px",
            }}
          >
            Help us build a safer world. Join our team of developers,
            researchers, and disaster response experts.
          </p>
          {/* STEP 5: Wired "Apply Now →" button to navigate to the apply page */}
          <GlowingButton onClick={() => setCurrentPage("apply")}>Apply Now →</GlowingButton>
        </div>
      </div>
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
      @keyframes slideIn {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
      }
      @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
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

/* ===== MAIN APP COMPONENT WITH ROUTING ===== */
const App = () => {
  const [currentPage, setCurrentPage] = useState("home");

  const handleEnterDashboard = () => {
    setCurrentPage("dashboard");
  };

  const handleLoginClick = () => {
    setCurrentPage("signin");
  };

  const handleSignupClick = () => {
    setCurrentPage("signup");
  };

  const handleLogin = (email: string, password: string) => {
    console.log("Login attempted with:", email, password);
    setCurrentPage("dashboard");
  };

  const handleSignup = (name: string, email: string, password: string) => {
    console.log("Signup attempted with:", name, email, password);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setCurrentPage("home");
  };

  return (
    <div>
      <Navbar setCurrentPage={setCurrentPage} />
      {currentPage === "home" && (
        <LandingPage
          onEnterDashboard={handleEnterDashboard}
          onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick}
        />
      )}
      {currentPage === "signin" && (
        <Login
          onLogin={handleLogin}
          onSignupClick={() => setCurrentPage("signup")}
          onBackToLanding={() => setCurrentPage("home")}
        />
      )}
      {currentPage === "signup" && (
        <Signup
          onSignup={handleSignup}
          onLoginClick={() => setCurrentPage("signin")}
          onBackToLanding={() => setCurrentPage("home")}
        />
      )}
      {currentPage === "dashboard" && <Dashboard onLogout={handleLogout} />}
      {currentPage === "features" && <FeaturesPage />}
      {currentPage === "docs" && <DocsPage />}
      {currentPage === "community" && (
        <CommunityPage setCurrentPage={setCurrentPage} />
      )}
      {/* STEP 4: Render ApplyNow page, with back button returning to community */}
      {currentPage === "apply" && (
        <ApplyNow onBack={() => setCurrentPage("community")} />
      )}
    </div>
  );
};

export default App;
