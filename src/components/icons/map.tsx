interface Props {
  size?: string | number;
}

export default function MapIcon({ size = 16 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.52274 14.7053L4.93087 12.1134C3.0976 10.2802 0 11.5761 0 14.168V17.55H15.0455V7.18256L7.52274 14.7053Z"
        fill="#B4B2FF"
      />
      <path
        d="M7.52274 3.29474L10.1146 5.88661C11.9479 7.71988 15.0455 6.42395 15.0455 3.83208V0.450012H0V10.8175L7.52274 3.29474Z"
        fill="#B4B2FF"
      />
    </svg>
  );
}
