import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marketplace from "@/components/Marketplace";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Docs from "@/components/Docs";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen ">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Marketplace />
        <HowItWorks />
        <Features />
        <Pricing />
        <Docs />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
