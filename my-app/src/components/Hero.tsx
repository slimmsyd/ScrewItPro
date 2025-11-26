import React from "react";
import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative pt-40 pb-32 overflow-hidden">
            {/* Text Content */}
            <div className="container mx-auto px-6 text-center mb-24">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-8 max-w-4xl mx-auto leading-[1.1]">
                    Never assemble furniture again
                </h1>
                <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-12 leading-relaxed">
                    Shop your favorite retailers. We receive, assemble, and deliver white-glove style.
                </p>
                <div>
                    <Link
                        href="#"
                        className="inline-block px-8 py-4 text-base font-medium text-white bg-black rounded-full hover:bg-black/80 transition-all transform hover:scale-105"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mt-16 relative">
                    <div className="relative flex items-center w-full h-16 rounded-full focus-within:shadow-xl bg-white overflow-hidden border border-gray-200 shadow-md transition-shadow duration-300">
                        <div className="grid place-items-center h-full w-12 text-gray-300">
                        </div>

                        <input
                            className="peer h-full w-full outline-none text-base text-gray-700 pr-2 pl-4"
                            type="text"
                            id="search"
                            placeholder="What do you need help with?"
                        />

                        <button className="grid place-items-center h-full w-24 text-white bg-[#0F766E] hover:bg-[#0d655e] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
