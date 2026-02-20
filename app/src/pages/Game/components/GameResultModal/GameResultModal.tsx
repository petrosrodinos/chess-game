import { useNavigate } from "react-router-dom";
import { Trophy, X, Home, RotateCcw } from "lucide-react";
import type { Piece, PlayerColor } from "../../types";
import type { Player } from "../../../../features/game/interfaces";
import { PIECE_RULES } from "../../constants";

interface GameResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: PlayerColor | null;
  capturedPieces: { white: Piece[]; black: Piece[] };
  isOnline: boolean;
  currentPlayer?: Player;
  players?: Player[];
}

const calculatePoints = (pieces: Piece[]): number => {
  return pieces.reduce((total, piece) => {
    const rules = PIECE_RULES[piece.type];
    if (!rules) return total;
    const points = piece.isZombie && rules.zombiePoints ? rules.zombiePoints : rules.points;
    return total + points;
  }, 0);
};

const getResultText = (winner: PlayerColor | null, isOnline: boolean, currentPlayer?: Player): { text: string; subtext: string; color: string } => {
  if (!winner) {
    return { text: "Draw!", subtext: "The game ended in a draw", color: "text-amber-400" };
  }

  if (isOnline && currentPlayer) {
    const isWinner = currentPlayer.color === winner;
    if (isWinner) {
      return { text: "Victory!", subtext: "Congratulations, you won!", color: "text-emerald-400" };
    }
    return { text: "Defeat", subtext: "Better luck next time!", color: "text-rose-400" };
  }

  const winnerName = winner === "white" ? "White" : "Black";
  return { text: `${winnerName} Wins!`, subtext: "Congratulations!", color: "text-emerald-400" };
};

export const GameResultModal = ({ isOpen, onClose, winner, capturedPieces, isOnline, currentPlayer, players }: GameResultModalProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const whitePoints = calculatePoints(capturedPieces.black);
  const blackPoints = calculatePoints(capturedPieces.white);

  const result = getResultText(winner, isOnline, currentPlayer);

  const whitePlayer = players?.find((p) => p.color === "white");
  const blackPlayer = players?.find((p) => p.color === "black");

  const handleGoHome = () => {
    navigate("/home");
  };

  const handlePlayAgain = () => {
    if (isOnline) {
      handleGoHome();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-stone-800 to-stone-900 rounded-2xl border border-stone-600 w-full max-w-md shadow-2xl overflow-hidden">
        <div className="relative bg-gradient-to-r from-amber-600/20 via-amber-500/20 to-amber-600/20 px-6 py-8 text-center">
          <button onClick={onClose} className="absolute top-3 right-3 text-stone-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${winner ? "bg-amber-500/20" : "bg-stone-600/20"}`}>
              <Trophy className={`w-12 h-12 ${result.color}`} />
            </div>
          </div>

          <h2 className={`text-3xl font-bold ${result.color} mb-2`}>{result.text}</h2>
          <p className="text-stone-300">{result.subtext}</p>
        </div>

        <div className="p-6">
          <h3 className="text-stone-400 text-sm font-medium uppercase tracking-wider mb-4 text-center">Final Score</h3>

          <div className="flex items-center justify-between gap-4">
            <div className={`flex-1 p-4 rounded-xl text-center ${winner === "white" ? "bg-emerald-600/20 border border-emerald-500/50" : "bg-stone-700/50 border border-stone-600/50"}`}>
              <div className="text-stone-400 text-sm mb-1">{isOnline && whitePlayer ? whitePlayer.name : "White"}</div>
              <div className={`text-3xl font-bold ${winner === "white" ? "text-emerald-400" : "text-stone-200"}`}>{whitePoints}</div>
              <div className="text-stone-500 text-xs mt-1">points</div>
            </div>

            <div className="text-stone-500 text-2xl font-bold">vs</div>

            <div className={`flex-1 p-4 rounded-xl text-center ${winner === "black" ? "bg-emerald-600/20 border border-emerald-500/50" : "bg-stone-700/50 border border-stone-600/50"}`}>
              <div className="text-stone-400 text-sm mb-1">{isOnline && blackPlayer ? blackPlayer.name : "Black"}</div>
              <div className={`text-3xl font-bold ${winner === "black" ? "text-emerald-400" : "text-stone-200"}`}>{blackPoints}</div>
              <div className="text-stone-500 text-xs mt-1">points</div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleGoHome} className="flex-1 py-3 px-4 bg-stone-700 hover:bg-stone-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
              <Home className="w-5 h-5" />
              Home
            </button>
            <button onClick={handlePlayAgain} className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-900 font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
