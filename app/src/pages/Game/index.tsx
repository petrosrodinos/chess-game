import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { Board } from "./components/Board";
import { Board3D } from "./components/Board3D";
import { TopMenu } from "./components/TopMenu";
import { GameSettingsModal } from "./components/GameSettingsModal";
import { BottomMenu } from "./components/BottomMenu";
import { RightSidebar } from "./components/RightSidebar";
import { GameResultModal } from "./components/GameResultModal";
import { MysteryBoxReviveModal } from "./components/MysteryBoxReviveModal";
import { ZombieReviveModal } from "./components/ZombieReviveModal";
import { Modal } from "../../components/Modal";
import { useGameStore } from "../../store/gameStore";
import { useUIStore } from "../../store/uiStore";
import { useGameMode, useOnlineGame, useSoundEffects } from "../../hooks";
import { PlayerColors, MysteryBoxPhases, PieceTypes, ObstacleTypes, isObstacle, type Piece } from "./types";
import { BOT_DELAY } from "./constants";
import { PIECE_NAMES, PIECE_SYMBOLS } from "./constants";
import { environments } from "../../config/environments";
import { GameModes } from "../../constants";
import { areRevivalGuardsInPlace, findPiecePosition, getZombieRevivePieces, getZombieReviveStatusMessage, getZombieReviveConfirmState, getZombieRevivePlacementTarget } from "./utils";

