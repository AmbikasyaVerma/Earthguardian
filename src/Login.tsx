import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

const Login = ({ onLogin, onSignupClick, onBackToLanding }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes glowPulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      onLogin(email, password);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 50%, #0a0a1a, #000000)",
        position: "relative",
        overflow: "hidden",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* Animated background stars */}
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
        <Canvas camera={{ position: [0, 0, 5] }}>
          <Stars
            radius={300}
            depth={60}
            count={8000}
            factor={8}
            saturation={0}
            fade
            speed={0.5}
          />
        </Canvas>
      </div>

      {/* Floating particles */}
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
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              background: `rgba(136, 170, 255, ${Math.random() * 0.3})`,
              borderRadius: "50%",
              animation: `float ${Math.random() * 15 + 10}s infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Back button */}
      <button
        onClick={onBackToLanding}
        style={{
          position: "absolute",
          top: "30px",
          left: "30px",
          zIndex: 20,
          background: "rgba(20,20,30,0.4)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(136,170,255,0.2)",
          borderRadius: "40px",
          padding: "10px 20px",
          color: "#88aaff",
          fontSize: "14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(136,170,255,0.15)";
          e.currentTarget.style.transform = "translateX(-5px)";
          e.currentTarget.style.boxShadow = "0 0 20px rgba(136,170,255,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(20,20,30,0.4)";
          e.currentTarget.style.transform = "translateX(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        ← Back to Home
      </button>

      {/* Login Card */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "460px",
          animation: "slideIn 0.8s ease",
        }}
      >
        {/* Decorative rings */}
        <div
          style={{
            position: "absolute",
            top: -20,
            left: -20,
            right: -20,
            bottom: -20,
            borderRadius: "40px",
            background:
              "linear-gradient(135deg, #88aaff20, #3b82f620, #a855f720)",
            filter: "blur(40px)",
            zIndex: -1,
          }}
        />

        <div
          style={{
            background: "rgba(20, 20, 30, 0.8)",
            backdropFilter: "blur(20px)",
            borderRadius: "32px",
            padding: "48px 40px",
            border: "1px solid rgba(136, 170, 255, 0.25)",
            boxShadow:
              "0 30px 60px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(136,170,255,0.1) inset, 0 0 40px rgba(136,170,255,0.1)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Animated gradient background */}
          <div
            style={{
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background:
                "radial-gradient(circle at 30% 40%, rgba(136,170,255,0.1) 0%, transparent 50%)",
              animation: "rotate 20s linear infinite",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          {/* Logo with glow */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "40px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "16px",
                borderRadius: "50%",
                background: "rgba(136,170,255,0.1)",
                marginBottom: "16px",
                animation: "float 3s ease-in-out infinite",
              }}
            >
              <span
                style={{
                  fontSize: "48px",
                  filter: "drop-shadow(0 0 20px #88aaff)",
                  display: "block",
                }}
              >
                🛰️
              </span>
            </div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 700,
                margin: "0 0 8px 0",
                background:
                  "linear-gradient(135deg, #ffffff, #88aaff, #aaccff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome Back
            </h1>
            <p
              style={{
                color: "#888",
                fontSize: "15px",
                margin: 0,
                letterSpacing: "0.5px",
              }}
            >
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "16px",
                padding: "14px 18px",
                marginBottom: "24px",
                color: "#ef4444",
                fontSize: "14px",
                textAlign: "center",
                position: "relative",
                zIndex: 1,
                backdropFilter: "blur(10px)",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ position: "relative", zIndex: 1 }}
          >
            {/* Email field */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  color: "#aaa",
                  fontSize: "13px",
                  marginBottom: "8px",
                  letterSpacing: "1px",
                  fontWeight: 500,
                }}
              >
                EMAIL ADDRESS
              </label>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#88aaff",
                    fontSize: "20px",
                    zIndex: 2,
                    pointerEvents: "none",
                  }}
                >
                  ✉️
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "16px 16px 16px 52px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(136,170,255,0.2)",
                    borderRadius: "16px",
                    color: "white",
                    fontSize: "15px",
                    outline: "none",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#88aaff";
                    e.currentTarget.style.boxShadow =
                      "0 0 20px rgba(136,170,255,0.3)";
                    e.currentTarget.style.background = "rgba(0,0,0,0.5)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(136,170,255,0.2)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "rgba(0,0,0,0.3)";
                  }}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password field */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  color: "#aaa",
                  fontSize: "13px",
                  marginBottom: "8px",
                  letterSpacing: "1px",
                  fontWeight: 500,
                }}
              >
                PASSWORD
              </label>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#88aaff",
                    fontSize: "20px",
                    zIndex: 2,
                    pointerEvents: "none",
                  }}
                >
                  🔒
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "16px 52px 16px 52px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(136,170,255,0.2)",
                    borderRadius: "16px",
                    color: "white",
                    fontSize: "15px",
                    outline: "none",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#88aaff";
                    e.currentTarget.style.boxShadow =
                      "0 0 20px rgba(136,170,255,0.3)";
                    e.currentTarget.style.background = "rgba(0,0,0,0.5)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(136,170,255,0.2)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "rgba(0,0,0,0.3)";
                  }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "#888",
                    cursor: "pointer",
                    fontSize: "20px",
                    padding: "5px",
                    zIndex: 2,
                    transition: "color 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#88aaff")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "32px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  color: "#aaa",
                  fontSize: "14px",
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                    accentColor: "#88aaff",
                  }}
                />
                Remember me
              </label>
              <span
                style={{
                  color: "#88aaff",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textShadow = "0 0 10px #88aaff";
                  e.currentTarget.style.textDecoration = "underline";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textShadow = "none";
                  e.currentTarget.style.textDecoration = "none";
                }}
              >
                Forgot password?
              </span>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "16px",
                background: isLoading
                  ? "linear-gradient(135deg, #1e3a8a, #1e4b8a)"
                  : "linear-gradient(135deg, #3b82f6, #88aaff)",
                border: "none",
                borderRadius: "30px",
                color: "white",
                fontSize: "16px",
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                transition: "all 0.3s ease",
                boxShadow: "0 0 30px rgba(59,130,246,0.3)",
                marginBottom: "24px",
                position: "relative",
                overflow: "hidden",
                letterSpacing: "1px",
                boxSizing: "border-box",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 0 40px rgba(59,130,246,0.5)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 0 30px rgba(59,130,246,0.3)";
                }
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      animation: "rotate 1s linear infinite",
                    }}
                  />
                  <span>SIGNING IN...</span>
                </div>
              ) : (
                "SIGN IN"
              )}
            </button>

            {/* Signup link */}
            <p
              style={{
                textAlign: "center",
                color: "#888",
                fontSize: "14px",
                margin: 0,
              }}
            >
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onSignupClick}
                style={{
                  background: "none",
                  border: "none",
                  color: "#88aaff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  padding: "0 4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textShadow = "0 0 10px #88aaff";
                  e.currentTarget.style.textDecoration = "underline";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textShadow = "none";
                  e.currentTarget.style.textDecoration = "none";
                }}
              >
                Sign up
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
