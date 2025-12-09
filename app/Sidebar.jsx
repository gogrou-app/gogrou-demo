"use client";
import Link from "next/link";
import "./globals.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">GOGROU<br />DEMO</h2>

      <nav className="sidebar-nav">
        <Link href="/dashboard" className="sidebar-link">Dashboard</Link>
        <Link href="/gpc" className="sidebar-link">GPC</Link>
        <Link href="/gss" className="sidebar-link">GSS</Link>
        <Link href="/ss" className="sidebar-link">SmartSplit</Link>
        <Link href="/ai" className="sidebar-link">AI Asistent</Link>
      </nav>
    </div>
  );
}
