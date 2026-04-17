import { useEffect, useRef } from 'react';
import anime from '../../../lib/animejs';

type QueryExecutionMotionProps = {
  loading: boolean;
};

export default function QueryExecutionMotion({ loading }: QueryExecutionMotionProps) {
  const pulseRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pulseRef.current || !loading) return;

    const instance = anime({
      targets: pulseRef.current,
      opacity: [0.25, 1],
      scale: [0.96, 1.02],
      duration: 850,
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true,
    });

    return () => instance.pause();
  }, [loading]);

  return (
    <div
      ref={pulseRef}
      className="h-24 w-full rounded-xl border border-slate-200 bg-slate-100"
      aria-hidden="true"
    />
  );
}
