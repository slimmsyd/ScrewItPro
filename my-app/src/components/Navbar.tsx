"use client";

import Link from "next/link";
import { useState } from "react";
import NavDropdown from "./NavDropdown";

// Chevron Down Icon Component
const ChevronDown = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export default function Navbar() {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const handleMouseEnter = (item: string) => {
        if (item === "Services" || item === "Resources") {
            setActiveMenu(item);
        } else {
            setActiveMenu(null);
        }
    };

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-transparent backdrop-blur-sm transition-all duration-300"
            onMouseLeave={() => setActiveMenu(null)}
        >
            {/* Logo */}
            <div className="flex items-center relative z-50">
                <Link href="/" className="text-2xl font-bold tracking-tight text-foreground">
                    Screw It Pro
                </Link>
            </div>

            {/* Center Links (Desktop) */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/80 h-full">
                {["Services", "Locations", "Support", "Pricing"].map((item) => {
                    const hasDropdown = item === "Services" || item === "Resources";
                    const isActive = activeMenu === item;

                    return (
                        <div
                            key={item}
                            className="h-full flex items-center cursor-pointer group"
                            onMouseEnter={() => handleMouseEnter(item)}
                        >
                            <Link href="#" className="hover:text-foreground transition-colors py-4 flex items-center gap-1">
                                {item}
                                {hasDropdown && (
                                    <ChevronDown
                                        className={`transition-transform duration-200 ${isActive ? "rotate-180" : ""}`}
                                    />
                                )}
                            </Link>
                        </div>
                    );
                })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6 relative z-50">
                {/* <Link href="#" className="text-sm font-medium text-foreground hover:opacity-70 transition-opacity">
                    Log in
                </Link> */}
                <Link
                    href="#"
                    className="px-6 py-3 text-sm font-medium text-white bg-black rounded-full hover:bg-black/80 transition-colors"
                >
                    Join Waitlist
                </Link>
            </div>

            {/* Mega Menu Dropdown */}
            <div
                className={`absolute top-full left-0 w-full transition-opacity duration-200 ${activeMenu ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                    }`}
            >
                <NavDropdown activeMenu={activeMenu} />
            </div>
        </nav>
    );
}
