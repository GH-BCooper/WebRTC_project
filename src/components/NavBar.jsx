import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import useTheme from "../hooks/useTheme";

// Navigation Links
const LINKS = [
  { to: "/sessions", label: "Sessions" },
  { to: "/meet", label: "Meet" },
  { to: "/assistant", label: "Assistant" },
  { to: "/agent", label: "Agent" },
  { to: "/vision", label: "Vision" },
  { to: "/about", label: "About" },
];

// Top Navigation Bar
function NavBar() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <NavLink to="/" className="navbar-brand" end>
          <span className="brand-dot" aria-hidden="true" /> Office<span className="brand-accent">Hours</span>
        </NavLink>

        <button
          className="navbar-burger"
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "✕" : "☰"}
        </button>

        <div className={open ? "navbar-links open" : "navbar-links"}>
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setOpen(false)}
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
