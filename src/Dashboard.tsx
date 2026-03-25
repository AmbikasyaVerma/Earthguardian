import React, { useState, useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/* ===== TYPES ===== */
interface Alert {
  id: number;
  type: "fire" | "flood" | "deforestation" | "rescue" | "camouflage";
  title: string;
  location: string;
  time: string;
  color: string;
  icon: string;
  coords: [number, number];
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  temperature?: string;
  wind?: string;
  humidity?: string;
  region?: string;
  source?: string;
}

/* ===== MULTIPLE API SOURCES ===== */

// NASA EONET API
const fetchNASAAlerts = async (): Promise<Alert[]> => {
  try {
    const response = await fetch("https://eonet.gsfc.nasa.gov/api/v3/events");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const events = data.events || [];

    return events.slice(0, 10).map((event: any, index: number) => {
      const category = event.categories[0]?.title?.toLowerCase() || "";
      let type: Alert["type"] = "fire";
      let icon = "🔥";
      let color = "#ef4444";

      if (category.includes("wildfire") || category.includes("fire")) {
        type = "fire";
        icon = "🔥";
        color = "#ef4444";
      } else if (category.includes("flood")) {
        type = "flood";
        icon = "💧";
        color = "#3b82f6";
      } else if (
        category.includes("storm") ||
        category.includes("cyclone") ||
        category.includes("hurricane")
      ) {
        type = "flood";
        icon = "💧";
        color = "#3b82f6";
      } else if (
        category.includes("landslide") ||
        category.includes("earthquake")
      ) {
        type = "rescue";
        icon = "🆘";
        color = "#f59e0b";
      } else if (category.includes("volcano")) {
        type = "camouflage";
        icon = "🌋";
        color = "#a855f7";
      } else {
        type = "deforestation";
        icon = "🌲";
        color = "#10b981";
      }

      let severity: Alert["severity"] = "medium";
      if (
        category.includes("wildfire") ||
        category.includes("severe") ||
        category.includes("critical")
      ) {
        severity = "critical";
      } else if (category.includes("flood") || category.includes("storm")) {
        severity = "high";
      }

      const coords = event.geometry[0]?.coordinates || [0, 0];
      const lat = coords[1] || 0;
      const lng = coords[0] || 0;
      const location = event.title.split(" - ")[0] || "Unknown";

      const eventDate = event.geometry[0]?.date;
      const timeAgo = eventDate
        ? formatTimeAgo(new Date(eventDate))
        : "Recently";

      return {
        id: index + 1,
        type,
        title: event.title.substring(0, 60),
        location,
        time: timeAgo,
        color,
        icon,
        coords: [lng, lat],
        severity,
        description: event.description || `NASA EONET detected: ${event.title}`,
        source: "NASA EONET",
      };
    });
  } catch (error) {
    console.error("NASA API error:", error);
    return [];
  }
};

// USGS Earthquake API (Free, no API key needed)
const fetchEarthquakeAlerts = async (): Promise<Alert[]> => {
  try {
    const response = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson"
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const features = data.features || [];

    return features.slice(0, 5).map((feature: any, index: number) => {
      const mag = feature.properties.mag || 0;
      const location = feature.properties.place || "Unknown";
      const coords = feature.geometry.coordinates;

      let severity: Alert["severity"] = "medium";
      if (mag > 5.5) severity = "critical";
      else if (mag > 4) severity = "high";
      else if (mag > 2.5) severity = "medium";
      else severity = "low";

      return {
        id: index + 100,
        type: "rescue",
        title: `Earthquake M${mag.toFixed(1)}`,
        location: location,
        time: formatTimeAgo(new Date(feature.properties.time)),
        color:
          severity === "critical"
            ? "#ef4444"
            : severity === "high"
            ? "#f59e0b"
            : "#3b82f6",
        icon: "🌍",
        coords: [coords[0], coords[1]],
        severity: severity,
        description: `Magnitude ${mag.toFixed(
          1
        )} earthquake detected at ${location}. Depth: ${coords[2]}km`,
        source: "USGS",
      };
    });
  } catch (error) {
    console.error("USGS API error:", error);
    return [];
  }
};

// OpenWeatherMap (Optional - you can add your API key)
// const fetchWeatherAlerts = async () => { ... }

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

// Combined fetch from all APIs
const fetchAllRealTimeAlerts = async (): Promise<Alert[]> => {
  try {
    const [nasaAlerts, earthquakeAlerts] = await Promise.all([
      fetchNASAAlerts(),
      fetchEarthquakeAlerts(),
    ]);

    // Combine and sort by severity (critical first)
    const allAlerts = [...nasaAlerts, ...earthquakeAlerts];
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    allAlerts.sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
    );

    return allAlerts.slice(0, 20);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return [];
  }
};

/* ===== FIXED ALERT SOUND NOTIFICATION SYSTEM ===== */
const useAlertSound = () => {
  // Create audio context only when needed
  const playSound = (
    frequency: number,
    duration: number,
    volume: number = 0.3
  ) => {
    try {
      // Create audio context
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();

      // Resume if suspended
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      // Volume envelope
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + duration
      );

      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);

      // Clean up after sound finishes
      setTimeout(() => {
        audioContext.close();
      }, duration * 1000 + 100);
    } catch (error) {
      console.log("Audio play failed:", error);
    }
  };

  const playCriticalSound = () => {
    // Two beeps for critical: 880Hz, 0.3s each, 0.2s gap
    playSound(880, 0.3, 0.4);
    setTimeout(() => {
      playSound(880, 0.3, 0.4);
    }, 500);
  };

  const playHighSound = () => {
    // One beep for high: 660Hz, 0.4s
    playSound(660, 0.4, 0.3);
  };

  return { playCriticalSound, playHighSound };
};

