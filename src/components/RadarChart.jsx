import { useLanguage } from '../context/Contexts';
import { t } from '../i18n/translations';

const categories = ['sport', 'education', 'earning', 'selfKnowledge', 'creativity'];

export default function RadarChart({ data, size = 280 }) {
  const { language } = useLanguage();
  const padding = 50;
  const center = size / 2 + padding;
  const radius = size / 2 - 30;
  const levels = 4;
  const viewBoxSize = size + padding * 2;

  const getPoint = (index, value) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const polygonPoints = data.map((value, i) => {
    const point = getPoint(i, value);
    return `${point.x},${point.y}`;
  }).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
      {Array.from({ length: levels }).map((_, level) => {
        const r = ((level + 1) / levels) * radius;
        const points = Array.from({ length: 5 }).map((_, i) => {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
        }).join(' ');
        return (
          <polygon
            key={level}
            points={points}
            fill="none"
            stroke="rgba(100, 116, 139, 0.35)"
            strokeWidth="1"
          />
        );
      })}

      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const x2 = center + radius * Math.cos(angle);
        const y2 = center + radius * Math.sin(angle);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x2}
            y2={y2}
            stroke="rgba(100, 116, 139, 0.35)"
            strokeWidth="1"
          />
        );
      })}

      <polygon
        points={polygonPoints}
        fill="url(#radarGradient)"
        stroke="url(#strokeGradient)"
        strokeWidth="2"
      />

      {data.map((value, i) => {
        const point = getPoint(i, value);
        const labelAngle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const labelR = radius + 30;
        const labelX = center + labelR * Math.cos(labelAngle);
        const labelY = center + labelR * Math.sin(labelAngle);

        return (
          <g key={i}>
            <circle cx={point.x} cy={point.y} r="4" fill="#06b6d4" />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#06b6d4"
              fontSize="12"
              fontWeight="600"
            >
              {t(`common.${categories[i]}`, language)}
            </text>
          </g>
        );
      })}

      <defs>
        <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}
