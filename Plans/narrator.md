# 🧙‍♀️ Skye Narrator System – Integration Guide

## 📦 Tech Stack

- Phaser 3 (Game Logic)
- React 19 (UI Layer)
- TypeScript
- Vite

---

## 🧠 Architecture Overview

- **Phaser** handles gameplay events
- **React** displays narrator UI
- Communication via **Custom Events**

---

## 📁 Folder Structure

use any you feel clean

---

## 🧙‍♀️ 1. Skye Dialogue Data

### `skyeDialogue.ts`

```ts
export const SKYE_DIALOGUE = {
  explore: [
    "Off you go. Try not to embarrass yourself.",
    "Exploring again? Brave. Or foolish.",
  ],
  loot: [
    "Ooo shiny. Don’t lose it instantly.",
    "You found something. Shocking.",
  ],
  enemy: [
    "Something wants you dead. I approve.",
    "Fight time. Try to survive.",
  ],
  win: ["You won. Miracles exist."],
  lose: ["That was painful to watch."],
  death: ["And you're gone. Fantastic."],
  nothing: ["Absolutely nothing. Impressive."],
};
```

---

## 🎲 2. Narrator Logic

### `narrator.ts`

```ts
import { SKYE_DIALOGUE } from "./skyeDialogue";

export type GameEvent =
  | "explore"
  | "loot"
  | "enemy"
  | "win"
  | "lose"
  | "death"
  | "nothing";

export function getSkyeLine(event: GameEvent): string {
  const lines = SKYE_DIALOGUE[event];
  return lines[Math.floor(Math.random() * lines.length)];
}
```

---

## ⚛️ 3. Narrator UI Component

### `NarratorBox.tsx`

```tsx
import React from "react";

type Props = {
  text: string;
};

export const NarratorBox: React.FC<Props> = ({ text }) => {
  return (
    <div style={styles.container}>
      <div style={styles.name}>🧙‍♀️ Skye</div>
      <div style={styles.text}>{text}</div>
    </div>
  );
};

const styles = {
  container: {
    position: "absolute" as const,
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
    width: "80%",
    maxWidth: "600px",
    background: "#1a1a1a",
    color: "#fff",
    padding: "12px 16px",
    border: "2px solid #555",
    borderRadius: "8px",
    fontFamily: "monospace",
    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
  },
  name: {
    fontWeight: "bold",
    marginBottom: "6px",
  },
  text: {},
};
```

---

## 🔗 4. Phaser → React Communication

### In Phaser Scene

```ts
import { getSkyeLine } from "../narrator/narrator";

function triggerEvent(eventType: GameEvent) {
  const text = getSkyeLine(eventType);

  window.dispatchEvent(new CustomEvent("skye-dialogue", { detail: text }));
}
```

### Usage Example

```ts
triggerEvent("explore");
triggerEvent("loot");
triggerEvent("death");
```

---

## ⚛️ 5. React Listener

### `App.tsx`

```tsx
import { useEffect, useState } from "react";
import { NarratorBox } from "./ui/NarratorBox";

function App() {
  const [narratorText, setNarratorText] = useState(
    "Welcome, hero. Try not to die.",
  );

  useEffect(() => {
    const handler = (e: any) => {
      setNarratorText(e.detail);
    };

    window.addEventListener("skye-dialogue", handler);

    return () => {
      window.removeEventListener("skye-dialogue", handler);
    };
  }, []);

  return (
    <>
      <div id="game-container" />
      <NarratorBox text={narratorText} />
    </>
  );
}

export default App;
```

---

## ⚠️ Best Practices

- Do NOT trigger narrator updates inside game loop (`update()`)
- Trigger only on meaningful events
- Keep dialogue short and readable
- Avoid hardcoding dialogue inside logic

---

## 🔥 Optional Enhancements

### 1. Typewriter Effect

- Animate text appearing letter-by-letter

### 2. Conditional Dialogue

```ts
if (player.hp < 20) {
  return "You’re barely alive. Interesting.";
}
```

### 3. Rare Dialogue

```ts
if (Math.random() < 0.01) {
  return "…You’re still here?";
}
```

### 4. Mood System

- Different dialogue pools:
  - sarcastic
  - impressed
  - annoyed

---

## 🎯 Summary

You now have:

- Event-driven narrator system
- Modular dialogue management
- Phaser → React communication bridge
- Styled narrator UI component

This system is scalable, extendable, and ready for gameplay integration.
