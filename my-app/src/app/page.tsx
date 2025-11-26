import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AssemblyHighlight from "@/components/AssemblyHighlight";
import FeatureSection from "@/components/FeatureSection";
import FAQ from "@/components/FAQ";
import ChatWidget from "@/components/ChatWidget";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <Hero />
      <AssemblyHighlight />

      <FeatureSection
        title="How It Works"
        description="Shop your favorite retailers and ship to our hub. We receive, unbox, assemble, and inspect every item for quality and stability."
        imageSrc=""
        backgroundColor="bg-white"
      />

      <FeatureSection
        title="White-Glove Delivery"
        description="We blanket-wrap and transport your finished furniture, place it in your room of choice, and handle all final adjustments."
        reversed={true}
      />

      <FeatureSection
        title="Expert Assembly"
        description="Our professional technicians handle everything from flat-pack assembly to complex installations, ensuring your furniture is built to last."
        backgroundColor="bg-[var(--card-olive)]/10"
      />

      <FAQ />
      <Footer />
      <ChatWidget />
    </main>
  );
}
