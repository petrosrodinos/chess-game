import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, Box } from "lucide-react";
import { RULES_FIGURE_ORDER, RULES_FIGURE_SECTION_TITLES } from "../../Game/constants";
import { FigureSymbol } from "../../../components/FigureSymbol";
import { Piece3DShowcase } from "./Piece3DShowcase";

type ViewMode = "2d" | "3d";

export const PieceCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("2d");

  const pieceType = RULES_FIGURE_ORDER[activeIndex];
  const total = RULES_FIGURE_ORDER.length;

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <section className="relative z-10 w-full rounded-2xl border border-stone-700/60 bg-stone-900/40 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-stone-200">Figures</h2>
        <div className="flex rounded-lg border border-stone-600/60 bg-stone-800/50 p-0.5">
          <button type="button" onClick={() => setViewMode("2d")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "2d" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-stone-400 hover:text-stone-200"}`}>
            <LayoutGrid className="w-4 h-4" />
            2D
          </button>
          <button type="button" onClick={() => setViewMode("3d")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "3d" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-stone-400 hover:text-stone-200"}`}>
            <Box className="w-4 h-4" />
            3D
          </button>
        </div>
      </div>

      <div className="relative flex items-center gap-2 sm:gap-4">
        <button type="button" onClick={goPrev} className="flex-shrink-0 p-2 rounded-xl bg-stone-800 border border-stone-600/50 text-stone-300 hover:bg-stone-700 hover:text-stone-100 transition-colors" aria-label="Previous figure">
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="flex-1 min-w-0 rounded-xl overflow-hidden">
          {viewMode === "2d" ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-stone-900/80 border border-stone-600/50 flex items-center justify-center mb-4">
                <FigureSymbol pieceType={pieceType} size="lg" />
              </div>
              <p className="text-base sm:text-lg font-semibold text-amber-200/95">{RULES_FIGURE_SECTION_TITLES[pieceType]}</p>
            </div>
          ) : (
            <Piece3DShowcase pieceType={pieceType} />
          )}
        </div>

        <button type="button" onClick={goNext} className="flex-shrink-0 p-2 rounded-xl bg-stone-800 border border-stone-600/50 text-stone-300 hover:bg-stone-700 hover:text-stone-100 transition-colors" aria-label="Next figure">
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
        {RULES_FIGURE_ORDER.map((_, index) => (
          <button key={index} type="button" onClick={() => goTo(index)} className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors ${index === activeIndex ? "bg-amber-500 w-6 sm:w-8" : "bg-stone-600 hover:bg-stone-500"}`} aria-label={`Go to figure ${index + 1}`} />
        ))}
      </div>
    </section>
  );
};
