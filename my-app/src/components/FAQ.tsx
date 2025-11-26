"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
    {
        question: "How does the assembly process work?",
        answer: "It's simple! You shop for your furniture from your favorite retailers and have it shipped to our secure hub. We receive, inspect, and assemble your items. Once ready, we schedule a white-glove delivery to your home.",
    },
    {
        question: "Do you remove packaging debris?",
        answer: "Absolutely. Our white-glove service includes the complete removal of all boxes, styrofoam, and packing materials, so you're left with nothing but your beautiful new furniture.",
    },
    {
        question: "What areas do you serve?",
        answer: "We currently serve the greater metropolitan area. Please enter your zip code on our booking page to check if we cover your specific location.",
    },
    {
        question: "Is there a warranty on assembly?",
        answer: "Yes, we stand by our work. All assembly services come with a 30-day workmanship warranty. If you notice any issues with the assembly, simply contact us and we'll make it right.",
    },
    {
        question: "How do I book a service?",
        answer: "You can book directly through our website by clicking the 'Get Started' button. You'll be guided through selecting your services and scheduling your delivery.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-24 bg-[#F9F9F9]">
            <div className="container mx-auto px-6 max-w-4xl">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-5xl md:text-6xl font-bold text-center mb-16 tracking-tight"
                >
                    FAQ
                </motion.h2>

                <div className="space-y-4">
                    {FAQS.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-[#EFEFEF] rounded-2xl overflow-hidden"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-black/5 transition-colors"
                            >
                                <span className="text-lg md:text-xl font-semibold text-gray-900 pr-8">
                                    {faq.question}
                                </span>
                                <span className={`transform transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="px-8 pb-8 pt-2 text-gray-600 leading-relaxed text-lg">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
