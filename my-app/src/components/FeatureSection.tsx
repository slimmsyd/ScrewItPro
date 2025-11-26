"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface FeatureSectionProps {
    title: string;
    description: string;
    imageSrc?: string; // Optional for now, we can use a colored div fallback
    reversed?: boolean;
    backgroundColor?: string;
}

export default function FeatureSection({
    title,
    description,
    imageSrc,
    reversed = false,
    backgroundColor = "bg-transparent",
}: FeatureSectionProps) {
    return (
        <section className={`py-32 ${backgroundColor} overflow-hidden`}>
            <div className="container mx-auto px-6">
                <div
                    className={`flex flex-col md:flex-row items-center gap-16 md:gap-32 ${reversed ? "md:flex-row-reverse" : ""
                        }`}
                >
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: reversed ? 50 : -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex-1 text-center md:text-left"
                    >
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-foreground">
                            {title}
                        </h2>
                        <p className="text-xl text-foreground/70 leading-relaxed mb-10">
                            {description}
                        </p>
                        <button className="text-base font-bold border-b-2 border-black pb-1 hover:opacity-70 transition-opacity">
                            Learn more
                        </button>
                    </motion.div>

                    {/* Visual Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: reversed ? -50 : 50 }}
                        whileInView={{ opacity: 1, scale: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex-1 w-full"
                    >
                        <div className="relative aspect-square md:aspect-[4/3] w-full overflow-hidden rounded-[2.5rem] bg-gray-200 shadow-2xl">
                            {imageSrc ? (
                                <Image
                                    src={imageSrc}
                                    alt={title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-400">
                                    <span className="text-sm">Image Placeholder</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
