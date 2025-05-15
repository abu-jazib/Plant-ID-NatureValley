import type { SVGProps } from 'react';

export function LeafIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11 20A7 7 0 0 1 4 13V7a7 7 0 0 1 14 0v6a7 7 0 0 1-7 7z" />
      <path d="M12 20A7 7 0 0 0 12 6v14z" />
      <path d="M4 13a4 4 0 0 0 4 4h4" />
    </svg>
  );
}
