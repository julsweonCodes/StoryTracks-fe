interface Props {
  size?: number | string;
}

export default function GallerySendIcon({ size = 25 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.5 12C22.5 16.714 22.5 19.0711 21.0355 20.5355C19.5711 22 17.214 22 12.5 22C7.78595 22 5.42893 22 3.96447 20.5355C2.5 19.0711 2.5 16.714 2.5 12C2.5 7.28595 2.5 4.92893 3.96447 3.46447C5.42893 2 7.78595 2 12.5 2"
        stroke="#7A7A7A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M2.5 12.4999L4.25159 10.9673C5.16286 10.1699 6.53628 10.2156 7.39249 11.0719L11.6822 15.3616C12.3694 16.0488 13.4512 16.1425 14.2464 15.5837L14.5446 15.3741C15.6888 14.57 17.2369 14.6631 18.2765 15.5987L21.5 18.4999"
        stroke="#7A7A7A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M17.5 2V11M17.5 2L20.5 5M17.5 2L14.5 5"
        stroke="#7A7A7A"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
