import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card as CardComponent } from './components/Card';
import { SuitPicker } from './components/SuitPicker';
import { Card, GameState, Suit, Rank } from './types';
import { createDeck, shuffle, isValidMove, getSuitSymbol, getSuitColor } from './utils/gameLogic';
import { Trophy, RotateCcw, Info, ChevronRight, User, Cpu } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<GameState>({
    deck: [],
    discardPile: [],
    playerHand: [],
    aiHand: [],
    currentTurn: 'PLAYER',
    currentSuit: null,
    status: 'START',
    winner: null,
    lastAction: 'Welcome to JayT Crazy Eights!',
  });

  const [showInstructions, setShowInstructions] = useState(false);

  // Initialize game
  const initGame = useCallback(() => {
    const fullDeck = shuffle(createDeck());
    const playerHand = fullDeck.splice(0, 8);
    const aiHand = fullDeck.splice(0, 8);
    const firstDiscard = fullDeck.pop()!;
    
    // If first discard is an 8, reshuffle or just pick another? 
    // Let's just reshuffle if it's an 8 to keep it simple for start.
    if (firstDiscard.rank === Rank.EIGHT) {
      initGame();
      return;
    }

    setState({
      deck: fullDeck,
      discardPile: [firstDiscard],
      playerHand,
      aiHand,
      currentTurn: 'PLAYER',
      currentSuit: null,
      status: 'PLAYING',
      winner: null,
      lastAction: 'Game started! Your turn.',
    });
  }, []);

  // AI Logic
  const executeAiTurn = useCallback(() => {
    if (state.status !== 'PLAYING' || state.currentTurn !== 'AI') return;

    setTimeout(() => {
      const topCard = state.discardPile[state.discardPile.length - 1];
      const playableCards = state.aiHand.filter(card => 
        isValidMove(card, topCard, state.currentSuit)
      );

      if (playableCards.length > 0) {
        // AI strategy: play an 8 if it has one, or just pick the first valid card
        const cardToPlay = playableCards.find(c => c.rank === Rank.EIGHT) || playableCards[0];
        
        const newAiHand = state.aiHand.filter(c => c.id !== cardToPlay.id);
        const newDiscardPile = [...state.discardPile, cardToPlay];
        
        if (cardToPlay.rank === Rank.EIGHT) {
          // AI picks the suit it has most of
          const suitCounts: Record<Suit, number> = {
            [Suit.HEARTS]: 0, [Suit.DIAMONDS]: 0, [Suit.CLUBS]: 0, [Suit.SPADES]: 0
          };
          newAiHand.forEach(c => suitCounts[c.suit]++);
          const bestSuit = (Object.keys(suitCounts) as Suit[]).reduce((a, b) => 
            suitCounts[a] > suitCounts[b] ? a : b
          );

          setState(prev => ({
            ...prev,
            aiHand: newAiHand,
            discardPile: newDiscardPile,
            currentSuit: bestSuit,
            currentTurn: 'PLAYER',
            lastAction: `AI played 8 and chose ${bestSuit}!`,
            status: newAiHand.length === 0 ? 'GAME_OVER' : 'PLAYING',
            winner: newAiHand.length === 0 ? 'AI' : null,
          }));
        } else {
          setState(prev => ({
            ...prev,
            aiHand: newAiHand,
            discardPile: newDiscardPile,
            currentSuit: null,
            currentTurn: 'PLAYER',
            lastAction: `AI played ${cardToPlay.rank} of ${cardToPlay.suit}.`,
            status: newAiHand.length === 0 ? 'GAME_OVER' : 'PLAYING',
            winner: newAiHand.length === 0 ? 'AI' : null,
          }));
        }
      } else {
        // AI must draw
        if (state.deck.length > 0) {
          const newDeck = [...state.deck];
          const drawnCard = newDeck.pop()!;
          setState(prev => ({
            ...prev,
            deck: newDeck,
            aiHand: [...prev.aiHand, drawnCard],
            lastAction: 'AI drew a card.',
            currentTurn: 'PLAYER',
          }));
        } else {
          setState(prev => ({
            ...prev,
            currentTurn: 'PLAYER',
            lastAction: 'AI skipped (deck empty).',
          }));
        }
      }
    }, 1500);
  }, [state]);

  useEffect(() => {
    if (state.currentTurn === 'AI' && state.status === 'PLAYING') {
      executeAiTurn();
    }
  }, [state.currentTurn, state.status, executeAiTurn]);

  const handlePlayerPlay = (card: Card) => {
    if (state.currentTurn !== 'PLAYER' || state.status !== 'PLAYING') return;

    const topCard = state.discardPile[state.discardPile.length - 1];
    if (!isValidMove(card, topCard, state.currentSuit)) return;

    const newPlayerHand = state.playerHand.filter(c => c.id !== card.id);
    const newDiscardPile = [...state.discardPile, card];

    if (card.rank === Rank.EIGHT) {
      setState(prev => ({
        ...prev,
        playerHand: newPlayerHand,
        discardPile: newDiscardPile,
        status: 'SUIT_PICKING',
        lastAction: 'You played an 8! Pick a suit.',
      }));
    } else {
      const isWin = newPlayerHand.length === 0;
      setState(prev => ({
        ...prev,
        playerHand: newPlayerHand,
        discardPile: newDiscardPile,
        currentSuit: null,
        currentTurn: 'AI',
        lastAction: `You played ${card.rank} of ${card.suit}.`,
        status: isWin ? 'GAME_OVER' : 'PLAYING',
        winner: isWin ? 'PLAYER' : null,
      }));
    }
  };

  const handleSuitSelect = (suit: Suit) => {
    const isWin = state.playerHand.length === 0;
    setState(prev => ({
      ...prev,
      currentSuit: suit,
      currentTurn: 'AI',
      status: isWin ? 'GAME_OVER' : 'PLAYING',
      winner: isWin ? 'PLAYER' : null,
      lastAction: `You chose ${suit}. AI's turn.`,
    }));
  };

  const handleDraw = () => {
    if (state.currentTurn !== 'PLAYER' || state.status !== 'PLAYING') return;

    if (state.deck.length > 0) {
      const newDeck = [...state.deck];
      const drawnCard = newDeck.pop()!;
      
      setState(prev => ({
        ...prev,
        deck: newDeck,
        playerHand: [...prev.playerHand, drawnCard],
        lastAction: `You drew a card.`,
        currentTurn: 'AI',
      }));
    } else {
      setState(prev => ({
        ...prev,
        currentTurn: 'AI',
        lastAction: 'Deck empty. Turn skipped.',
      }));
    }
  };

  const topCard = state.discardPile[state.discardPile.length - 1];

  return (
    <div className="min-h-screen bg-blue-600 text-white font-sans selection:bg-orange-400/30 overflow-hidden flex flex-col relative">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/10 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-xl">8</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">JayT Crazy Eights</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-60 text-white">Classic Edition</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowInstructions(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <Info size={20} />
          </button>
          <button 
            onClick={initGame}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      {/* Game Board */}
      <main className="flex-1 relative flex flex-col items-center justify-between p-4 sm:p-8 z-10">
        
        {/* AI Hand */}
        <div className="w-full flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
            <Cpu size={16} />
            <span>AI Opponent ({state.aiHand.length} cards)</span>
          </div>
          <div className="flex -space-x-12 sm:-space-x-16 overflow-visible h-36 items-center">
            {state.aiHand.map((card, i) => (
              <CardComponent 
                key={card.id} 
                card={card} 
                isFaceDown 
                className="shadow-2xl"
              />
            ))}
          </div>
        </div>

        {/* Center Area */}
        <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-16 my-8">
          {/* Draw Pile */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              {state.deck.length > 0 ? (
                <>
                  <div className="absolute top-1 left-1 w-20 h-28 sm:w-24 sm:h-36 bg-blue-800 rounded-lg border border-white/20 translate-x-2 translate-y-2" />
                  <div className="absolute top-1 left-1 w-20 h-28 sm:w-24 sm:h-36 bg-blue-800 rounded-lg border border-white/20 translate-x-1 translate-y-1" />
                  <CardComponent 
                    card={{} as Card} 
                    isFaceDown 
                    onClick={state.currentTurn === 'PLAYER' ? handleDraw : undefined}
                    className={state.currentTurn === 'PLAYER' ? 'cursor-pointer ring-4 ring-orange-400' : ''}
                  />
                </>
              ) : (
                <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center text-white/20">
                  Empty
                </div>
              )}
            </div>
            <span className="text-xs font-mono text-white/50 uppercase tracking-tighter">Draw Pile ({state.deck.length})</span>
          </div>

          {/* Discard Pile */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <AnimatePresence mode="popLayout">
                {state.discardPile.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ scale: 0.8, opacity: 0, rotate: i % 2 === 0 ? -5 : 5 }}
                    animate={{ scale: 1, opacity: 1, rotate: i === state.discardPile.length - 1 ? 0 : (i % 2 === 0 ? -5 : 5) }}
                    className={i === state.discardPile.length - 1 ? 'relative z-10' : 'absolute inset-0'}
                  >
                    <CardComponent card={card} />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {state.currentSuit && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-orange-500 z-20"
                >
                  <span className={`text-2xl ${getSuitColor(state.currentSuit)}`}>
                    {getSuitSymbol(state.currentSuit)}
                  </span>
                </motion.div>
              )}
            </div>
            <span className="text-xs font-mono text-white/50 uppercase tracking-tighter">Discard Pile</span>
          </div>
        </div>

        {/* Player Hand */}
        <div className="w-full flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 w-full max-w-2xl px-4">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="flex items-center gap-2 text-sm font-medium">
              <User size={16} className={state.currentTurn === 'PLAYER' ? 'text-orange-400' : 'text-white/40'} />
              <span className={state.currentTurn === 'PLAYER' ? 'text-orange-400' : 'text-white/40'}>
                Your Hand ({state.playerHand.length} cards)
              </span>
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          <div className="flex -space-x-8 sm:-space-x-10 overflow-x-auto overflow-y-visible pb-8 pt-4 px-12 max-w-full scrollbar-hide">
            {state.playerHand.map((card) => (
              <CardComponent 
                key={card.id} 
                card={card} 
                isPlayable={state.currentTurn === 'PLAYER' && isValidMove(card, topCard, state.currentSuit)}
                onClick={() => handlePlayerPlay(card)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="p-4 bg-black/40 backdrop-blur-md border-t border-white/10 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${state.currentTurn === 'PLAYER' ? 'bg-orange-400 animate-pulse shadow-[0_0_8px_#fb923c]' : 'bg-slate-600'}`} />
          <p className="text-sm font-medium italic text-white/80">
            {state.lastAction}
          </p>
        </div>
        
        {state.status === 'START' && (
          <button 
            onClick={initGame}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-full shadow-lg transition-all flex items-center gap-2 group uppercase tracking-widest"
          >
            Start Game
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {state.status === 'SUIT_PICKING' && (
          <SuitPicker onSelect={handleSuitSelect} />
        )}

        {state.status === 'GAME_OVER' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <div className="bg-white text-slate-900 p-10 rounded-3xl shadow-2xl text-center max-w-md w-full border-4 border-orange-500">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={40} className="text-orange-600" />
              </div>
              <h2 className="text-4xl font-black mb-2 uppercase tracking-tight">
                {state.winner === 'PLAYER' ? 'Victory!' : 'Game Over'}
              </h2>
              <p className="text-slate-500 mb-8 font-medium">
                {state.winner === 'PLAYER' 
                  ? 'You cleared your hand and won the game!' 
                  : 'The AI was faster this time. Better luck next round!'}
              </p>
              <button 
                onClick={initGame}
                className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 tracking-widest"
              >
                <RotateCcw size={20} />
                Play Again
              </button>
            </div>
          </motion.div>
        )}

        {showInstructions && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setShowInstructions(false)}
          >
            <div 
              className="bg-white text-slate-900 p-8 rounded-3xl shadow-2xl max-w-lg w-full border-4 border-blue-500"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2 uppercase tracking-tight">
                <Info className="text-blue-500" />
                How to Play
              </h2>
              <ul className="space-y-4 text-slate-600 text-sm">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold border border-blue-200">1</span>
                  <p>Match the <strong>Suit</strong> or <strong>Rank</strong> of the top card in the discard pile.</p>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold border border-blue-200">2</span>
                  <p><strong>8s are Wild!</strong> Play an 8 anytime to change the current suit to whatever you want.</p>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold border border-blue-200">3</span>
                  <p>If you can't play, you must <strong>draw a card</strong> from the deck. Drawing ends your turn.</p>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold border border-blue-200">4</span>
                  <p>The first player to <strong>empty their hand</strong> wins the game!</p>
                </li>
              </ul>
              <button 
                onClick={() => setShowInstructions(false)}
                className="mt-8 w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors tracking-widest uppercase"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
