/**
 * Scalloped "seal" badge shape built entirely from SVG circles — no image assets needed.
 * A ring of small overlapping circles (bumps) around a central circle, all the same
 * solid fill, creates the wavy/scalloped edge.
 *
 * Used by both the Nominate form (app/page.jsx) and the feed (app/components/Post.jsx),
 * so it lives here as a shared component.
 */
export default function ScallopBadge({ color, size = 96, bumps = 16 }) {
  const cx = size / 2;
  const cy = size / 2;
  const coreRadius = size * 0.34;
  const bumpRadius = size * 0.2;
  const bumpDistance = size * 0.33;

  const circles = Array.from({ length: bumps }, (_, i) => {
    const angle = (2 * Math.PI * i) / bumps;
    const x = cx + bumpDistance * Math.cos(angle);
    const y = cy + bumpDistance * Math.sin(angle);
    return <circle key={i} cx={x} cy={y} r={bumpRadius} fill={color} />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
      <circle cx={cx} cy={cy} r={coreRadius} fill={color} />
      {circles}
    </svg>
  );
}