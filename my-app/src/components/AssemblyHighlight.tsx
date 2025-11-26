"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const TAGS = [
    "General Furniture Assembly",
    "IKEA Assembly",
    "Crib Assembly",
    "Bookshelf Assembly",
    "Desk Assembly",
];

export default function AssemblyHighlight() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
                {/* Tags Row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-wrap gap-3 mb-16 justify-center"
                >
                    {TAGS.map((tag, index) => (
                        <motion.button
                            key={tag}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:border-[#0F766E] hover:text-[#0F766E] transition-colors whitespace-nowrap shadow-sm hover:shadow-md"
                        >
                            {tag}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Main Content Area */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative rounded-[2.5rem] overflow-hidden bg-[#EBF6FF] min-h-[600px] shadow-xl"
                >
                    {/* Image Background (Right Side) */}
                    <div className="absolute top-0 right-0 w-full md:w-2/3 h-full">
                        <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400">
                            <span className="text-lg font-medium">Assembly Image Placeholder</span>
                        </div>
                    </div>

                    {/* Overlapping White Card */}
                    <div className="relative z-10 p-8 md:p-16 h-full flex flex-col justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                            className="bg-white p-10 md:p-14 rounded-3xl shadow-2xl max-w-lg pointer-events-auto"
                        >
                            <h2 className="text-4xl font-bold mb-10 text-gray-900">General Assembly</h2>
                            <ul className="space-y-8">
                                <li className="flex items-start gap-5 text-gray-600 text-lg">
                                    <svg className="w-6 h-6 mt-1 text-[#0F766E] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="leading-relaxed">
                                        Assemble or disassemble furniture items by unboxing, building, and any cleanup.
                                    </span>
                                </li>
                                <li className="flex items-start gap-5 text-gray-600 text-lg">
                                    <svg className="w-6 h-6 mt-1 text-[#0F766E] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="leading-relaxed">
                                        Now Trending: Curved sofas, computer desks, and sustainable materials.
                                    </span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
