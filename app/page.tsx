import { GradientBackground } from "@/components/ui/gradient-background";
import { ShinyButton } from "@/components/ui/shiny-button";
import { ThumbnailButton } from "@/components/ui/thumbnail-button";

const cookNextDoorGradients = [
  "linear-gradient(135deg, #076653 0%, #E3EF26 100%)",
  "linear-gradient(135deg, #0C342C 0%, #076653 100%)",
  "linear-gradient(135deg, #076653 0%, #E3EF26 100%)",
  "linear-gradient(135deg, #06231D 0%, #076653 100%)",
  "linear-gradient(135deg, #0C342C 0%, #E3EF26 100%)",
];

export default function Home() {
  return (
    <>
      {/* Hero — overflow-hidden stays contained to gradient only */}
      <GradientBackground gradients={cookNextDoorGradients} animationDuration={10}>
        <div className="space-y-6 px-4 text-center text-white max-w-2xl pb-28">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full">
            🍜 Hyperlocal · 1km radius
          </div>
          <h1 className="text-4xl font-extrabold md:text-6xl leading-tight">
            Home-cooked food,{" "}
            <em className="not-italic text-orange-400">just next door.</em>
          </h1>
          <p className="text-white/70 text-lg max-w-lg mx-auto">
            Zero commission. No delivery. Direct payment. Find authentic meals
            from neighbors right around you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <ShinyButton href="/user-auth" variant="orange">
              🍜 Find food near me
            </ShinyButton>
            <ShinyButton href="/cook-register" variant="green">
              👨‍🍳 I want to cook
            </ShinyButton>
          </div>
        </div>
      </GradientBackground>

      {/*
        All video buttons sit OUTSIDE the overflow-hidden GradientBackground.
        Fixed positioning guarantees they are always visible on every screen size
        — same pattern used for the chatbot widget.
      */}

      {/* Guide videos — fixed bottom-center row */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-3 items-center">
        <ThumbnailButton
          youtubeId="Xpl1-o4ZUxI"
          title="Eater guide"
        />
        <ThumbnailButton
          youtubeId="QD4JWVQBfgI"
          title="Cook guide"
        />
      </div>

      {/* Intro video — fixed bottom-right */}
      <div className="fixed bottom-6 right-6 z-40">
        <ThumbnailButton
          youtubeId="Jc9ULZJxG8w"
          title="Watch our intro"
        />
      </div>
    </>
  );
}
