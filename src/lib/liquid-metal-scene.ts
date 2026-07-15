interface LiquidMetalSceneOptions {
  canvas: HTMLCanvasElement;
  host: HTMLElement;
  reducedMotion: boolean;
}

export interface LiquidMetalSceneController {
  setSection: (section: number) => void;
  setSectionProgress: (progress: number) => void;
  dispose: () => void;
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const vertexShader = `
  attribute vec2 aPosition;
  varying vec2 vUv;

  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform float uScroll;
  uniform float uSection;
  uniform float uSectionProgress;
  uniform float uIntensity;
  uniform float uRightFocus;
  uniform vec2 uPointer;
  uniform vec2 uResolution;

  float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);

    return mix(
      mix(hash(cell), hash(cell + vec2(1.0, 0.0)), local.x),
      mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), local.x),
      local.y
    );
  }

  float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int octave = 0; octave < LIQUID_OCTAVES; octave++) {
      value += amplitude * noise(point);
      point = point * 2.03 + vec2(11.7, 8.3);
      amplitude *= 0.5;
    }

    return value;
  }

  float lineMask(float value, float center, float width) {
    return 1.0 - smoothstep(width, width * 2.8, abs(value - center));
  }

  float sectionWeight(float target) {
    return 1.0 - smoothstep(0.0, 0.82, abs(uSection - target));
  }

  float segmentDistance(vec2 point, vec2 start, vec2 end) {
    vec2 segment = end - start;
    float amount = clamp(dot(point - start, segment) / dot(segment, segment), 0.0, 1.0);
    return length(point - (start + segment * amount));
  }

  void main() {
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 centered = vUv - 0.5;
    centered.x *= aspect;

    vec2 pointerOffset = uPointer * vec2(0.16, 0.1);
    vec2 flowPoint = centered * vec2(1.58, 1.86) + pointerOffset;

    float firstNoise = fbm(flowPoint * 1.62 + vec2(uTime * 0.055, -uTime * 0.038));
    float secondNoise = fbm(
      flowPoint * 2.45 +
      vec2(-uTime * 0.032, uTime * 0.046) +
      firstNoise * 0.72
    );

    float wave = sin(
      centered.x * 8.5 +
      centered.y * 4.8 +
      firstNoise * 7.2 -
      secondNoise * 3.4 -
      uTime * 0.34
    );
    float ridge = pow(abs(wave), 11.0);
    float softMetal = smoothstep(0.16, 0.86, firstNoise * 0.68 + secondNoise * 0.48);
    float microHighlight = pow(
      max(0.0, sin(secondNoise * 10.0 + centered.y * 9.0 - uTime * 0.22)),
      16.0
    );

    vec3 nearBlack = vec3(0.012, 0.011, 0.009);
    vec3 deepBronze = vec3(0.24, 0.15, 0.045);
    vec3 brandGold = vec3(0.79, 0.58, 0.2);
    vec3 paleGold = vec3(1.0, 0.91, 0.68);

    vec3 color = mix(nearBlack, deepBronze, softMetal * 0.82);
    color = mix(color, brandGold, ridge * 0.72);
    color = mix(color, paleGold, ridge * ridge * 0.42 + microHighlight * 0.2);

    float rightField = smoothstep(1.0 - uRightFocus, 0.94, vUv.x);
    float outerEdge = smoothstep(0.52, 1.0, abs(centered.x) / max(aspect * 0.5, 0.5));
    float edgeFade =
      smoothstep(0.0, 0.13, vUv.y) *
      smoothstep(0.0, 0.13, 1.0 - vUv.y);

    float scrollLine = smoothstep(0.8, 0.995, vUv.x);
    float heroMask = mix(max(rightField, outerEdge * 0.22), scrollLine, uScroll * 0.86);

    float lineDrift = sin(vUv.y * 7.0 + uTime * 0.22) * 0.014;
    float tripleLines =
      lineMask(vUv.x, 0.2 + lineDrift, 0.008) +
      lineMask(vUv.x, 0.5 - lineDrift * 0.7, 0.008) +
      lineMask(vUv.x, 0.8 + lineDrift * 0.5, 0.008);
    tripleLines *= smoothstep(0.02, 0.2, vUv.y) * smoothstep(0.02, 0.2, 1.0 - vUv.y);

    vec2 roiPoint = (vUv - vec2(0.72, 0.5)) * vec2(aspect, 1.0);
    float roiDistance = length(roiPoint);
    float roiWave = pow(max(0.0, sin(roiDistance * 28.0 - uTime * 1.1)), 12.0);
    float roiMask = roiWave * smoothstep(0.72, 0.08, roiDistance);

    float caseTrackA = lineMask(vUv.x - vUv.y * 0.17, 0.16, 0.01);
    float caseTrackB = lineMask(vUv.x + vUv.y * 0.13, 0.82, 0.01);
    float casePulse = pow(max(0.0, sin(vUv.y * 18.0 - uTime * 0.62)), 10.0);
    float caseMask = (caseTrackA + caseTrackB) * (0.42 + casePulse * 0.58);

    float certificateSweepPosition = mod(uTime * 0.08, 2.4) - 0.7;
    float certificateSweep = lineMask(vUv.x + vUv.y * 0.62, certificateSweepPosition, 0.035);
    float certificateMask = certificateSweep + outerEdge * 0.12;

    float processLine = lineMask(vUv.y, 0.6, 0.008);
    float processHead = 1.0 - smoothstep(0.015, 0.08, abs(vUv.x - uSectionProgress));
    float processMask = processLine * (1.0 - smoothstep(
      uSectionProgress - 0.05,
      uSectionProgress + 0.08,
      vUv.x
    ));
    processMask += processHead * lineMask(vUv.y, 0.6, 0.05) * 0.72;

    float faqMask = outerEdge * 0.1 + lineMask(vUv.y, 0.12, 0.004) * 0.08;

    vec2 contactTarget = vec2(0.31, 0.55);
    float contactLineA = 1.0 - smoothstep(0.008, 0.035, segmentDistance(vUv, vec2(0.0, 0.08), contactTarget));
    float contactLineB = 1.0 - smoothstep(0.008, 0.035, segmentDistance(vUv, vec2(1.0, 0.18), contactTarget));
    float contactLineC = 1.0 - smoothstep(0.008, 0.035, segmentDistance(vUv, vec2(0.92, 1.0), contactTarget));
    float contactRing = 1.0 - smoothstep(
      0.008,
      0.035,
      abs(length((vUv - contactTarget) * vec2(aspect, 1.0)) - 0.16)
    );
    float contactMask = contactLineA + contactLineB + contactLineC + contactRing * 0.7;

    float storyMask = heroMask * sectionWeight(0.0);
    storyMask += tripleLines * sectionWeight(1.0) * 0.74;
    storyMask += roiMask * sectionWeight(2.0) * 0.88;
    storyMask += caseMask * sectionWeight(3.0) * 0.68;
    storyMask += certificateMask * sectionWeight(4.0) * 0.54;
    storyMask += tripleLines * sectionWeight(5.0) * 0.72;
    storyMask += processMask * sectionWeight(6.0) * 0.82;
    storyMask += faqMask * sectionWeight(7.0);
    storyMask += contactMask * sectionWeight(8.0) * 0.72;
    storyMask = clamp(storyMask, 0.0, 1.0);

    float scrollFade = mix(1.0, 0.74, sectionWeight(7.0));

    float alpha =
      (0.08 + softMetal * 0.34 + ridge * 0.48 + microHighlight * 0.14) *
      storyMask *
      edgeFade *
      scrollFade *
      uIntensity;

    gl_FragColor = vec4(color, alpha);
  }
`;

interface LiquidUniformLocations {
  time: WebGLUniformLocation | null;
  scroll: WebGLUniformLocation | null;
  section: WebGLUniformLocation | null;
  sectionProgress: WebGLUniformLocation | null;
  intensity: WebGLUniformLocation | null;
  rightFocus: WebGLUniformLocation | null;
  pointer: WebGLUniformLocation | null;
  resolution: WebGLUniformLocation | null;
}

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to create WebGL shader.');

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || 'Unknown shader compilation error.';
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram {
  const vertex = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();

  if (!program) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    throw new Error('Unable to create WebGL program.');
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || 'Unknown WebGL program link error.';
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
}

export function createLiquidMetalScene({
  canvas,
  host,
  reducedMotion,
}: LiquidMetalSceneOptions): LiquidMetalSceneController {
  const isMobile = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const maxPixelRatio = isMobile ? 1.25 : 1.5;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: isMobile ? 'default' : 'high-performance',
  });

  if (!gl) throw new Error('WebGL is not available.');

  const program = createProgram(
    gl,
    vertexShader,
    `#define LIQUID_OCTAVES ${isMobile ? 3 : 5}\n${fragmentShader}`,
  );
  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) {
    gl.deleteProgram(program);
    throw new Error('Unable to create WebGL position buffer.');
  }

  const positionLocation = gl.getAttribLocation(program, 'aPosition');
  if (positionLocation < 0) {
    gl.deleteBuffer(positionBuffer);
    gl.deleteProgram(program);
    throw new Error('Unable to locate WebGL position attribute.');
  }

  const uniformLocations: LiquidUniformLocations = {
    time: gl.getUniformLocation(program, 'uTime'),
    scroll: gl.getUniformLocation(program, 'uScroll'),
    section: gl.getUniformLocation(program, 'uSection'),
    sectionProgress: gl.getUniformLocation(program, 'uSectionProgress'),
    intensity: gl.getUniformLocation(program, 'uIntensity'),
    rightFocus: gl.getUniformLocation(program, 'uRightFocus'),
    pointer: gl.getUniformLocation(program, 'uPointer'),
    resolution: gl.getUniformLocation(program, 'uResolution'),
  };

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const pointer = { x: 0, y: 0 };
  const pointerTarget = { x: 0, y: 0 };
  const resolution = { width: 1, height: 1 };
  const intensity = isMobile ? 0.7 : 0.92;
  const rightFocus = isMobile ? 0.34 : 0.54;
  let elapsedTime = reducedMotion ? 4.2 : 0;
  let scrollProgress = 0;
  let scrollTarget = 0;
  let section = 0;
  let sectionTarget = 0;
  let animationFrame = 0;
  let lastFrameTime = performance.now();
  let isInViewport = true;
  let isDisposed = false;

  function resize() {
    if (isDisposed) return;

    const { width, height } = host.getBoundingClientRect();
    if (width < 1 || height < 1) return;

    const drawingWidth = Math.max(1, Math.round(width * pixelRatio));
    const drawingHeight = Math.max(1, Math.round(height * pixelRatio));

    if (canvas.width !== drawingWidth || canvas.height !== drawingHeight) {
      canvas.width = drawingWidth;
      canvas.height = drawingHeight;
    }

    resolution.width = width;
    resolution.height = height;
    gl.viewport(0, 0, drawingWidth, drawingHeight);
    renderOnce();
  }

  function renderOnce() {
    if (isDisposed || gl.isContextLost()) return;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1f(uniformLocations.time, elapsedTime);
    gl.uniform1f(uniformLocations.scroll, scrollProgress);
    gl.uniform1f(uniformLocations.section, section);
    gl.uniform1f(uniformLocations.sectionProgress, scrollProgress);
    gl.uniform1f(uniformLocations.intensity, intensity);
    gl.uniform1f(uniformLocations.rightFocus, rightFocus);
    gl.uniform2f(uniformLocations.pointer, pointer.x, pointer.y);
    gl.uniform2f(uniformLocations.resolution, resolution.width, resolution.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function shouldAnimate() {
    return !reducedMotion && isInViewport && !document.hidden && !isDisposed;
  }

  function stop() {
    if (!animationFrame) return;
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  function frame(now: number) {
    if (!shouldAnimate()) {
      stop();
      return;
    }

    const deltaSeconds = Math.min((now - lastFrameTime) / 1000, 0.05);
    if (isMobile && now - lastFrameTime < 30) {
      animationFrame = requestAnimationFrame(frame);
      return;
    }
    lastFrameTime = now;

    pointer.x += (pointerTarget.x - pointer.x) * 0.045;
    pointer.y += (pointerTarget.y - pointer.y) * 0.045;
    scrollProgress += (scrollTarget - scrollProgress) * 0.08;
    section += (sectionTarget - section) * 0.065;

    elapsedTime += deltaSeconds;
    renderOnce();
    animationFrame = requestAnimationFrame(frame);
  }

  function start() {
    if (!shouldAnimate() || animationFrame) return;
    lastFrameTime = performance.now();
    animationFrame = requestAnimationFrame(frame);
  }

  function handlePointerMove(event: PointerEvent) {
    if (!hasFinePointer || isMobile) return;

    const bounds = host.getBoundingClientRect();
    pointerTarget.x = clamp(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -1,
      1,
    );
    pointerTarget.y = clamp(
      -(((event.clientY - bounds.top) / bounds.height) * 2 - 1),
      -1,
      1,
    );
  }

  function resetPointer() {
    pointerTarget.x = 0;
    pointerTarget.y = 0;
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      stop();
    } else {
      start();
      renderOnce();
    }
  }

  const resizeObserver =
    'ResizeObserver' in window
      ? new ResizeObserver(resize)
      : null;
  resizeObserver?.observe(host);

  const intersectionObserver =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          ([entry]) => {
            isInViewport = entry?.isIntersecting ?? true;
            if (isInViewport) start();
            else stop();
          },
          { threshold: 0.01 },
        )
      : null;
  intersectionObserver?.observe(host);

  if (!resizeObserver) window.addEventListener('resize', resize);
  if (hasFinePointer && !isMobile) {
    host.addEventListener('pointermove', handlePointerMove);
    host.addEventListener('pointerleave', resetPointer);
  }
  document.addEventListener('visibilitychange', handleVisibilityChange);

  resize();
  if (reducedMotion) renderOnce();
  else start();

  return {
    setSection(nextSection: number) {
      sectionTarget = clamp(nextSection, 0, 8);
      if (reducedMotion) {
        section = sectionTarget;
        renderOnce();
      } else {
        start();
      }
    },
    setSectionProgress(progress: number) {
      scrollTarget = clamp(progress);
      if (reducedMotion) {
        scrollProgress = scrollTarget;
        renderOnce();
      } else {
        start();
      }
    },
    dispose() {
      if (isDisposed) return;
      isDisposed = true;

      stop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('resize', resize);
      host.removeEventListener('pointermove', handlePointerMove);
      host.removeEventListener('pointerleave', resetPointer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    },
  };
}
