import React from "react";

export default function Board({ target, guess }) {
  // Draw a half-circle using SVG
  return (
    <svg width="400" height="220">
      <path
        d="M 20 200 A 180 180 0 0 1 380 200"
        fill="none"
        stroke="#888"
        strokeWidth="8"
      />
      {target !== null && (
        <line
          x1={200}
          y1={200}
          x2={200 + 180 * Math.cos((Math.PI * (target - 90)) / 180)}
          y2={200 + 180 * Math.sin((Math.PI * (target - 90)) / 180)}
          stroke="red"
          strokeWidth="4"
        />
      )}
      {guess !== null && (
        <line
          x1={200}
          y1={200}
          x2={200 + 180 * Math.cos((Math.PI * (guess - 90)) / 180)}
          y2={200 + 180 * Math.sin((Math.PI * (guess - 90)) / 180)}
          stroke="blue"
          strokeWidth="4"
        />
      )}
    </svg>
  );
}