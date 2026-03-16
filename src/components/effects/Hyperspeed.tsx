"use client";

import { useEffect, useRef } from "react";
import "./Hyperspeed.css";
import * as THREE from "three";
import { EffectComposer, RenderPass, EffectPass, BloomEffect } from "postprocessing";

/* ───────────────────────── distortion functions ───────────────────────── */

const mountainUniforms = {
  uFreq: new THREE.Uniform(new THREE.Vector3(3, 6, 10)),
  uAmp: new THREE.Uniform(new THREE.Vector3(30, 30, 20)),
};

const mountainDistortion = {
  uniforms: mountainUniforms,
  getDistortion: `
    uniform vec3 uFreq;
    uniform vec3 uAmp;
    #define PI 3.14159265358979
    float nsin(float val){
      return sin(val) * 0.5+0.5;
    }
    vec3 getDistortion(float progress){
      float movementProgressFix = 0.02;
      return vec3(
        cos(progress * PI * uFreq.x + uTime) * uAmp.x - cos(movementProgressFix * PI * uFreq.x + uTime) * uAmp.x,
        nsin(progress * PI * uFreq.y + uTime) * uAmp.y - nsin(movementProgressFix * PI * uFreq.y + uTime) * uAmp.y,
        nsin(progress * PI * uFreq.z + uTime) * uAmp.z - nsin(movementProgressFix * PI * uFreq.z + uTime) * uAmp.z
      );
    }
  `,
  getJS: (progress: number, time: number) => {
    const uFreq = mountainUniforms.uFreq.value;
    const uAmp = mountainUniforms.uAmp.value;
    const movementProgressFix = 0.02;
    const nsin = (val: number) => Math.sin(val) * 0.5 + 0.5;
    const x =
      Math.cos(progress * Math.PI * uFreq.x + time) * uAmp.x -
      Math.cos(movementProgressFix * Math.PI * uFreq.x + time) * uAmp.x;
    const y =
      nsin(progress * Math.PI * uFreq.y + time) * uAmp.y -
      nsin(movementProgressFix * Math.PI * uFreq.y + time) * uAmp.y;
    const z =
      nsin(progress * Math.PI * uFreq.z + time) * uAmp.z -
      nsin(movementProgressFix * Math.PI * uFreq.z + time) * uAmp.z;
    return new THREE.Vector3(x, y, z);
  },
};

const distortions: Record<string, typeof mountainDistortion> = {
  mountainDistortion,
};

/* ───────────────────────── types ───────────────────────── */

interface EffectOptions {
  distortion: string;
  length: number;
  roadWidth: number;
  islandWidth: number;
  lanesPerRoad: number;
  fov: number;
  fovSpeedUp: number;
  speedUp: number;
  carLightsFade: number;
  totalSideLightSticks: number;
  lightPairsPerRoadWay: number;
  shoulderLinesWidthPercentage: number;
  brokenLinesWidthPercentage: number;
  brokenLinesLengthPercentage: number;
  lightStickWidth: [number, number];
  lightStickHeight: [number, number];
  movingAwaySpeed: [number, number];
  movingCloserSpeed: [number, number];
  carLightsLength: [number, number];
  carLightsRadius: [number, number];
  carWidthPercentage: [number, number];
  carShiftX: [number, number];
  carFloorSeparation: [number, number];
  colors: {
    roadColor: number;
    islandColor: number;
    background: number;
    shoulderLines: number;
    brokenLines: number;
    leftCars: number[];
    rightCars: number[];
    sticks: number;
  };
}

/* ───────────────────────── helpers ───────────────────────── */

function lerp(current: number, target: number, speed = 0.1, limit = 0.001) {
  let change = (target - current) * speed;
  if (Math.abs(change) < limit) {
    change = target - current;
  }
  return change;
}

