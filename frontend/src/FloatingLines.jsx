import { useEffect, useRef } from "react";
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  ShaderMaterial,
  PlaneGeometry,
  Mesh,
  Vector2,
  Vector3
} from "three";
import "./FloatingLines.css";

const vertexShader = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec2 iMouse;

uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;

uniform float intensity;
uniform float speed;

float wave(vec2 uv, float offset) {
    float y = sin(uv.x * 3.0 + iTime * speed + offset) * 0.25;
    float dist = abs(uv.y - y);
    return 0.015 / (dist + 0.01);
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    vec2 mouse = (iMouse.xy / iResolution.xy) * 2.0 - 1.0;

    float mouseInfluence = length(uv - mouse);
    float glow = exp(-mouseInfluence * 4.0);

    vec3 col = vec3(0.0);

    col += color1 * wave(uv, 0.0);
    col += color2 * wave(uv, 1.5);
    col += color3 * wave(uv, 3.0);

    col += glow * 0.25;

    col *= intensity;

    gl_FragColor = vec4(col, 1.0);
}
`;

export default function FloatingLines() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new Scene();

    const camera = new OrthographicCamera(
      -1,
      1,
      1,
      -1,
      0.1,
      10
    );
    camera.position.z = 1;

    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    container.appendChild(renderer.domElement);

    const uniforms = {
      iTime: { value: 0 },
      iResolution: {
        value: new Vector3(
          container.clientWidth,
          container.clientHeight,
          1
        )
      },
      iMouse: {
        value: new Vector2(0, 0)
      },

      color1: {
        value: new Vector3(0.54, 0.36, 0.96)
      },
      color2: {
        value: new Vector3(0.02, 0.71, 0.83)
      },
      color3: {
        value: new Vector3(0.75, 0.52, 0.99)
      },

      intensity: { value: 1.4 },
      speed: { value: 1.2 }
    };

    const material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader
    });

    const geometry = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geometry, material);

    scene.add(mesh);

    const handleMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();

      uniforms.iMouse.value.set(
        e.clientX - rect.left,
        rect.height - (e.clientY - rect.top)
      );
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      renderer.setSize(width, height);

      uniforms.iResolution.value.set(
        width,
        height,
        1
      );
    };

    window.addEventListener("resize", handleResize);

    let animationId;

    const animate = (time) => {
      uniforms.iTime.value = time * 0.001;

      renderer.render(scene, camera);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);

      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="floating-lines-container"
    />
  );
}