/* ===== NOTIFICATION TOAST COMPONENT ===== */
interface Notification {
  id: number;
  message: string;
  type: "critical" | "high" | "medium" | "low";
  title: string;
}

const NotificationToast: React.FC<{
  notification: Notification;
  onClose: (id: number) => void;
  isDarkMode: boolean;
}> = ({ notification, onClose, isDarkMode }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(notification.id), 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const getTypeStyles = () => {
    switch (notification.type) {
      case "critical":
        return {
          background: "linear-gradient(135deg, #ef4444, #dc2626)",
          borderLeft: "4px solid #ff6b6b",
          icon: "🚨",
        };
      case "high":
        return {
          background: "linear-gradient(135deg, #f59e0b, #d97706)",
          borderLeft: "4px solid #fbbf24",
          icon: "⚠️",
        };
      case "medium":
        return {
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          borderLeft: "4px solid #60a5fa",
          icon: "📢",
        };
      default:
        return {
          background: "linear-gradient(135deg, #6b7280, #4b5563)",
          borderLeft: "4px solid #9ca3af",
          icon: "ℹ️",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 10000,
        animation:
          "slideInRight 0.3s ease-out, fadeOut 0.3s ease-in 4.7s forwards",
        maxWidth: "380px",
        width: "100%",
      }}
    >
      <div
        style={{
          background: isDarkMode ? "#1a1a24" : "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
          border: `1px solid ${
            notification.type === "critical" ? "#ef4444" : "#3b82f6"
          }30`,
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", padding: "16px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: styles.background,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              marginRight: "12px",
            }}
          >
            {styles.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h4
              style={{
                margin: "0 0 4px 0",
                fontSize: "14px",
                fontWeight: 600,
                color: isDarkMode ? "#fff" : "#000",
              }}
            >
              {notification.title}
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                color: isDarkMode ? "#aaa" : "#666",
                lineHeight: "1.4",
              }}
            >
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => onClose(notification.id)}
            style={{
              background: "transparent",
              border: "none",
              color: isDarkMode ? "#666" : "#999",
              cursor: "pointer",
              fontSize: "16px",
              padding: "4px",
            }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            height: "3px",
            background:
              notification.type === "critical"
                ? "#ef4444"
                : notification.type === "high"
                ? "#f59e0b"
                : "#3b82f6",
            width: "100%",
            animation: "shrinkWidth 5s linear forwards",
          }}
        />
      </div>
    </div>
  );
};

/* ===== THEME TOGGLE BUTTON ===== */
const ThemeToggleButton = ({
  isDarkMode,
  toggleTheme,
}: {
  isDarkMode: boolean;
  toggleTheme: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      onClick={toggleTheme}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "fixed",
        bottom: "30px",
        left: "30px",
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        background: isDarkMode
          ? "linear-gradient(135deg, #f59e0b, #fbbf24)"
          : "linear-gradient(135deg, #1e3a8a, #3b82f6)",
        border: "none",
        cursor: "pointer",
        boxShadow: isHovered
          ? isDarkMode
            ? "0 0 30px #f59e0b"
            : "0 0 30px #3b82f6"
          : "0 0 15px rgba(0,0,0,0.3)",
        zIndex: 1000,
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        transform: isHovered ? "scale(1.1)" : "scale(1)",
      }}
      title={`Switch to ${isDarkMode ? "Light" : "Dark"} Mode (Ctrl + D)`}
    >
      {isDarkMode ? "☀️" : "🌙"}
    </button>
  );
};

