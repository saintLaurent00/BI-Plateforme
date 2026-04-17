type AnimeTarget = HTMLElement | SVGElement | null;

type AnimeParams = {
  targets: AnimeTarget;
  opacity?: [number, number] | number;
  scale?: [number, number] | number;
  duration?: number;
  easing?: string;
  direction?: 'normal' | 'alternate';
  loop?: boolean;
};

type AnimeInstance = {
  pause: () => void;
};

function resolveValue(value: [number, number] | number): number {
  return Array.isArray(value) ? value[1] : value;
}

export default function anime(params: AnimeParams): AnimeInstance {
  const target = params.targets;
  if (!target) {
    return { pause: () => undefined };
  }

  const duration = params.duration ?? 600;
  target.style.transition = `all ${duration}ms ease`;

  if (params.opacity !== undefined) {
    target.style.opacity = String(resolveValue(params.opacity));
  }

  if (params.scale !== undefined) {
    target.style.transform = `scale(${resolveValue(params.scale)})`;
  }

  let interval: number | undefined;

  if (params.loop && params.direction === 'alternate' && params.opacity && Array.isArray(params.opacity)) {
    const [low, high] = params.opacity;
    let highState = false;
    interval = window.setInterval(() => {
      target.style.opacity = String(highState ? low : high);
      highState = !highState;
    }, duration);
  }

  return {
    pause: () => {
      if (interval) window.clearInterval(interval);
    },
  };
}
