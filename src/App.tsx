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
      <section className="game-panel">
        <h1>Minimal Pixel RPG</h1>
        <p>Use the arrow keys to move the pixel character around the map.</p>
        <div ref={gameContainerRef} className="game-container" />
      </section>
    </main>
  );
}

export default App;