export const Game = () => {
  const { mode } = useGameMode();
  const isOnline = mode === GameModes.ONLINE;

  const { gameState, botEnabled, botDifficulty, botThinking, processBotMove, startGameTimer, mysteryBoxState: offlineMysteryBoxState, selectRevivePiece: offlineSelectRevivePiece, cancelMysteryBox: offlineCancelMysteryBox, selectSquare: offlineSelectSquare, reviveZombie: offlineReviveZombie } = useGameStore();
  const { is3D, isTopMenuOpen, isRightMenuOpen, closeTopMenu, closeRightMenu } = useUIStore();
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isZombieReviveOpen, setIsZombieReviveOpen] = useState(false);
  const [selectedZombiePiece, setSelectedZombiePiece] = useState<Piece | null>(null);

  const { gameSession, board: onlineBoard, boardSize: onlineBoardSize, selectedPosition: onlineSelectedPosition, validMoves: onlineValidMoves, validAttacks: onlineValidAttacks, validSwaps: onlineValidSwaps, lastMove: onlineLastMove, capturedPieces: onlineCapturedPieces, gameOver: onlineGameOver, winner: onlineWinner, mysteryBoxState: onlineMysteryBoxState, currentPlayer, isMyTurn, isLoading, error, handleSquareClick, selectRevivePiece: onlineSelectRevivePiece, cancelMysteryBox: onlineCancelMysteryBox, requestZombieRevive, notifyReviveStarted } = useOnlineGame();

  const mysteryBoxState = isOnline ? onlineMysteryBoxState : offlineMysteryBoxState;
  const selectRevivePiece = isOnline ? onlineSelectRevivePiece : offlineSelectRevivePiece;
  const cancelMysteryBox = isOnline ? onlineCancelMysteryBox : offlineCancelMysteryBox;

  useEffect(() => {
    if (isOnline) return;
    if (!botEnabled) return;
    if (gameState.currentPlayer !== PlayerColors.BLACK) return;
    if (gameState.gameOver) return;
    if (botThinking) return;

    const timer = setTimeout(() => {
      processBotMove();
    }, BOT_DELAY[botDifficulty]);

    return () => clearTimeout(timer);
  }, [isOnline, botEnabled, botDifficulty, gameState.currentPlayer, gameState.gameOver, botThinking, processBotMove]);

  useEffect(() => {
    const isGameOver = isOnline ? onlineGameOver : gameState.gameOver;
    if (isGameOver) {
      setIsResultModalOpen(true);
    }
  }, [isOnline, onlineGameOver, gameState.gameOver]);

  const winner = isOnline ? onlineWinner : gameState.winner;
  const board = isOnline ? onlineBoard : gameState.board;
  const boardSize = isOnline ? onlineBoardSize : gameState.boardSize;
  const currentPlayerColor = gameState.currentPlayer;
  const capturedPieces = isOnline ? onlineCapturedPieces : gameState.capturedPieces;
  const lastMove = isOnline ? onlineLastMove : gameState.lastMove;

  const { playBoardClick, playSwap, playMysteryBox, playCaveTeleport, playRevive, playGameOver } = useSoundEffects(lastMove);

  const prevGameOverRef = useRef(false);
  useEffect(() => {
    const isGameOver = isOnline ? onlineGameOver : gameState.gameOver;
    if (isGameOver) {
      if (!prevGameOverRef.current) {
        playGameOver();
      }
      prevGameOverRef.current = true;
    } else {
      prevGameOverRef.current = false;
    }
  }, [isOnline, onlineGameOver, gameState.gameOver, playGameOver]);

  const lastCaptureToastKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (isOnline) return;
    if (!lastMove || !lastMove.captured) return;
    const toastKey = `${lastMove.from.row},${lastMove.from.col}-${lastMove.to.row},${lastMove.to.col}-${lastMove.piece.id}-${lastMove.captured.id}`;
    if (lastCaptureToastKeyRef.current === toastKey) return;
    lastCaptureToastKeyRef.current = toastKey;
    const victimIcon = PIECE_SYMBOLS[lastMove.captured.color][lastMove.captured.type];
    const killerIcon = PIECE_SYMBOLS[lastMove.piece.color][lastMove.piece.type];
    if (lastMove.terminatedByNarc) {
      toast.info(`${killerIcon} killed ${victimIcon} ${PIECE_NAMES[lastMove.captured.type]}`, { autoClose: 2500 });
    } else {
      toast.info(`${killerIcon} ${PIECE_NAMES[lastMove.piece.type]} killed ${victimIcon} ${PIECE_NAMES[lastMove.captured.type]}`, { autoClose: 2500 });
    }
  }, [isOnline, lastMove]);

  useEffect(() => {
    if (!isOnline) startGameTimer();
  }, [isOnline, startGameTimer]);

  const prevMysteryBoxPhaseRef = useRef(mysteryBoxState.phase);
  useEffect(() => {
    const prevPhase = prevMysteryBoxPhaseRef.current;
    prevMysteryBoxPhaseRef.current = mysteryBoxState.phase;
    if (prevPhase === MysteryBoxPhases.WAITING_REVIVE_PLACEMENT && !mysteryBoxState.isActive) {
      playRevive();
    }
  }, [mysteryBoxState.phase, mysteryBoxState.isActive, playRevive]);

  const revivableZombiePieces = useMemo(() => {
    return getZombieRevivePieces(capturedPieces, currentPlayerColor);
  }, [capturedPieces, currentPlayerColor]);
  const necromancerPosition = useMemo(() => {
    return findPiecePosition(board, PieceTypes.NECROMANCER, currentPlayerColor);
  }, [board, currentPlayerColor]);
  const guardsInPlace = useMemo(() => {
    return areRevivalGuardsInPlace(board, boardSize, currentPlayerColor);
  }, [board, boardSize, currentPlayerColor]);
  const reviveTarget = useMemo(() => {
    if (!selectedZombiePiece) return null;
    return getZombieRevivePlacementTarget(board, boardSize, selectedZombiePiece, currentPlayerColor);
  }, [board, boardSize, selectedZombiePiece, currentPlayerColor]);
  const canConfirmZombieRevive = useMemo(() => {
    return getZombieReviveConfirmState({
      necromancerPosition,
      selectedZombiePiece,
      reviveTarget,
      guardsInPlace,
      isOnline,
      isMyTurn,
    });
  }, [necromancerPosition, selectedZombiePiece, reviveTarget, guardsInPlace, isOnline, isMyTurn]);

  const zombieReviveStatusMessage = useMemo(() => {
    return getZombieReviveStatusMessage({
      isOnline,
      isMyTurn,
      necromancerPosition,
      guardsInPlace,
      revivableCount: revivableZombiePieces.length,
      selectedZombiePiece,
      reviveTarget,
    });
  }, [isOnline, isMyTurn, necromancerPosition, guardsInPlace, revivableZombiePieces.length, selectedZombiePiece, reviveTarget]);

  const openZombieRevive = () => {
    setSelectedZombiePiece(null);
    setIsZombieReviveOpen(true);
  };

  const closeZombieRevive = () => {
    setIsZombieReviveOpen(false);
    setSelectedZombiePiece(null);
  };

  const executeRevive = (target: { row: number; col: number }) => {
    if (!selectedZombiePiece || !necromancerPosition) return false;
    if (isOnline) {
      requestZombieRevive({
        necromancerPosition,
        revivePiece: selectedZombiePiece,
        target,
      });
      playRevive();
      closeZombieRevive();
      return true;
    }
    const success = offlineReviveZombie({
      necromancerPosition,
      revivePiece: selectedZombiePiece,
      target,
    });
    if (success) {
      playRevive();
      closeZombieRevive();
    }
    return success;
  };

  const confirmZombieRevive = () => {
    if (!selectedZombiePiece || !reviveTarget || !necromancerPosition) return;
    if (!canConfirmZombieRevive) return;
    executeRevive(reviveTarget);
  };

  const handleReviveZombieClick = () => {
    if (!selectedZombiePiece || !canConfirmZombieRevive) return;
    if (isOnline) notifyReviveStarted();
    confirmZombieRevive();
  };

  const onSquareClick = (pos: { row: number; col: number }) => {
    const hasSelection = isOnline ? onlineSelectedPosition !== null : gameState.selectedPosition !== null;
    const currentSwaps = isOnline ? onlineValidSwaps : gameState.validSwaps;
    const currentValidMoves = isOnline ? onlineValidMoves : gameState.validMoves;
    const currentValidAttacks = isOnline ? onlineValidAttacks : gameState.validAttacks;

    const isSwapTarget = hasSelection && currentSwaps.some((s) => s.position.row === pos.row && s.position.col === pos.col);
    const isMoveOrAttack = hasSelection && (currentValidMoves.some((m) => m.row === pos.row && m.col === pos.col) || currentValidAttacks.some((a) => a.row === pos.row && a.col === pos.col));
    const targetCell = board[pos.row]?.[pos.col];
    const isMysteryBoxTarget = isMoveOrAttack && targetCell && isObstacle(targetCell) && targetCell.type === ObstacleTypes.MYSTERY_BOX;
    const isCaveTarget = isMoveOrAttack && targetCell && isObstacle(targetCell) && targetCell.type === ObstacleTypes.CAVE;

    if (isSwapTarget) {
      playSwap();
    } else if (isMysteryBoxTarget) {
      playMysteryBox();
    } else if (isCaveTarget) {
      playCaveTeleport();
    } else if (!hasSelection) {
      playBoardClick();
    }

    if (isOnline) {
      handleSquareClick(pos);
    } else {
      offlineSelectSquare(pos, false);
    }
  };

  if (isOnline && isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
          <p className="text-amber-200 text-lg">Loading game...</p>
        </div>
      </div>
    );
  }

  if (isOnline && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 flex items-center justify-center">
        <div className="bg-rose-600/20 border border-rose-500 rounded-xl p-6 max-w-md">
          <h2 className="text-rose-400 text-xl font-bold mb-2">Error</h2>
          <p className="text-stone-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent">{environments.APP_NAME}</h1>

        <div className="flex flex-col lg:flex-row gap-2 items-start justify-center">
          <div className="flex flex-col items-center">
            <div className="mb-2 w-full max-w-2xl">
              <TopMenu onOpenSettings={() => setIsSettingsOpen(true)} />
            </div>

            {is3D ? (
              <Board3D isOnline={isOnline} onlineBoard={onlineBoard} onlineBoardSize={onlineBoardSize} onlineSelectedPosition={onlineSelectedPosition} onlineValidMoves={onlineValidMoves} onlineValidAttacks={onlineValidAttacks} onlineValidSwaps={onlineValidSwaps} onlineLastMove={onlineLastMove} onlineMysteryBoxState={onlineMysteryBoxState} onSquareClick={onSquareClick} onMysteryBoxClick={playBoardClick} />
            ) : (
              <Board isOnline={isOnline} onlineBoard={onlineBoard} onlineBoardSize={onlineBoardSize} onlineSelectedPosition={onlineSelectedPosition} onlineValidMoves={onlineValidMoves} onlineValidAttacks={onlineValidAttacks} onlineValidSwaps={onlineValidSwaps} onlineLastMove={onlineLastMove} onlineMysteryBoxState={onlineMysteryBoxState} onSquareClick={onSquareClick} onMysteryBoxClick={playBoardClick} />
            )}

            {!isOnline && <BottomMenu />}
          </div>

          <div className="flex-shrink-0 w-full lg:w-auto max-w-md mx-auto lg:mx-0">
            <RightSidebar onOpenZombieRevive={openZombieRevive} />
          </div>
        </div>

        <Modal isOpen={isTopMenuOpen} onClose={closeTopMenu} title={isOnline ? "Game Info" : "Game"}>
          <TopMenu
            onOpenSettings={() => {
              closeTopMenu();
              setIsSettingsOpen(true);
            }}
          />
        </Modal>

        <GameSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

        <Modal isOpen={isRightMenuOpen} onClose={closeRightMenu} title="Game Info">
          <RightSidebar onOpenZombieRevive={openZombieRevive} />
        </Modal>

        <GameResultModal isOpen={isResultModalOpen} onClose={() => setIsResultModalOpen(false)} winner={winner} capturedPieces={isOnline ? onlineCapturedPieces : gameState.capturedPieces} isOnline={isOnline} currentPlayer={currentPlayer} players={gameSession?.players} />

        <MysteryBoxReviveModal isOpen={mysteryBoxState.isActive && mysteryBoxState.phase === MysteryBoxPhases.WAITING_REVIVE_FIGURE} onClose={cancelMysteryBox} pieces={mysteryBoxState.revivablePieces} onSelectPiece={selectRevivePiece} selectedPieceId={mysteryBoxState.selectedRevivePiece?.id || null} />

        <ZombieReviveModal isOpen={isZombieReviveOpen} onClose={closeZombieRevive} pieces={revivableZombiePieces} onSelectPiece={setSelectedZombiePiece} selectedPieceId={selectedZombiePiece?.id || null} selectedTarget={reviveTarget} onConfirm={handleReviveZombieClick} canConfirm={canConfirmZombieRevive} statusMessage={zombieReviveStatusMessage} />
      </div>
    </div>
  );
};