/* ===== ENHANCED MARKER ===== */
const EnhancedMarker: React.FC<{ alert: Alert; isDarkMode: boolean }> = ({
  alert,
  isDarkMode,
}) => {
  const severityColor =
    alert.severity === "critical"
      ? "#ef4444"
      : alert.severity === "high"
      ? "#f59e0b"
      : alert.severity === "medium"
      ? "#3b82f6"
      : "#6b7280";

  const icon = L.divIcon({
    className: "enhanced-marker",
    html: `<div style="position: relative; width: 38px; height: 38px;"><div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: ${severityColor}20; border-radius: 50%; filter: blur(4px);"></div><div style="position: absolute; top: 3px; left: 3px; width: 32px; height: 32px; background: ${severityColor}15; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 1.5px solid ${severityColor}80; backdrop-filter: blur(2px);">${alert.icon}</div></div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -35],
  });

  return (
    <Marker position={[alert.coords[1], alert.coords[0]]} icon={icon}>
      <Popup>
        <div
          style={{
            background: isDarkMode ? "#1a1a24" : "#ffffff",
            color: isDarkMode ? "white" : "#000",
            padding: "12px",
            borderRadius: "12px",
            minWidth: "220px",
            border: `1px solid ${severityColor}30`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "20px" }}>{alert.icon}</span>
            <span
              style={{
                background: `${severityColor}20`,
                color: severityColor,
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "10px",
                fontWeight: 500,
              }}
            >
              {alert.severity.toUpperCase()}
            </span>
          </div>
          <h3
            style={{
              margin: "0 0 4px 0",
              fontSize: "14px",
              fontWeight: 600,
              color: isDarkMode ? "#fff" : "#000",
            }}
          >
            {alert.title}
          </h3>
          <p
            style={{
              margin: "0 0 4px 0",
              color: isDarkMode ? "#aaa" : "#666",
              fontSize: "11px",
            }}
          >
            {alert.location}
          </p>
          <p
            style={{
              margin: "0 0 8px 0",
              color: isDarkMode ? "#888" : "#999",
              fontSize: "10px",
            }}
          >
            {alert.description}
          </p>
          {alert.source && (
            <p
              style={{
                margin: "0 0 4px 0",
                color: isDarkMode ? "#666" : "#888",
                fontSize: "9px",
                fontStyle: "italic",
              }}
            >
              Source: {alert.source}
            </p>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "8px",
              color: isDarkMode ? "#666" : "#999",
              fontSize: "9px",
            }}
          >
            <span>{alert.time}</span>
            <span>
              {alert.coords[0].toFixed(1)}°, {alert.coords[1].toFixed(1)}°
            </span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

/* ===== ENHANCED STAT CARD ===== */
const EnhancedStatCard: React.FC<{
  label: string;
  value: string;
  icon: string;
  color?: string;
  trend?: number;
  isDarkMode: boolean;
}> = ({ label, value, icon, color = "#3b82f6", trend, isDarkMode }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isDarkMode ? "#15151f" : "#ffffff",
        borderRadius: "16px",
        padding: "18px",
        border: `1px solid ${
          isHovered ? color + "60" : isDarkMode ? "#2a2a35" : "#e5e7eb"
        }`,
        transition: "all 0.2s ease",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p
            style={{
              color: isDarkMode ? "#888" : "#6b7280",
              fontSize: "11px",
              marginBottom: "6px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: "32px",
              fontWeight: 600,
              color: isDarkMode ? "#fff" : "#111827",
              lineHeight: 1,
            }}
          >
            {value}
          </p>
          {trend !== undefined && (
            <p
              style={{
                color: trend > 0 ? "#4ade80" : "#ef4444",
                fontSize: "11px",
                marginTop: "6px",
              }}
            >
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            color: color,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

/* ===== ENHANCED ALERT CARD ===== */
const EnhancedAlertCard: React.FC<{ alert: Alert; isDarkMode: boolean }> = ({
  alert,
  isDarkMode,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const severityColor =
    alert.severity === "critical"
      ? "#ef4444"
      : alert.severity === "high"
      ? "#f59e0b"
      : alert.severity === "medium"
      ? "#3b82f6"
      : "#6b7280";

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isDarkMode ? "#15151f" : "#ffffff",
        borderRadius: "12px",
        padding: "12px",
        marginBottom: "10px",
        border: `1px solid ${
          isHovered ? severityColor + "40" : isDarkMode ? "#2a2a35" : "#e5e7eb"
        }`,
        borderLeft: `3px solid ${severityColor}`,
        transition: "all 0.2s ease",
        transform: isHovered ? "translateX(4px)" : "translateX(0)",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: severityColor + "20",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            border: `1px solid ${severityColor}40`,
          }}
        >
          {alert.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "4px",
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: 600,
                color: severityColor,
              }}
            >
              {alert.title}
            </h4>
            <span
              style={{
                color: isDarkMode ? "#666" : "#999",
                fontSize: "10px",
                background: isDarkMode ? "#1e1e2a" : "#f3f4f6",
                padding: "2px 6px",
                borderRadius: "8px",
              }}
            >
              {alert.time}
            </span>
          </div>
          <p
            style={{
              margin: 0,
              color: isDarkMode ? "#aaa" : "#6b7280",
              fontSize: "11px",
            }}
          >
            {alert.location}
          </p>
          <p
            style={{
              margin: "4px 0 0 0",
              color: isDarkMode ? "#888" : "#9ca3af",
              fontSize: "10px",
            }}
          >
            {alert.description.substring(0, 60)}...
          </p>
        </div>
      </div>
    </div>
  );
};

/* ===== SEVERITY CHART ===== */
const SeverityChart: React.FC<{ alerts: Alert[]; isDarkMode: boolean }> = ({
  alerts,
  isDarkMode,
}) => {
  const critical = alerts.filter((a) => a.severity === "critical").length;
  const high = alerts.filter((a) => a.severity === "high").length;
  const medium = alerts.filter((a) => a.severity === "medium").length;
  const low = alerts.filter((a) => a.severity === "low").length;
  const total = alerts.length;
  const data = [
    { label: "Critical", value: critical, color: "#ef4444" },
    { label: "High", value: high, color: "#f59e0b" },
    { label: "Medium", value: medium, color: "#3b82f6" },
    { label: "Low", value: low, color: "#6b7280" },
  ].filter((item) => item.value > 0);

  return (
    <div
      style={{
        background: isDarkMode ? "#15151f" : "#ffffff",
        borderRadius: "16px",
        padding: "16px",
        marginTop: "12px",
        border: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
      }}
    >
      <h3
        style={{
          margin: "0 0 16px 0",
          fontSize: "13px",
          color: isDarkMode ? "#aaa" : "#6b7280",
          fontWeight: 500,
        }}
      >
        SEVERITY
      </h3>
      <div
        style={{
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        {data.map((item) => (
          <div key={item.label} style={{ textAlign: "center" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: `conic-gradient(${item.color} ${
                  (item.value / total) * 360
                }deg, ${isDarkMode ? "#2a2a3a" : "#e5e7eb"} 0deg)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: isDarkMode ? "#15151f" : "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: item.color,
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {item.value}
              </div>
            </div>
            <div
              style={{
                fontSize: "10px",
                color: isDarkMode ? "#888" : "#9ca3af",
                marginTop: "6px",
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>
      {data.map((item) => (
        <div key={item.label} style={{ marginBottom: "8px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "4px",
            }}
          >
            <span
              style={{
                color: isDarkMode ? "#aaa" : "#6b7280",
                fontSize: "10px",
              }}
            >
              {item.label}
            </span>
            <span
              style={{ color: item.color, fontSize: "10px", fontWeight: 500 }}
            >
              {item.value}
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "4px",
              background: isDarkMode ? "#2a2a35" : "#e5e7eb",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(item.value / total) * 100}%`,
                height: "100%",
                background: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

/* ===== ALERT FREQUENCY ===== */
const AlertFrequencyChart: React.FC<{
  alerts: Alert[];
  isDarkMode: boolean;
}> = ({ alerts, isDarkMode }) => {
  const frequencyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(() =>
      Math.min(25, alerts.length * 2 + Math.floor(Math.random() * 8))
    );
  }, [alerts]);

  const peakHour = frequencyData.indexOf(Math.max(...frequencyData));
  const peakValue = Math.max(...frequencyData);
  const avgValue = Math.round(
    frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length
  );
  const totalAlerts = frequencyData.reduce((a, b) => a + b, 0);
  const maxValue = Math.max(...frequencyData);
  const points = frequencyData
    .map(
      (value, i) =>
        `${(i / (frequencyData.length - 1)) * 100},${
          100 - (value / maxValue) * 100 * 0.9
        }`
    )
    .join(" ");

  return (
    <div
      style={{
        background: isDarkMode ? "#15151f" : "#ffffff",
        borderRadius: "16px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
      }}
    >
      <h3
        style={{
          margin: "0 0 12px 0",
          fontSize: "13px",
          color: isDarkMode ? "#aaa" : "#6b7280",
          fontWeight: 500,
        }}
      >
        ALERT FREQUENCY (24H)
      </h3>
      <div style={{ height: "110px", marginBottom: "12px" }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%" }}
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="100"
            stroke={isDarkMode ? "#2a2a35" : "#e5e7eb"}
            strokeWidth="0.5"
          />
          <line
            x1="0"
            y1="100"
            x2="100"
            y2="100"
            stroke={isDarkMode ? "#2a2a35" : "#e5e7eb"}
            strokeWidth="0.5"
          />
          <line
            x1="100"
            y1="0"
            x2="100"
            y2="100"
            stroke={isDarkMode ? "#2a2a35" : "#e5e7eb"}
            strokeWidth="0.5"
          />
          <line
            x1="0"
            y1="0"
            x2="100"
            y2="0"
            stroke={isDarkMode ? "#2a2a35" : "#e5e7eb"}
            strokeWidth="0.5"
          />
          {[0, 25, 50, 75].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke={isDarkMode ? "#2a2a35" : "#e5e7eb"}
              strokeWidth="0.3"
              strokeDasharray="3,2"
            />
          ))}
          <polygon
            points={`0,100 ${points} 100,100`}
            fill="#3b82f6"
            opacity="0.1"
          />
          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          {frequencyData.map((value, i) => (
            <circle
              key={i}
              cx={(i / (frequencyData.length - 1)) * 100}
              cy={100 - (value / maxValue) * 100 * 0.9}
              r="1.2"
              fill="#3b82f6"
            />
          ))}
        </svg>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: isDarkMode ? "#666" : "#9ca3af",
          fontSize: "8px",
          marginBottom: "12px",
        }}
      >
        {[0, 3, 6, 9, 12, 15, 18, 21, 23].map((h) => (
          <span key={h}>{h.toString().padStart(2, "0")}:00</span>
        ))}
      </div>
      <div
        style={{
          borderTop: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
          paddingTop: "12px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#3b82f6", fontSize: "12px" }}>●</span>
            <span
              style={{
                color: isDarkMode ? "#888" : "#6b7280",
                fontSize: "11px",
              }}
            >
              Peak: {peakHour}:00 ({peakValue})
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#3b82f6", fontSize: "12px" }}>●</span>
            <span
              style={{
                color: isDarkMode ? "#888" : "#6b7280",
                fontSize: "11px",
              }}
            >
              Avg: {avgValue}/hr
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#3b82f6", fontSize: "12px" }}>●</span>
            <span
              style={{
                color: isDarkMode ? "#888" : "#6b7280",
                fontSize: "11px",
              }}
            >
              Total: {totalAlerts}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#3b82f6", fontSize: "12px" }}>●</span>
            <span
              style={{
                color: isDarkMode ? "#888" : "#6b7280",
                fontSize: "11px",
              }}
            >
              Trend: {peakValue > 20 ? "↑ Critical" : "→ Stable"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== REGION STATS ===== */
const RegionStats: React.FC<{ alerts: Alert[]; isDarkMode: boolean }> = ({
  alerts,
  isDarkMode,
}) => {
  const regionData = useMemo(() => {
    const regions = [
      { name: "North America", alerts: 0 },
      { name: "South America", alerts: 0 },
      { name: "Europe", alerts: 0 },
      { name: "Africa", alerts: 0 },
      { name: "Asia", alerts: 0 },
      { name: "Australia", alerts: 0 },
    ];
    alerts.forEach((alert) => {
      const loc = alert.location.toLowerCase();
      if (
        loc.includes("america") ||
        loc.includes("brazil") ||
        loc.includes("amazon")
      )
        regions[1].alerts++;
      else if (
        loc.includes("asia") ||
        loc.includes("thailand") ||
        loc.includes("bangladesh")
      )
        regions[4].alerts++;
      else if (loc.includes("africa") || loc.includes("congo"))
        regions[3].alerts++;
      else if (loc.includes("europe") || loc.includes("ukraine"))
        regions[2].alerts++;
      else if (loc.includes("australia")) regions[5].alerts++;
      else regions[0].alerts++;
    });
    return regions;
  }, [alerts]);
  const maxAlerts = Math.max(...regionData.map((r) => r.alerts), 1);

  return (
    <div
      style={{
        background: isDarkMode ? "#15151f" : "#ffffff",
        borderRadius: "16px",
        padding: "16px",
        height: "100%",
        border: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
      }}
    >
      <h3
        style={{
          margin: "0 0 16px 0",
          fontSize: "13px",
          color: isDarkMode ? "#aaa" : "#6b7280",
          fontWeight: 500,
        }}
      >
        ALERTS BY REGION
      </h3>
      {regionData.map((region) => (
        <div key={region.name} style={{ marginBottom: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "4px",
            }}
          >
            <span
              style={{
                color: isDarkMode ? "#aaa" : "#6b7280",
                fontSize: "11px",
              }}
            >
              {region.name}
            </span>
            <span
              style={{ color: "#3b82f6", fontSize: "11px", fontWeight: 600 }}
            >
              {region.alerts}
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "6px",
              background: isDarkMode ? "#2a2a35" : "#e5e7eb",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(region.alerts / maxAlerts) * 100}%`,
                height: "100%",
                background: "#3b82f6",
                borderRadius: "3px",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

/* ===== AI PREDICTIONS ===== */
const AIPredictions: React.FC<{ alerts: Alert[]; isDarkMode: boolean }> = ({
  alerts,
  isDarkMode,
}) => {
  const predictions = useMemo(() => {
    const fireCount = alerts.filter((a) => a.type === "fire").length;
    const floodCount = alerts.filter((a) => a.type === "flood").length;
    const forestCount = alerts.filter((a) => a.type === "deforestation").length;
    return [
      {
        text: "Fire spread probability",
        value: Math.min(98, 60 + fireCount * 15),
        color: "#ef4444",
        progress: Math.min(98, 60 + fireCount * 15),
      },
      {
        text: "Flood risk",
        value: Math.min(95, 50 + floodCount * 20),
        color: "#3b82f6",
        progress: Math.min(95, 50 + floodCount * 20),
      },
      {
        text: "Deforestation detection",
        value: Math.min(96, 65 + forestCount * 12),
        color: "#10b981",
        progress: Math.min(96, 65 + forestCount * 12),
      },
    ];
  }, [alerts]);

  return (
    <div
      style={{
        background: isDarkMode ? "#15151f" : "#ffffff",
        borderRadius: "16px",
        padding: "16px",
        height: "100%",
        border: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
      }}
    >
      <h3
        style={{
          margin: "0 0 16px 0",
          fontSize: "13px",
          color: isDarkMode ? "#aaa" : "#6b7280",
          fontWeight: 500,
        }}
      >
        ⚡ AI PREDICTIONS
      </h3>
      {predictions.map((pred, i) => (
        <div key={i} style={{ marginBottom: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                color: isDarkMode ? "#aaa" : "#6b7280",
                fontSize: "11px",
              }}
            >
              {pred.text}
            </span>
            <span
              style={{ color: pred.color, fontSize: "12px", fontWeight: 600 }}
            >
              {pred.value}%
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "6px",
              background: isDarkMode ? "#2a2a35" : "#e5e7eb",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pred.progress}%`,
                height: "100%",
                background: pred.color,
                borderRadius: "3px",
              }}
            />
          </div>
          <p
            style={{
              color: isDarkMode ? "#666" : "#9ca3af",
              fontSize: "9px",
              marginTop: "4px",
            }}
          >
            {pred.progress > 80
              ? "⚠️ High confidence"
              : pred.progress > 60
              ? "📊 Medium confidence"
              : "🔍 Monitoring"}
          </p>
        </div>
      ))}
    </div>
  );
};

/* ===== RESOURCES PANEL ===== */
const ResourcesPanel: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const resources = [
    { name: "Firefighting Aircraft", count: 8, icon: "🚁", color: "#ef4444" },
    { name: "Rescue Helicopters", count: 12, icon: "🚁", color: "#f59e0b" },
    { name: "Ground Teams", count: 24, icon: "👥", color: "#3b82f6" },
    { name: "Drones", count: 36, icon: "🛸", color: "#a855f7" },
    { name: "Satellites", count: 15, icon: "🛰️", color: "#10b981" },
    { name: "Ships", count: 6, icon: "🚢", color: "#60a5fa" },
  ];
  const total = resources.reduce((acc, r) => acc + r.count, 0);

  return (
    <div
      style={{
        background: isDarkMode ? "#15151f" : "#ffffff",
        borderRadius: "16px",
        padding: "16px",
        height: "100%",
        border: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
      }}
    >
      <h3
        style={{
          margin: "0 0 16px 0",
          fontSize: "13px",
          color: isDarkMode ? "#aaa" : "#6b7280",
          fontWeight: 500,
        }}
      >
        🚁 DEPLOYED RESOURCES
      </h3>
      {resources.map((resource) => (
        <div
          key={resource.name}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 0",
            borderBottom: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px", color: resource.color }}>
              {resource.icon}
            </span>
            <span
              style={{
                fontSize: "12px",
                color: isDarkMode ? "#aaa" : "#6b7280",
              }}
            >
              {resource.name}
            </span>
          </div>
          <span
            style={{ fontSize: "14px", fontWeight: 600, color: resource.color }}
          >
            {resource.count}
          </span>
        </div>
      ))}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "16px",
          padding: "12px 0 0 0",
          borderTop: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
        }}
      >
        <span
          style={{
            color: isDarkMode ? "#fff" : "#111827",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          TOTAL ASSETS
        </span>
        <span style={{ color: "#3b82f6", fontSize: "20px", fontWeight: 700 }}>
          {total}
        </span>
      </div>
    </div>
  );
};

/* ===== WEATHER PANEL ===== */
const WeatherPanel: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const locations = [
    { name: "Amazon", temp: "32°C", condition: "🌧️ Rain", humidity: "85%" },
    { name: "Bangkok", temp: "29°C", condition: "☀️ Sunny", humidity: "60%" },
    { name: "Congo", temp: "26°C", condition: "🌧️ Rain", humidity: "90%" },
    {
      name: "Bangladesh",
      temp: "28°C",
      condition: "⛈️ Storm",
      humidity: "95%",
    },
    { name: "Ukraine", temp: "18°C", condition: "☁️ Cloudy", humidity: "55%" },
  ];

  return (
    <div
      style={{
        background: isDarkMode ? "#15151f" : "#ffffff",
        borderRadius: "16px",
        padding: "16px",
        height: "100%",
        border: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
      }}
    >
      <h3
        style={{
          margin: "0 0 16px 0",
          fontSize: "13px",
          color: isDarkMode ? "#aaa" : "#6b7280",
          fontWeight: 500,
        }}
      >
        🌤️ WEATHER
      </h3>
      {locations.map((loc) => (
        <div
          key={loc.name}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto auto",
            gap: "8px",
            padding: "8px 0",
            borderBottom: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
            alignItems: "center",
          }}
        >
          <span
            style={{ color: isDarkMode ? "#aaa" : "#6b7280", fontSize: "12px" }}
          >
            {loc.name}
          </span>
          <span style={{ color: "#3b82f6", fontSize: "13px", fontWeight: 600 }}>
            {loc.temp}
          </span>
          <span
            style={{ color: isDarkMode ? "#888" : "#9ca3af", fontSize: "11px" }}
          >
            {loc.condition}
          </span>
          <span
            style={{ color: isDarkMode ? "#666" : "#9ca3af", fontSize: "10px" }}
          >
            {loc.humidity}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ===== SYSTEM HEALTH ===== */
const SystemHealth: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const systems = [
    {
      name: "Satellite Link",
      status: "online",
      latency: "24ms",
      color: "#4ade80",
    },
    { name: "AI Core", status: "online", latency: "12ms", color: "#4ade80" },
    { name: "Database", status: "online", latency: "8ms", color: "#4ade80" },
    {
      name: "API Gateway",
      status: "online",
      latency: "16ms",
      color: "#4ade80",
    },
    {
      name: "Alert System",
      status: "online",
      latency: "32ms",
      color: "#4ade80",
    },
  ];

  return (
    <div
      style={{
        background: isDarkMode ? "#15151f" : "#ffffff",
        borderRadius: "16px",
        padding: "16px",
        height: "100%",
        border: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
      }}
    >
      <h3
        style={{
          margin: "0 0 16px 0",
          fontSize: "13px",
          color: isDarkMode ? "#aaa" : "#6b7280",
          fontWeight: 500,
        }}
      >
        🛡️ SYSTEM HEALTH
      </h3>
      {systems.map((sys) => (
        <div
          key={sys.name}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 0",
            borderBottom: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: sys.color,
              }}
            />
            <span
              style={{
                color: isDarkMode ? "#aaa" : "#6b7280",
                fontSize: "12px",
              }}
            >
              {sys.name}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                color: sys.color,
                fontSize: "10px",
                textTransform: "uppercase",
              }}
            >
              {sys.status}
            </span>
            <span
              style={{
                color: isDarkMode ? "#666" : "#9ca3af",
                fontSize: "10px",
              }}
            >
              {sys.latency}
            </span>
          </div>
        </div>
      ))}
      <div
        style={{
          marginTop: "12px",
          padding: "12px 0 0 0",
          borderTop: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
          }}
        >
          <span
            style={{ color: isDarkMode ? "#aaa" : "#6b7280", fontSize: "11px" }}
          >
            Uptime
          </span>
          <span style={{ color: "#4ade80", fontSize: "12px", fontWeight: 600 }}>
            99.9%
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: "4px",
            background: isDarkMode ? "#2a2a35" : "#e5e7eb",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "99.9%",
              height: "100%",
              background: "linear-gradient(90deg, #4ade80, #3b82f6)",
              borderRadius: "2px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

/* ===== MAP LEGEND ===== */
const MapLegend: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const items = [
    { label: "Critical", color: "#ef4444" },
    { label: "High", color: "#f59e0b" },
    { label: "Medium", color: "#3b82f6" },
    { label: "Low", color: "#6b7280" },
  ];
  return (
    <div
      style={{
        position: "absolute",
        bottom: "16px",
        left: "16px",
        zIndex: 1000,
        background: isDarkMode
          ? "rgba(21, 21, 31, 0.9)"
          : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(8px)",
        borderRadius: "24px",
        padding: "8px 16px",
        border: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
        display: "flex",
        gap: "16px",
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: item.color,
            }}
          />
          <span
            style={{ color: isDarkMode ? "#888" : "#6b7280", fontSize: "10px" }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ===== MAP CONTROLS ===== */
const MapControls: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "16px",
        right: "16px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      {["+", "−"].map((btn, i) => (
        <button
          key={i}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: isDarkMode
              ? "rgba(21, 21, 31, 0.9)"
              : "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(8px)",
            border: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
            color: isDarkMode ? "#aaa" : "#6b7280",
            fontSize: "20px",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#3b82f6";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDarkMode
              ? "rgba(21, 21, 31, 0.9)"
              : "rgba(255, 255, 255, 0.9)";
            e.currentTarget.style.color = isDarkMode ? "#aaa" : "#6b7280";
          }}
        >
          {btn}
        </button>
      ))}
    </div>
  );
};

/* ===== LIVE ALERTS PANEL ===== */
const LiveAlertsPanel = ({ filter, setFilter, alerts, isDarkMode }: any) => {
  const filteredAlerts =
    filter === "all" ? alerts : alerts.filter((a: Alert) => a.type === filter);
  return (
    <div
      style={{
        background: isDarkMode ? "#15151f" : "#ffffff",
        borderRadius: "20px",
        padding: "16px",
        border: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
        height: "500px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 600,
            color: isDarkMode ? "#fff" : "#111827",
          }}
        >
          LIVE ALERTS{" "}
          <span
            style={{ color: "#3b82f6", fontSize: "14px", marginLeft: "8px" }}
          >
            {alerts.length}
          </span>
        </h2>
        <div style={{ display: "flex", gap: "6px" }}>
          {["all", "fire", "flood", "rescue", "camouflage"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "4px 12px",
                borderRadius: "20px",
                background:
                  filter === f ? "#3b82f6" : isDarkMode ? "#1e1e2a" : "#f3f4f6",
                border: "none",
                color: filter === f ? "#fff" : isDarkMode ? "#888" : "#6b7280",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              {f === "all" ? "ALL" : f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
        {filteredAlerts.map((alert: Alert) => (
          <EnhancedAlertCard
            key={alert.id}
            alert={alert}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
      <SeverityChart alerts={alerts} isDarkMode={isDarkMode} />
    </div>
  );
};

/* ===== EMERGENCY PROTOCOL BUTTON ===== */
const EmergencyButton = ({
  alerts,
  isDarkMode,
}: {
  alerts: Alert[];
  isDarkMode: boolean;
}) => {
  const [isActivated, setIsActivated] = useState(false);
  const handleEmergency = () => {
    const criticalAlerts = alerts.filter((a) => a.severity === "critical");
    const highAlerts = alerts.filter((a) => a.severity === "high");
    setIsActivated(true);
    alert(
      `🚨 EMERGENCY PROTOCOL ACTIVATED 🚨\n\n⚠️ CRITICAL ALERTS: ${
        criticalAlerts.length
      }\n⚠️ HIGH ALERTS: ${highAlerts.length}\n📍 Locations: ${alerts
        .map((a) => a.location)
        .join(
          ", "
        )}\n\n🚁 RESOURCES DEPLOYED\n📡 ALL UNITS NOTIFIED\n🆘 RESPONSE TEAMS DISPATCHED\n\nSTAY CALM - FOLLOW EMERGENCY PROCEDURES`
    );
    setTimeout(() => setIsActivated(false), 3000);
  };
  return (
    <button
      onClick={handleEmergency}
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        background: isActivated
          ? "linear-gradient(135deg, #dc2626, #ef4444)"
          : "linear-gradient(135deg, #ef4444, #b91c1c)",
        color: "white",
        fontSize: "28px",
        border: "none",
        cursor: "pointer",
        boxShadow: isActivated ? "0 0 40px #ef4444" : "0 0 20px #ef4444",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: isActivated
          ? "pulse 0.5s ease-in-out 3"
          : "pulse 2s infinite",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
      title="Emergency Protocol"
    >
      🚨
    </button>
  );
};

/* ===== MAIN DASHBOARD ===== */
const Dashboard = ({ onLogout }: any) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [filter, setFilter] = useState<string>("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const prevAlertsRef = useRef<Alert[]>([]);
  const { playCriticalSound, playHighSound } = useAlertSound();

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const realAlerts = await fetchAllRealTimeAlerts();
      setAlerts(realAlerts);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const previousAlerts = prevAlertsRef.current;
    alerts.forEach((alert) => {
      const previousAlert = previousAlerts.find((a) => a.id === alert.id);
      if (
        alert.severity === "critical" &&
        (!previousAlert || previousAlert.severity !== "critical")
      ) {
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: `${alert.title} detected at ${alert.location}`,
            type: alert.severity,
            title: alert.title,
          },
        ]);
        playCriticalSound();
      } else if (
        alert.severity === "high" &&
        (!previousAlert || previousAlert.severity !== "high")
      ) {
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: `${alert.title} detected at ${alert.location}`,
            type: alert.severity,
            title: alert.title,
          },
        ]);
        playHighSound();
      }
    });
    prevAlertsRef.current = alerts;
  }, [alerts, playCriticalSound, playHighSound]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        setIsDarkMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    const timer = setInterval(
      () => setTime(new Date().toLocaleTimeString()),
      1000
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } }
      @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; visibility: hidden; } }
      @keyframes shrinkWidth { from { width: 100%; } to { width: 0%; } }
      .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
      .leaflet-popup-tip { background: ${
        isDarkMode ? "#1a1a24" : "#ffffff"
      } !important; }
      .leaflet-container { background: ${
        isDarkMode ? "#0a0a0f" : "#f5f5f5"
      } !important; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: ${
        isDarkMode ? "#2a2a35" : "#e5e7eb"
      }; }
      ::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 4px; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [isDarkMode]);

  const stats = {
    total: alerts.length,
    disasters: alerts.filter((a) =>
      ["fire", "flood", "deforestation"].includes(a.type)
    ).length,
    rescue: alerts.filter((a) => a.type === "rescue").length,
    defense: alerts.filter((a) => a.type === "camouflage").length,
  };

  const removeNotification = (id: number) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const footerSections = [
    {
      title: "Live Alerts",
      links: [
        "Critical Alerts",
        "Active Zones",
        "Response Teams",
        "Latest Updates",
      ],
    },
    { title: "Severity", links: ["Critical", "High", "Medium", "Low"] },
    {
      title: "Alert Frequency",
      links: ["24h History", "Peak Hours", "Average Rate", "Total Count"],
    },
    {
      title: "Regions",
      links: [
        "North America",
        "South America",
        "Europe",
        "Asia",
        "Africa",
        "Australia",
      ],
    },
    {
      title: "Resources",
      links: [
        "Aircraft",
        "Helicopters",
        "Ground Teams",
        "Drones",
        "Satellites",
        "Ships",
      ],
    },
    {
      title: "Weather",
      links: ["Amazon", "Bangkok", "Congo", "Bangladesh", "Ukraine"],
    },
    { title: "AI", links: ["Fire Spread", "Flood Risk", "Deforestation"] },
    {
      title: "System",
      links: ["Satellite", "AI Core", "Database", "API", "Alerts"],
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isDarkMode ? "#0a0a0f" : "#f5f5f5",
        position: "relative",
      }}
    >
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
          isDarkMode={isDarkMode}
        />
      ))}
      <EmergencyButton alerts={alerts} isDarkMode={isDarkMode} />
      <ThemeToggleButton isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `linear-gradient(rgba(59,130,246,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.02) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1600px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 20px",
            background: isDarkMode ? "#15151f" : "#ffffff",
            borderRadius: "40px",
            border: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              🛰️
            </div>
            <div>
              <h1
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  margin: 0,
                  color: isDarkMode ? "#fff" : "#111827",
                }}
              >
                EarthGuardian AI
              </h1>
              <p
                style={{
                  margin: 0,
                  color: isDarkMode ? "#666" : "#6b7280",
                  fontSize: "11px",
                }}
              >
                Global Disaster & Defense Monitoring
              </p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: isDarkMode ? "#1e2a1e" : "#e8f5e9",
                borderRadius: "20px",
                padding: "4px 12px",
                marginLeft: "12px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#4ade80",
                  animation: "pulse 2s infinite",
                }}
              />
              <span style={{ color: "#4ade80", fontSize: "11px" }}>LIVE</span>
            </div>
            {isLoading && (
              <div
                style={{
                  marginLeft: "12px",
                  fontSize: "11px",
                  color: "#88aaff",
                }}
              >
                Syncing data...
              </div>
            )}
            {!isLoading && alerts.length > 0 && (
              <div
                style={{
                  marginLeft: "12px",
                  fontSize: "11px",
                  color: "#4ade80",
                }}
              >
                {alerts.length} active alerts
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  color: isDarkMode ? "#666" : "#6b7280",
                  fontSize: "10px",
                }}
              >
                System Time
              </div>
              <div
                style={{
                  color: "#3b82f6",
                  fontSize: "14px",
                  fontFamily: "monospace",
                }}
              >
                {time}
              </div>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #1e3a8a, #1e4b8a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                color: "#fff",
              }}
            >
              AI
            </div>
            <button
              onClick={onLogout}
              style={{
                padding: "6px 16px",
                background: "transparent",
                border: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
                borderRadius: "24px",
                color: "#ef4444",
                fontSize: "12px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = isDarkMode
                  ? "#2a1a1a"
                  : "#fee2e2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              🚪 LOGOUT
            </button>
          </div>
        </nav>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <EnhancedStatCard
            label="TOTAL ALERTS"
            value={stats.total.toString()}
            icon="⚠️"
            color="#3b82f6"
            isDarkMode={isDarkMode}
          />
          <EnhancedStatCard
            label="DISASTER"
            value={stats.disasters.toString()}
            icon="🌪️"
            color="#ef4444"
            isDarkMode={isDarkMode}
          />
          <EnhancedStatCard
            label="RESCUE"
            value={stats.rescue.toString()}
            icon="🆘"
            color="#f59e0b"
            isDarkMode={isDarkMode}
          />
          <EnhancedStatCard
            label="DEFENSE"
            value={stats.defense.toString()}
            icon="🎯"
            color="#a855f7"
            isDarkMode={isDarkMode}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              position: "relative",
              height: "500px",
              borderRadius: "20px",
              overflow: "hidden",
              border: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
            }}
          >
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap"
              />
              {alerts.map((alert) => (
                <EnhancedMarker
                  key={alert.id}
                  alert={alert}
                  isDarkMode={isDarkMode}
                />
              ))}
            </MapContainer>
            <MapLegend isDarkMode={isDarkMode} />
            <MapControls isDarkMode={isDarkMode} />
          </div>
          <LiveAlertsPanel
            filter={filter}
            setFilter={setFilter}
            alerts={alerts}
            isDarkMode={isDarkMode}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <AlertFrequencyChart alerts={alerts} isDarkMode={isDarkMode} />
          <RegionStats alerts={alerts} isDarkMode={isDarkMode} />
          <ResourcesPanel isDarkMode={isDarkMode} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <WeatherPanel isDarkMode={isDarkMode} />
          <AIPredictions alerts={alerts} isDarkMode={isDarkMode} />
          <SystemHealth isDarkMode={isDarkMode} />
        </div>

        <footer
          style={{
            marginTop: "60px",
            padding: "40px 20px 30px",
            borderTop: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
            background: isDarkMode ? "#0f0f15" : "#fafafa",
            borderRadius: "30px 30px 0 0",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "24px",
              maxWidth: "1400px",
              margin: "0 auto",
            }}
          >
            {footerSections.map((section, idx) => (
              <div key={idx}>
                <h4
                  style={{
                    color: "#3b82f6",
                    fontSize: "11px",
                    fontWeight: 500,
                    margin: "0 0 12px 0",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  {section.title}
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx} style={{ marginBottom: "6px" }}>
                      <a
                        href="#"
                        style={{
                          color: isDarkMode ? "#666" : "#6b7280",
                          fontSize: "10px",
                          textDecoration: "none",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#3b82f6")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = isDarkMode
                            ? "#666"
                            : "#6b7280")
                        }
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: "40px",
              paddingTop: "20px",
              borderTop: `1px solid ${isDarkMode ? "#2a2a35" : "#e5e7eb"}`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <span style={{ fontSize: "20px", color: "#3b82f6" }}>🛰️</span>
              <span
                style={{ color: "#3b82f6", fontSize: "13px", fontWeight: 500 }}
              >
                EarthGuardian AI
              </span>
            </div>
            <p
              style={{
                color: isDarkMode ? "#555" : "#9ca3af",
                fontSize: "10px",
                margin: 0,
              }}
            >
              Copyright © 2026 EarthGuardian AI. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
