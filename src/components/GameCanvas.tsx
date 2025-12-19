import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

type Bubble = { id: string; x: number; y: number; label: string };

export default function GameCanvas({
  width = 900,
  height = 520,
  onSelect
}: {
  width?: number;
  height?: number;
  onSelect: (bubbleId: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    let destroyed = false;

    (async () => {
      if (!hostRef.current) return;

      // Pixi v8: init() + use app.canvas (not app.view)
      const app = new PIXI.Application();
      await app.init({
        width,
        height,
        antialias: true,
        backgroundAlpha: 0,
      });
      if (destroyed) {
        app.destroy(true);
        return;
      }
      appRef.current = app;
      hostRef.current.appendChild(app.canvas);

      const stage = app.stage;

      // Background card
      const bg = new PIXI.Graphics();
      bg.roundRect(0, 0, width, height, 18);
      bg.fill({ color: 0xf5f8ff });
      stage.addChild(bg);

      // Title
      const title = new PIXI.Text({
        text: "Select a Mission",
        style: new PIXI.TextStyle({ fontSize: 22, fill: 0x0b0f19, fontWeight: "800" }),
      });
      title.x = 24;
      title.y = 20;
      stage.addChild(title);

      // Build 8 bubbles on a circle
      const cx = width / 2;
      const cy = height / 2 + 10;
      const R = Math.min(width, height) * 0.32;
      const bubbles: Bubble[] = new Array(8).fill(0).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        return {
          id: `mission_${i + 1}`,
          x: cx + R * Math.cos(a),
          y: cy + R * Math.sin(a),
          label: `Mission ${i + 1}`,
        };
      });

      bubbles.forEach((b) => {
        const g = new PIXI.Graphics();
        const drawIdle = () => {
          g.clear();
          g.circle(b.x, b.y, 52);
          g.fill({ color: 0x2b87ff, alpha: 0.10 });
          g.stroke({ color: 0x2b87ff, width: 2, alpha: 0.35 });
        };
        const drawHover = () => {
          g.clear();
          g.circle(b.x, b.y, 56);
          g.fill({ color: 0x2b87ff, alpha: 0.12 });
          g.stroke({ color: 0x176ff1, width: 3, alpha: 0.7 });
        };
        drawIdle();
        g.eventMode = "static";
        g.cursor = "pointer";
        g.on("pointerover", drawHover);
        g.on("pointerout", drawIdle);
        g.on("pointertap", () => onSelect(b.id));
        stage.addChild(g);

        const label = new PIXI.Text({
          text: b.label,
          style: new PIXI.TextStyle({ fontSize: 13, fill: 0x0b0f19, fontWeight: "700" }),
        });
        label.anchor.set(0.5, 0.5);
        label.x = b.x;
        label.y = b.y;
        stage.addChild(label);
      });
    })();

    return () => {
      destroyed = true;
      if (appRef.current) {
        try {
          appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        } catch {}
        appRef.current = null;
      }
      if (hostRef.current) {
        // remove any canvas left behind
        const canvases = hostRef.current.querySelectorAll("canvas");
        canvases.forEach((c) => c.remove());
      }
    };
  }, [width, height, onSelect]);

  return (
    <div
      ref={hostRef}
      className="relative overflow-hidden rounded-xl2 border border-gray-200 bg-white shadow-soft"
      style={{ width, height }}
    />
  );
}
