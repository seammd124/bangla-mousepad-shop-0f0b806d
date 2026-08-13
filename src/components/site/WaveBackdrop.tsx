/** Decorative premium wave layers used behind the hero copy. Monochrome, token-driven. */
export function WaveBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <svg
        className="wave-layer wave-layer-slow absolute inset-x-0 top-1/4 h-[60%] w-[200%] text-foreground/[0.06]"
        viewBox="0 0 2880 320"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 160C240 60 480 60 720 160s480 100 720 0 480-100 720 0 480 100 720 0v320H0Z"
        />
      </svg>
      <svg
        className="wave-layer absolute inset-x-0 top-1/3 h-[55%] w-[200%] text-foreground/[0.1]"
        viewBox="0 0 2880 320"
        preserveAspectRatio="none"
      >
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          d="M0 200C240 110 480 110 720 200s480 90 720 0 480-90 720 0 480 90 720 0"
        />
      </svg>
      <svg
        className="wave-layer absolute inset-x-0 bottom-0 h-[40%] w-[200%] text-foreground/[0.05]"
        viewBox="0 0 2880 320"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 220C360 300 720 140 1440 220s1080 80 1440 0v100H0Z"
        />
      </svg>
    </div>
  );
}
