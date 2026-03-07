import type { CSSProperties } from 'react';

const SHEET_W = 256;
const SHEET_H = 160;
const SPRITE_URL = `${import.meta.env.BASE_URL}sprites.png`;

const CHAR_SHEET_W = 89;
const CHAR_SHEET_H = 23;
const CHAR_SPRITE_URL = `${import.meta.env.BASE_URL}characters.png`;

export interface SpriteRect {
  x: number;
  y: number;
  w: number;
  h: number;
  sheet?: 'main' | 'chars';
}

export function spriteStyle(sprite: SpriteRect, scale: number = 2): CSSProperties {
  const isChar = sprite.sheet === 'chars';
  const sheetW = isChar ? CHAR_SHEET_W : SHEET_W;
  const sheetH = isChar ? CHAR_SHEET_H : SHEET_H;
  const url = isChar ? CHAR_SPRITE_URL : SPRITE_URL;
  return {
    width: sprite.w * scale,
    height: sprite.h * scale,
    backgroundImage: `url(${url})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `${-sprite.x * scale}px ${-sprite.y * scale}px`,
    backgroundSize: `${sheetW * scale}px ${sheetH * scale}px`,
    imageRendering: 'pixelated',
  };
}

/** Scale sprite to fit a target height, preserving aspect ratio */
export function spriteStyleFitH(sprite: SpriteRect, targetH: number): CSSProperties {
  return spriteStyle(sprite, targetH / sprite.h);
}

// ── Characters (5 people) — from clean characters.png sheet ──
export const CHARACTERS: SpriteRect[] = [
  { x: 0,  y: 3,  w: 15, h: 20, sheet: 'chars' },  // 0: dark cap
  { x: 17, y: 2,  w: 19, h: 21, sheet: 'chars' },  // 1: red hair
  { x: 38, y: 2,  w: 13, h: 21, sheet: 'chars' },  // 2: glasses
  { x: 53, y: 0,  w: 17, h: 23, sheet: 'chars' },  // 3: long red hair
  { x: 72, y: 0,  w: 17, h: 23, sheet: 'chars' },  // 4: long dark hair
];

const AGENT_IDX: Record<string, number> = {
  atlas: 0, clawd: 1, clip: 2, closer: 3,
  nova: 4, oracle: 1, pixel: 0,
  sage: 2, scribe: 3, sentinel: 4, trendy: 1,
};

export function getAgentSprite(id: string): SpriteRect {
  return CHARACTERS[AGENT_IDX[id] ?? 0];
}

// ── Chairs (6 colored) ────────────────────────────────────
export const CHAIRS: SpriteRect[] = [
  { x: 6, y: 41, w: 11, h: 29 },   // red
  { x: 19, y: 41, w: 11, h: 29 },  // orange
  { x: 32, y: 41, w: 11, h: 29 },  // green
  { x: 45, y: 41, w: 11, h: 29 },  // blue
  { x: 58, y: 41, w: 11, h: 29 },  // white
  { x: 71, y: 41, w: 11, h: 29 },  // gray
];

// ── Desks / counters ──────────────────────────────────────
export const DESK_BLUE: SpriteRect = { x: 3, y: 68, w: 78, h: 24 };
export const DESK_RED: SpriteRect = { x: 85, y: 44, w: 26, h: 17 };
export const DESK_ORANGE: SpriteRect = { x: 115, y: 44, w: 38, h: 17 };

// ── Couches / sofas ───────────────────────────────────────
export const SOFA_GRAY: SpriteRect = { x: 120, y: 70, w: 35, h: 14 };
export const SOFA_BLUE: SpriteRect = { x: 120, y: 85, w: 35, h: 14 };
export const SOFA_GREEN: SpriteRect = { x: 120, y: 100, w: 35, h: 14 };

// ── Wall / decor ──────────────────────────────────────────
export const WHITEBOARD: SpriteRect = { x: 85, y: 70, w: 28, h: 20 };
export const PLANT: SpriteRect = { x: 168, y: 66, w: 14, h: 16 };
export const BULLETIN: SpriteRect = { x: 188, y: 66, w: 22, h: 22 };

// ── Computer ──────────────────────────────────────────────
export const COMPUTER: SpriteRect = { x: 233, y: 106, w: 15, h: 19 };
