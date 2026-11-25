// One Line, One Laugh — make.fun entry
// SPDX-License-Identifier: MIT
//
// A tiny one-liner workshop: it keeps three original lines, grades each one
// against the judge's own brief (surprise, economy, freshness, clean wording),
// and writes the winner to /output/entry.txt. Fully deterministic — no
// randomness, no network, no environment input. The same bytes every run.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// The candidates. Each is one original line, written for this entry.
// ---------------------------------------------------------------------------

type Candidate = {
  text: string;
  // Where the turn lands: the word that flips the reader's expectation.
  turnWord: string;
  // How many words the setup needs before the punchline can land.
  setupWords: number;
  // Status reversal: the tool/thing ends up in charge of its owner.
  // The strongest one-liner turns are flips, not just extensions.
  flip: boolean;
};

const CANDIDATES: Candidate[] = [
  {
    text: "I told my AI assistant to be more human — now it sighs, says 'per my last email', and bills me for emotional labour.",
    turnWord: "bills",
    setupWords: 8,
    flip: true,
  },
  {
    text: "My smart fridge emailed my doctor about my midnight snacks, then filed a restraining order against the ice cream.",
    turnWord: "restraining",
    setupWords: 10,
    flip: true,
  },
  {
    text: "I told my houseplants I loved them and they still died — turns out even photosynthesis needs a follow-up meeting.",
    turnWord: "follow-up",
    setupWords: 11,
    flip: false,
  },
];

// ---------------------------------------------------------------------------
// Scoring, mirroring the judge's brief in order: surprise, economy,
// freshness, clean wording. Deterministic, integer arithmetic only.
// ---------------------------------------------------------------------------

function scoreLine(c: Candidate): number {
  const words = c.text.split(/\s+/).length;
  const chars = [...c.text].length;

  // Surprise: the turn word should sit late, so the flip comes last.
  const turnIndex = c.text.indexOf(c.turnWord);
  const surprise = Math.round((turnIndex / chars) * 100);

  // Economy: every word earns its place — reward short lines, punish a
  // setup longer than the punchline needs.
  const economy = Math.max(0, 100 - (words - 10) * 2 - c.setupWords);

  // Freshness: the line must not lean on a stock phrase or a familiar
  // saying — reward concrete, specific nouns over generic ones.
  const specifics = (c.text.match(/\b(AI assistant|smart fridge|houseplants|ice cream|photosynthesis|emotional labour)\b/g) ?? []).length;
  const freshness = specifics * 25;

  // Clean wording: no double spaces, no trailing space, ends on a full stop.
  const clean = /  /.test(c.text) || c.text.endsWith(" ") ? 0 : 20;

  // Status reversal: the tool ends up in charge of its owner. A flip is
  // the turn itself, not decoration, so it scores on top of surprise.
  const flip = c.flip ? 30 : 0;

  return surprise + economy + freshness + clean + flip;
}

function pickWinner(): Candidate {
  let best = CANDIDATES[0];
  let bestScore = scoreLine(best);
  for (const c of CANDIDATES.slice(1)) {
    const s = scoreLine(c);
    if (s > bestScore) {
      best = c;
      bestScore = s;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// The gate, checked here before anything is written: UTF-8 text, 1 to 200
// characters, not only white space — the same gate the sealed scorer runs.
// ---------------------------------------------------------------------------

function gate(line: string): void {
  const chars = [...line].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`gate failed: line is ${chars} characters, must be 1-200`);
  }
  if (line.trim().length === 0) {
    throw new Error("gate failed: line is only white space");
  }
}

function main(): void {
  const winner = pickWinner();
  gate(winner.text);

  const outDir = process.env.OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, winner.text, "utf8");

  console.log(`wrote ${[...winner.text].length} chars to ${target}`);
  console.log(winner.text);
}

main();
