import React from "react";
import Link from "next/link";

interface NavDropdownProps {
    activeMenu: string | null;
}

const MENU_CONTENT: Record<string, {
    highlightTitle: string;
    highlightColor: string;
    links: { title: string; href: string; subtitle: string }[];
}> = {
    Services: {
        highlightTitle: "Service Highlight",
        highlightColor: "bg-[#C4D7F7]", // Blue
        links: [
            { title: "Flat-Pack Furniture Assembly", href: "#", subtitle: "Hub-based assembly service" },
            { title: "White-Glove Delivery & Placement", href: "#", subtitle: "Professional delivery to your home" },
            { title: "Optional In-Home Assembly", href: "#", subtitle: "On-site assembly for oversized items" },
            { title: "Packaging & Debris Removal", href: "#", subtitle: "Complete cleanup service" },
            { title: "Inspection, Repair & Issue Handling", href: "#", subtitle: "Quality assurance and fixes" },
        ],
    },
    Resources: {
        highlightTitle: "Community Spotlight",
        highlightColor: "bg-[#B5B085]", // Olive
        links: [
            { title: "Assembly Guides", href: "#", subtitle: "DIY tips and tricks" },
            { title: "Support Center", href: "#", subtitle: "Get help with your order" },
            { title: "Blog", href: "#", subtitle: "Home improvement tips" },
            { title: "Join our Team", href: "#", subtitle: "Become a technician" },
        ],
    },
};

export default function NavDropdown({ activeMenu }: NavDropdownProps) {
    if (!activeMenu || !MENU_CONTENT[activeMenu]) return null;

    const content = MENU_CONTENT[activeMenu];

    return (
        <div className="absolute top-full left-0 w-full flex justify-center pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="bg-[#111111] text-white p-6 rounded-3xl shadow-2xl flex max-w-5xl w-full mx-6 border border-white/10">
                {/* Left Image Section */}
                <div className={`w-1/3 ${content.highlightColor} rounded-2xl relative overflow-hidden min-h-[350px] group cursor-pointer transition-colors duration-300`}>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-black/20 p-6 text-center transition-transform duration-500 group-hover:scale-105">
                        <div className="w-24 h-24 bg-white/30 rounded-full mb-4 blur-xl"></div>
                        <span className="font-bold text-2xl text-[#111111]/40 mix-blend-multiply">{content.highlightTitle}</span>
                    </div>
                </div>

                {/* Right Links Section */}
                <div className="w-2/3 pl-12 py-4 grid grid-cols-2 gap-y-10 gap-x-8">
                    {content.links.map((link) => (
                        <div key={link.title} className="space-y-1">
                            <h3 className="font-bold text-base">{link.title}</h3>
                            <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors block">
                                {link.subtitle}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
