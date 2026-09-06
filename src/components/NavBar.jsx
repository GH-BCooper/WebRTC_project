import React from "react";
import { NavLink } from "react-router-dom";
import useTheme from "../hooks/useTheme";

// Navigation Links
const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/meet", label: "Meet" },
  { to: "/assistant", label: "AI Assistant" },
  { to: "/about", label: "About" },
];

// Top Navigation Bar
function NavBar() {
  const { theme, toggle } = useTheme();

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand">WebRTC + AI</span>

        <div className="navbar-links">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? "navbar-link active" : "navbar-link"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Global theme toggle (fixed, bottom-right) */}
      <button className="theme-toggle" onClick={toggle} type="button">
        <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
        <span className="theme-toggle-text">
          {theme === "dark" ? "Light" : "Dark"}
        </span>
      </button>
    </>
  );
}

// Export Component
export default NavBar;
