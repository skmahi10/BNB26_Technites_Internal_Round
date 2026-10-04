import type { SVGProps } from 'react';

export type IconName =
  | 'home' | 'cube' | 'shield' | 'tree' | 'file' | 'flask' | 'arrows' | 'clock' | 'activity'
  | 'search' | 'chevron' | 'arrow' | 'hash' | 'check' | 'alert' | 'info' | 'database' | 'bell' | 'plus' | 'download' | 'upload' | 'image' | 'video' | 'document'
  | 'box' | 'git' | 'layers' | 'refresh' | 'external' | 'filter' | 'spark' | 'calendar'
  | 'empty' | 'warning' | 'network' | 'list' | 'close' | 'arrowUp' | 'arrowDown' | 'dots';

const paths: Record<IconName, React.ReactNode> = {
  home: <><path d="m3 10 9-7 9 7"/><path d="M5 9.5V21h14V9.5M9 21v-7h6v7"/></>,
  cube: <><path d="m12 3 8 4.4v9.2L12 21l-8-4.4V7.4L12 3Z"/><path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v8.5"/></>,
  shield: <><path d="M12 3 19 6v5.2c0 4.6-2.9 7.7-7 9.5-4.1-1.8-7-4.9-7-9.5V6l7-3Z"/><path d="m8.7 12.1 2.2 2.2 4.5-4.7"/></>,
  tree: <><path d="M12 21V9"/><path d="M12 13.5c-3.6 0-6-2-6-5.2 3.6 0 6 2 6 5.2ZM12 10c0-3.8 2.3-6.3 6-6.3 0 3.8-2.4 6.3-6 6.3Z"/><path d="M8 21h8"/></>,
  file: <><path d="M5 4h9l5 5v11H5V4Z"/><path d="M14 4v5h5M8 13h8M8 16.5h6"/></>,
  flask: <><path d="M9 3h6M10 3v6l-5.5 9.2A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.8L14 9V3"/><path d="M8 15h8"/></>,
  arrows: <><path d="M4 7h13M13 3l4 4-4 4M20 17H7m4-4-4 4 4 4"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>,
  activity: <><path d="M3 12h4l2.2-6 4.1 12 2.2-6H21"/></>,
  search: <><circle cx="10.7" cy="10.7" r="6.5"/><path d="m15.6 15.6 4.4 4.4"/></>,
  chevron: <path d="m9 5 7 7-7 7"/>,
  arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  hash: <><path d="M5 9h14M4 15h14M10 4 8 20m8-16-2 16"/></>,
  check: <path d="m5 12.5 4.2 4.1L19 7"/>,
  alert: <><path d="m12 3 9 17H3L12 3Z"/><path d="M12 9v5M12 17h.01"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
  database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v13c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11.5c0 1.7 3.6 3 8 3s8-1.3 8-3"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  download: <><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 17v4h14v-4"/></>,
  upload: <><path d="M12 16V4m-5 5 5-5 5 5"/><path d="M5 17v4h14v-4"/></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 20"/></>,
  video: <><rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3"/></>,
  document: <><path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h7M9 16h7"/></>,
  box: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v8.5"/></>,
  git: <><circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><circle cx="6" cy="19" r="2"/><path d="M6 7v10M18 17v-2a4 4 0 0 0-4-4H9a3 3 0 0 1-3-3"/></>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9a7 7 0 0 1 11.5-2L20 12M4 12l2.9 5a7 7 0 0 0 11.5-2"/></>,
  external: <><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></>,
  filter: <><path d="M4 6h16M7 12h10m-7 6h4"/></>,
  spark: <><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z"/><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z"/></>,
  calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M7.5 3v4M16.5 3v4M4 9.5h16"/></>,
  empty: <><path d="M5 4h14v16H5z"/><path d="M8 9h8M8 12.5h8M8 16h5"/></>,
  warning: <><path d="m12 3 9 17H3L12 3Z"/><path d="M12 9v5M12 17h.01"/></>,
  network: <><circle cx="6" cy="5.5" r="2.2"/><circle cx="18" cy="12" r="2.2"/><circle cx="6" cy="18.5" r="2.2"/><path d="M8 6.5 15.8 11M8 17.4l7.9-4.2"/></>,
  list: <><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".75" fill="currentColor"/><circle cx="4.5" cy="12" r=".75" fill="currentColor"/><circle cx="4.5" cy="18" r=".75" fill="currentColor"/></>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  arrowUp: <path d="m7 14 5-5 5 5"/>,
  arrowDown: <path d="m7 10 5 5 5-5"/>,
  dots: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
};

export function Icon({ name, size = 16, ...props }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
