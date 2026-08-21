import React, { useEffect, useRef } from "react";

/**
 * HeroVisual — WebGL Raymarched Organic Noise Mesh
 * Recreates the ambient background object with mouse interaction,
 * smooth animation, and low GPU overhead.
 */
export default function HeroVisual() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });

    if (!gl) return;

    const VS = `
      attribute vec2 a_pos;
      void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `;

    const FS = `
      precision highp float;
      uniform vec2 u_res;
      uniform float u_time;
      uniform vec2 u_mouse;

      #define MAX_STEPS 60
      #define MAX_DIST 18.0
      #define SURF_DIST 0.003

      vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
      vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
      vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
      float snoise(vec3 v){
        const vec2 C=vec2(1.0/6.0,1.0/3.0);
        const vec4 D=vec4(0.0,0.5,1.0,2.0);
        vec3 i=floor(v+dot(v,C.yyy));
        vec3 x0=v-i+dot(i,C.xxx);
        vec3 g=step(x0.yzx,x0.xyz);
        vec3 l=1.0-g;
        vec3 i1=min(g.xyz,l.zxy);
        vec3 i2=max(g.xyz,l.zxy);
        vec3 x1=x0-i1+C.xxx;
        vec3 x2=x0-i2+C.yyy;
        vec3 x3=x0-D.yyy;
        i=mod289(i);
        vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
        float n_=0.142857142857;
        vec3 ns=n_*D.wyz-D.xzx;
        vec4 j=p-49.0*floor(p*ns.z*ns.z);
        vec4 x_=floor(j*ns.z);
        vec4 y_=floor(j-7.0*x_);
        vec4 x=x_*ns.x+ns.yyyy;
        vec4 y=y_*ns.x+ns.yyyy;
        vec4 h=1.0-abs(x)-abs(y);
        vec4 b0=vec4(x.xy,y.xy);
        vec4 b1=vec4(x.zw,y.zw);
        vec4 s0=floor(b0)*2.0+1.0;
        vec4 s1=floor(b1)*2.0+1.0;
        vec4 sh=-step(h,vec4(0.0));
        vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
        vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
        vec3 p0=vec3(a0.xy,h.x);
        vec3 p1=vec3(a0.zw,h.y);
        vec3 p2=vec3(a1.xy,h.z);
        vec3 p3=vec3(a1.zw,h.w);
        vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
        p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
        vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
        m=m*m;
        return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
      }

      float map(vec3 p, float t) {
        float radius = 1.7;
        float morph = snoise(p * 0.85 + t * 0.12) * 0.22;
        morph += snoise(p * 1.6 - t * 0.06 + 8.0) * 0.09;
        morph += snoise(p * 3.2 + t * 0.03) * 0.03;
        return length(p) - radius + morph;
      }

      vec3 calcNormal(vec3 p, float t) {
        vec2 e = vec2(0.003, 0.0);
        return normalize(vec3(
          map(p+e.xyy, t) - map(p-e.xyy, t),
          map(p+e.yxy, t) - map(p-e.yxy, t),
          map(p+e.yyx, t) - map(p-e.yyx, t)
        ));
      }

      vec3 envLighting(vec3 rd, vec2 mouse) {
        vec3 col = vec3(0.03, 0.03, 0.03);
        vec3 keyDir = normalize(vec3(0.5 + mouse.x, 1.0 + mouse.y * 0.5, 1.2));
        float key = pow(max(dot(rd, keyDir), 0.0), 10.0);
        col += vec3(0.92, 0.92, 0.95) * key * 1.4;

        vec3 rimDir = normalize(vec3(-0.8, -0.2, -1.0));
        float rim = pow(max(dot(rd, rimDir), 0.0), 5.0);
        col += vec3(0.4, 0.45, 0.5) * rim * 0.7;

        vec3 fillDir = normalize(vec3(-1.0, 0.5, 0.5));
        float fill = pow(max(dot(rd, fillDir), 0.0), 3.0);
        col += vec3(0.25, 0.25, 0.25) * fill * 0.5;

        return col;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_res * 0.5) / min(u_res.x, u_res.y);
        float t = u_time * 0.75;
        vec2 m = u_mouse * 0.15;

        float wanderX = sin(t * 0.12) * 1.5 + cos(t * 0.06) * 0.8;
        float wanderY = cos(t * 0.1) * 1.2 + sin(t * 0.08) * 0.8;

        vec3 ro = vec3(wanderX, wanderY, 5.2);
        vec3 lookAt = vec3(m.x + wanderX, m.y + wanderY, 0.0);

        vec3 fwd = normalize(lookAt - ro);
        vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
        vec3 up = cross(fwd, right);
        vec3 rd = normalize(fwd + uv.x * right + uv.y * up);

        vec3 bgCol = mix(vec3(0.03), vec3(0.06), length(uv) * 0.6);
        vec3 col = bgCol;

        float d = 0.0;
        for(int i=0; i<MAX_STEPS; i++) {
          vec3 p = ro + rd * d;
          float ds = map(p, t);
          d += ds;
          if(d > MAX_DIST || abs(ds) < SURF_DIST) break;
        }

        if(d < MAX_DIST) {
          vec3 p = ro + rd * d;
          vec3 n = calcNormal(p, t);
          vec3 ref = reflect(rd, n);

          float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 4.0);
          fresnel = mix(0.35, 1.0, fresnel);

          vec3 env = envLighting(ref, u_mouse);
          col = env * fresnel * 1.7;

          vec3 lightPos = normalize(vec3(0.5 + u_mouse.x, 1.0, 1.0));
          float spec = pow(max(dot(ref, lightPos), 0.0), 50.0);
          col += vec3(0.95, 0.95, 1.0) * spec * 1.8;
        }

        float bloom = exp(-length(uv) * 2.2);
        col += vec3(0.025, 0.025, 0.03) * bloom;

        col = col / (col + 0.55);
        col = pow(col, vec3(1.0/2.2));

        gl_FragColor = vec4(col, 0.95);
      }
    `;

    function createShader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
      return s;
    }

    const vs = createShader(gl.VERTEX_SHADER, VS);
    const fs = createShader(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const aPos = gl.getAttribLocation(prog, "a_pos");
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    let mouseTarget = { x: 0, y: 0 };
    let mouseCurrent = { x: 0, y: 0 };

    const handleMouseMove = (e) => {
      mouseTarget.x = (e.clientX / window.innerWidth) * 2.0 - 1.0;
      mouseTarget.y = -((e.clientY / window.innerHeight) * 2.0 - 1.0);
    };

    window.addEventListener("mousemove", handleMouseMove);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const handleResize = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth || window.innerWidth;
      const h = canvas.parentElement.clientHeight || window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    let animId;
    let startTime = performance.now();

    const render = (now) => {
      if (prefersReducedMotion) return;

      const elapsed = (now - startTime) * 0.001;

      mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.05;
      mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.05;

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uMouse, mouseCurrent.x, mouseCurrent.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animId = requestAnimationFrame(render);
    };

    if (!prefersReducedMotion) {
      animId = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none"
      style={{
        WebkitMaskImage:
          "radial-gradient(circle closest-side, black 50%, transparent 100%)",
        maskImage:
          "radial-gradient(circle closest-side, black 50%, transparent 100%)",
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full block opacity-75" />
    </div>
  );
}
