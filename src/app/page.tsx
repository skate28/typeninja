import { Header } from "@/components/Header";
import { PromoBanner } from "@/components/PromoBanner";
import { TypingTest } from "@/components/TypingTest";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <PromoBanner />
      <Header />
      <TypingTest />
      <Footer />
    </>
  );
}