function random(base: number, range?: number) {
  if (typeof range === "undefined") {
    range = base;
    base = 0;
  }
  return base + Math.random() * range;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ───────────────────────── Road class ───────────────────────── */

class Road {
  webgl: App;
  options: EffectOptions;
  uTime: THREE.Uniform;
  leftRoadWay: RoadWay;
  rightRoadWay: RoadWay;
  island: Island;
  leftCarLights: [CarLights, CarLights];
  rightCarLights: [CarLights, CarLights];
  leftSticks: LightsSticks;
  rightSticks: LightsSticks;

  constructor(webgl: App, options: EffectOptions) {
    this.webgl = webgl;
    this.options = options;
    this.uTime = new THREE.Uniform(0);

    this.leftRoadWay = new RoadWay(
      webgl,
      options,
      -1,
      this.uTime
    );
    this.rightRoadWay = new RoadWay(
      webgl,
      options,
      1,
      this.uTime
    );
    this.island = new Island(webgl, options, this.uTime);

    const leftCarLightsA = new CarLights(webgl, options, this.uTime, options.colors.leftCars, -60, -1);
    const leftCarLightsB = new CarLights(webgl, options, this.uTime, options.colors.leftCars, -120, -1);
    this.leftCarLights = [leftCarLightsA, leftCarLightsB];

    const rightCarLightsA = new CarLights(webgl, options, this.uTime, options.colors.rightCars, 60, 1);
    const rightCarLightsB = new CarLights(webgl, options, this.uTime, options.colors.rightCars, 120, 1);
    this.rightCarLights = [rightCarLightsA, rightCarLightsB];

    this.leftSticks = new LightsSticks(webgl, options, this.uTime);
    this.rightSticks = new LightsSticks(webgl, options, this.uTime);
  }

  init() {
    this.leftRoadWay.init();
    this.rightRoadWay.init();
    this.island.init();
    this.leftCarLights[0].init();
    this.leftCarLights[1].init();
    this.rightCarLights[0].init();
    this.rightCarLights[1].init();
    this.leftSticks.init();
    this.rightSticks.init();
  }

  update(t: number) {
    this.uTime.value = t;

    const [lA, lB] = this.leftCarLights;
    const [rA, rB] = this.rightCarLights;
    lA.update(t);
    lB.update(t);
    rA.update(t);
    rB.update(t);
    this.leftSticks.update(t);
    this.rightSticks.update(t);
  }
}

/* ───────────────────────── RoadWay ───────────────────────── */

class RoadWay {
  webgl: App;
  options: EffectOptions;
  side: number;
  uTime: THREE.Uniform;

  constructor(webgl: App, options: EffectOptions, side: number, uTime: THREE.Uniform) {
    this.webgl = webgl;
    this.options = options;
    this.side = side;
    this.uTime = uTime;
  }

  init() {
    const options = this.options;
    const d = distortions[options.distortion] || mountainDistortion;

    const segments = 100;
    const geo = new THREE.PlaneGeometry(
      options.islandWidth + options.lanesPerRoad * options.roadWidth * 2 + options.shoulderLinesWidthPercentage * options.roadWidth * 2,
      options.length,
      20,
      segments
    );

    const mat = new THREE.ShaderMaterial({
      fragmentShader: roadFragment,
      vertexShader: patchedShader(roadVertex),
      side: THREE.DoubleSide,
      uniforms: Object.assign(
        {
          uTravelLength: new THREE.Uniform(options.length),
          uColor: new THREE.Uniform(new THREE.Color(options.colors.roadColor)),
          uTime: this.uTime,
        },
        d.uniforms
      ),
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.z = -options.length / 2;
    this.webgl.scene.add(mesh);

    /* shoulder lines */
    const shoulderGeo = new THREE.PlaneGeometry(
      options.shoulderLinesWidthPercentage * options.roadWidth,
      options.length,
      20,
      segments
    );

    const shoulderMat = new THREE.ShaderMaterial({
      fragmentShader: roadFragment,
      vertexShader: patchedShader(roadVertex),
      side: THREE.DoubleSide,
      uniforms: Object.assign(
        {
          uTravelLength: new THREE.Uniform(options.length),
          uColor: new THREE.Uniform(new THREE.Color(options.colors.shoulderLines)),
          uTime: this.uTime,
        },
        d.uniforms
      ),
    });

    const lShoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
    lShoulder.rotation.x = -Math.PI / 2;
    lShoulder.position.x =
      this.side *
      (options.islandWidth / 2 +
        options.lanesPerRoad * options.roadWidth +
        options.shoulderLinesWidthPercentage * options.roadWidth * 0.5);
    lShoulder.position.z = -options.length / 2;
    lShoulder.position.y = 0.005;
    this.webgl.scene.add(lShoulder);

    /* broken lane lines */
    for (let i = 0; i < options.lanesPerRoad - 1; i++) {
      const laneGeo = new THREE.PlaneGeometry(
        options.brokenLinesWidthPercentage * options.roadWidth,
        options.length,
        20,
        segments
      );
      const laneMat = new THREE.ShaderMaterial({
        fragmentShader: brokenFragment,
        vertexShader: patchedShader(roadVertex),
        side: THREE.DoubleSide,
        uniforms: Object.assign(
          {
            uTravelLength: new THREE.Uniform(options.length),
            uColor: new THREE.Uniform(new THREE.Color(options.colors.brokenLines)),
            uTime: this.uTime,
            uDashSize: new THREE.Uniform(options.brokenLinesLengthPercentage),
          },
          d.uniforms
        ),
      });
      const laneMesh = new THREE.Mesh(laneGeo, laneMat);
      laneMesh.rotation.x = -Math.PI / 2;
      laneMesh.position.x =
        this.side *
        (options.islandWidth / 2 +
          (i + 1) * options.roadWidth);
      laneMesh.position.z = -options.length / 2;
      laneMesh.position.y = 0.005;
      this.webgl.scene.add(laneMesh);
    }
  }
}

/* ───────────────────────── Island ───────────────────────── */

class Island {
  webgl: App;
  options: EffectOptions;
  uTime: THREE.Uniform;

  constructor(webgl: App, options: EffectOptions, uTime: THREE.Uniform) {
    this.webgl = webgl;
    this.options = options;
    this.uTime = uTime;
  }

  init() {
    const options = this.options;
    const d = distortions[options.distortion] || mountainDistortion;
    const segments = 100;
    const geo = new THREE.PlaneGeometry(options.islandWidth, options.length, 20, segments);
    const mat = new THREE.ShaderMaterial({
      fragmentShader: islandFragment,
      vertexShader: patchedShader(roadVertex),
      side: THREE.DoubleSide,
      uniforms: Object.assign(
        {
          uTravelLength: new THREE.Uniform(options.length),
          uColor: new THREE.Uniform(new THREE.Color(options.colors.islandColor)),
          uTime: this.uTime,
        },
        d.uniforms
      ),
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.z = -options.length / 2;
    mesh.position.y = 0.01;
    this.webgl.scene.add(mesh);
  }
}

/* ───────────────────────── CarLights ───────────────────────── */

class CarLights {
  webgl: App;
  options: EffectOptions;
  uTime: THREE.Uniform;
  colors: number[];
  speed: number;
  side: number;
  mesh!: THREE.Mesh;

  constructor(
    webgl: App,
    options: EffectOptions,
    uTime: THREE.Uniform,
    colors: number[],
    speed: number,
    side: number
  ) {
    this.webgl = webgl;
    this.options = options;
    this.uTime = uTime;
    this.colors = colors;
    this.speed = speed;
    this.side = side;
  }

  init() {
    const options = this.options;
    const d = distortions[options.distortion] || mountainDistortion;
    const nPairs = options.lightPairsPerRoadWay;

    const curve = new THREE.LineCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1)
    );
    const geo = new THREE.TubeGeometry(curve, 40, 1, 8, false);

    const instGeo = new THREE.InstancedBufferGeometry();
    instGeo.index = geo.index;
    instGeo.attributes = geo.attributes;

    const aOffset = new Float32Array(nPairs * 2);
    const aMetrics = new Float32Array(nPairs * 4);
    const aColor = new Float32Array(nPairs * 3);

    for (let i = 0; i < nPairs; i++) {
      const r = random(options.carWidthPercentage[0], options.carWidthPercentage[1] - options.carWidthPercentage[0]);
      const lane = i % options.lanesPerRoad;
      const laneX =
        this.side *
        (options.islandWidth / 2 +
          (lane + 0.5) * options.roadWidth +
          random(options.carShiftX[0], options.carShiftX[1] - options.carShiftX[0]));

      aOffset[i * 2] = laneX;
      aOffset[i * 2 + 1] = random(options.carFloorSeparation[0], options.carFloorSeparation[1] - options.carFloorSeparation[0]);

      const length = random(options.carLightsLength[0], options.carLightsLength[1] - options.carLightsLength[0]);
      const radius = random(options.carLightsRadius[0], options.carLightsRadius[1] - options.carLightsRadius[0]);

      const speed =
        this.speed < 0
          ? random(options.movingCloserSpeed[0], options.movingCloserSpeed[1] - options.movingCloserSpeed[0])
          : random(options.movingAwaySpeed[0], options.movingAwaySpeed[1] - options.movingAwaySpeed[0]);

      aMetrics[i * 4] = length;
      aMetrics[i * 4 + 1] = radius;
      aMetrics[i * 4 + 2] = r;
      aMetrics[i * 4 + 3] = speed;

      const c = new THREE.Color(pickRandom(this.colors));
      aColor[i * 3] = c.r;
      aColor[i * 3 + 1] = c.g;
      aColor[i * 3 + 2] = c.b;
    }

    instGeo.setAttribute("aOffset", new THREE.InstancedBufferAttribute(aOffset, 2, false));
    instGeo.setAttribute("aMetrics", new THREE.InstancedBufferAttribute(aMetrics, 4, false));
    instGeo.setAttribute("aColor", new THREE.InstancedBufferAttribute(aColor, 3, false));

    const mat = new THREE.ShaderMaterial({
      fragmentShader: carLightsFragment,
      vertexShader: patchedShader(carLightsVertex),
      transparent: true,
      uniforms: Object.assign(
        {
          uTravelLength: new THREE.Uniform(options.length),
          uTime: this.uTime,
          uSpeed: new THREE.Uniform(this.speed),
          uFade: new THREE.Uniform(options.carLightsFade),
        },
        d.uniforms
      ),
    });
    const mesh = new THREE.Mesh(instGeo, mat);
    mesh.frustumCulled = false;
    this.webgl.scene.add(mesh);
    this.mesh = mesh;
  }

  update(_t: number) {
    // animation is handled in the shader via uTime
  }
}

/* ───────────────────────── LightsSticks ───────────────────────── */

class LightsSticks {
  webgl: App;
  options: EffectOptions;
  uTime: THREE.Uniform;
  mesh!: THREE.Mesh;

  constructor(webgl: App, options: EffectOptions, uTime: THREE.Uniform) {
    this.webgl = webgl;
    this.options = options;
    this.uTime = uTime;
  }

  init() {
    const options = this.options;
    const d = distortions[options.distortion] || mountainDistortion;
    const nSticks = options.totalSideLightSticks;

    const geo = new THREE.PlaneGeometry(1, 1);
    const instGeo = new THREE.InstancedBufferGeometry();
    instGeo.index = geo.index;
    instGeo.attributes = geo.attributes;

    const aOffset = new Float32Array(nSticks * 2);
    const aColor = new Float32Array(nSticks * 3);
    const aMetrics = new Float32Array(nSticks * 2);

    const stickColor = new THREE.Color(options.colors.sticks);

    for (let i = 0; i < nSticks; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const offset =
        side *
        (options.islandWidth / 2 +
          options.lanesPerRoad * options.roadWidth +
          options.shoulderLinesWidthPercentage * options.roadWidth +
          0.3);
      aOffset[i * 2] = offset;
      const z = random(0, options.length);
      aOffset[i * 2 + 1] = z;

      aColor[i * 3] = stickColor.r;
      aColor[i * 3 + 1] = stickColor.g;
      aColor[i * 3 + 2] = stickColor.b;

      const w = random(options.lightStickWidth[0], options.lightStickWidth[1] - options.lightStickWidth[0]);
      const h = random(options.lightStickHeight[0], options.lightStickHeight[1] - options.lightStickHeight[0]);
      aMetrics[i * 2] = w;
      aMetrics[i * 2 + 1] = h;
    }

    instGeo.setAttribute("aOffset", new THREE.InstancedBufferAttribute(aOffset, 2, false));
    instGeo.setAttribute("aColor", new THREE.InstancedBufferAttribute(aColor, 3, false));
    instGeo.setAttribute("aMetrics", new THREE.InstancedBufferAttribute(aMetrics, 2, false));

    const mat = new THREE.ShaderMaterial({
      fragmentShader: lightsStickFragment,
      vertexShader: patchedShader(lightsStickVertex),
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: Object.assign(
        {
          uTravelLength: new THREE.Uniform(options.length),
          uTime: this.uTime,
        },
        d.uniforms
      ),
    });

    const mesh = new THREE.Mesh(instGeo, mat);
    mesh.frustumCulled = false;
    this.webgl.scene.add(mesh);
    this.mesh = mesh;
  }

  update(_t: number) {}
}

/* ───────────────────────── GLSL Shaders ───────────────────────── */

const roadVertex = `
uniform float uTime;
uniform float uTravelLength;

#include <getDistortion_vertex>

void main(){
  vec3 transformed = position.xyz;
  float progress = clamp(transformed.y / uTravelLength, 0.0, 1.0);
  vec3 dist = getDistortion(progress);
  transformed.x += dist.x;
  transformed.z += dist.y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const roadFragment = `
uniform vec3 uColor;
void main(){
  gl_FragColor = vec4(uColor, 1.0);
}
`;

const islandFragment = `
uniform vec3 uColor;
void main(){
  gl_FragColor = vec4(uColor, 1.0);
}
`;

const brokenFragment = `
uniform vec3 uColor;
uniform float uDashSize;
varying vec2 vUv;
void main(){
  float dashFraction = fract(vUv.y * 100.0);
  if(dashFraction > uDashSize) discard;
  gl_FragColor = vec4(uColor, 1.0);
}
`;

const carLightsVertex = `
attribute vec2 aOffset;
attribute vec4 aMetrics;
attribute vec3 aColor;

uniform float uTravelLength;
uniform float uTime;
uniform float uSpeed;
uniform float uFade;

varying vec3 vColor;
varying float vFade;

#include <getDistortion_vertex>

void main(){
  vec3 transformed = position.xyz;

  float roadLength = uTravelLength;
  float carLength = aMetrics.x;
  float radius = aMetrics.y;
  float width = aMetrics.z;
  float speed = aMetrics.w;

  transformed.xy *= vec2(radius, carLength);
  transformed.x += aOffset.x;
  transformed.y += aOffset.y;

  float zOffset = mod(uTime * speed, roadLength);
  transformed.z = transformed.z + zOffset;

  float progress = clamp(transformed.z / roadLength, 0.0, 1.0);
  vec3 dist = getDistortion(progress);
  transformed.x += dist.x;
  transformed.y += dist.y;
  transformed.z -= dist.z;

  float fadeStart = 0.0;
  float fadeEnd = uFade;
  vFade = smoothstep(fadeStart, fadeEnd, progress);

  vColor = aColor;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const carLightsFragment = `
varying vec3 vColor;
varying float vFade;
void main(){
  vec3 c = vColor;
  gl_FragColor = vec4(c, vFade);
}
`;

const lightsStickVertex = `
attribute vec2 aOffset;
attribute vec3 aColor;
attribute vec2 aMetrics;

uniform float uTravelLength;
uniform float uTime;

varying vec3 vColor;

#include <getDistortion_vertex>

void main(){
  vec3 transformed = position.xyz;
  float w = aMetrics.x;
  float h = aMetrics.y;
  transformed.xy *= vec2(w, h);

  float z = aOffset.y;
  transformed.x += aOffset.x;
  transformed.y += h / 2.0;

  float progress = clamp(z / uTravelLength, 0.0, 1.0);
  vec3 dist = getDistortion(progress);
  transformed.x += dist.x;
  transformed.y += dist.y;
  transformed.z += -z + dist.z;

  vColor = aColor;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const lightsStickFragment = `
varying vec3 vColor;
void main(){
  gl_FragColor = vec4(vColor, 1.0);
}
`;

// Global shader patcher — set during init, used by material constructors
let patchShaderFn: ((s: string) => string) | null = null;
function patchedShader(s: string): string {
  return patchShaderFn ? patchShaderFn(s) : s;
}

/* ───────────────────────── App (Three.js orchestrator) ───────────────────────── */

class App {
  container: HTMLElement;
  options: EffectOptions;
  renderer!: THREE.WebGLRenderer;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  composer!: EffectComposer;
  road!: Road;
  clock!: THREE.Clock;
  disposed: boolean = false;
  fovTarget: number;
  speedUpTarget: number;
  speedUp: number;
  timeOffset: number;
  animId: number = 0;

  constructor(container: HTMLElement, options: EffectOptions) {
    this.container = container;
    this.options = options;
    this.fovTarget = options.fov;
    this.speedUpTarget = 0;
    this.speedUp = 0;
    this.timeOffset = 0;
  }

  init() {
    const options = this.options;
    const d = distortions[options.distortion] || mountainDistortion;

    // Pre-patch all shader strings to replace the include with actual distortion code
    const distortionGLSL = d.getDistortion;
    const patch = (s: string) => s.replace(/#include <getDistortion_vertex>/g, distortionGLSL);
    patchShaderFn = patch;

    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(options.colors.background);

    this.camera = new THREE.PerspectiveCamera(
      options.fov,
      this.container.offsetWidth / this.container.offsetHeight,
      0.1,
      10000
    );
    this.camera.position.set(0, 8, -5);
    this.camera.lookAt(new THREE.Vector3(0, 4, 0));

    this.road = new Road(this, options);
    this.road.init();

    patchShaderFn = null;

    /* post processing */
    const bloom = new BloomEffect({
      luminanceThreshold: 0.2,
      luminanceSmoothing: 0.0,
      intensity: 1.2,
    } as never);

    const renderPass = new RenderPass(this.scene, this.camera);
    const effectPass = new EffectPass(this.camera, bloom);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderPass);
    this.composer.addPass(effectPass);

    this.clock = new THREE.Clock();

    window.addEventListener("resize", this.onResize);
    this.onResize();
    this.update();
  }

  update = () => {
    if (this.disposed) return;
    this.animId = requestAnimationFrame(this.update);

    const delta = this.clock.getDelta();
    this.speedUp += lerp(this.speedUp, this.speedUpTarget, 0.1, 0.00001);
    this.timeOffset += this.speedUp * delta;

    const elapsed = this.clock.elapsedTime + this.timeOffset;
    this.road.update(elapsed);

    const fovChange = lerp(this.camera.fov, this.fovTarget, 0.1);
    if (fovChange !== 0) {
      this.camera.fov += fovChange * delta * 6;
      this.camera.updateProjectionMatrix();
    }

    this.composer.render(delta);
  };

  onResize = () => {
    if (this.disposed) return;
    const w = this.container.offsetWidth;
    const h = this.container.offsetHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.animId);
    window.removeEventListener("resize", this.onResize);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

/* ───────────────────────── React Component ───────────────────────── */

interface HyperspeedProps {
  effectOptions?: Partial<EffectOptions>;
}

const defaultOptions: EffectOptions = {
  distortion: "mountainDistortion",
  length: 400,
  roadWidth: 9,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 50,
  lightPairsPerRoadWay: 50,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [400 * 0.05, 400 * 0.15],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.2, 0.2],
  carFloorSeparation: [0.05, 1],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0x131318,
    brokenLines: 0x131318,
    leftCars: [0xff102a, 0xeb383e, 0xff102a],
    rightCars: [0xdadafa, 0xbebae3, 0x8f97e4],
    sticks: 0xdadafa,
  },
};

export default function Hyperspeed({ effectOptions }: HyperspeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const mergedOptions: EffectOptions = {
      ...defaultOptions,
      ...effectOptions,
      colors: {
        ...defaultOptions.colors,
        ...effectOptions?.colors,
      },
    };

    const app = new App(containerRef.current, mergedOptions);
    app.init();

    return () => {
      app.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div id="lights" ref={containerRef} />;
}
