import Hero from "@/components/ui/Hero";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/FadeIn";

export default function Home() {
  return (
    <main>
      <Hero />

      <section className="min-h-screen w-full px-6 py-24 flex flex-col items-center text-center gap-6">
        <FadeIn>
          <h2 className="text-3xl font-medium">Built for AI Safety Teams</h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-muted-foreground max-w-xl">
            Compare LLMs side-by-side, catch prompt injection and jailbreak attempts before they ship,
            and track safety trends across every model your team uses.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <Button asChild size="lg">
            <Link href="/dashboard">Launch Dashboard</Link>
          </Button>
        </FadeIn>
      </section>
    </main>
  );
}