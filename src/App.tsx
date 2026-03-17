import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { createGame } from "./game/game";

function App() {
  const gameContainerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameContainerRef.current || gameRef.current) {
      return;
    }

    gameRef.current = createGame(gameContainerRef.current);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <main className="app-shell">
      <div ref={gameContainerRef} className="game-container" />
    </main>
  );
}

export default App;
