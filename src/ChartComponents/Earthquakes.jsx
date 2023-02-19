import * as THREE from "three";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

import vertexShader from "../shader/vertexShader.glsl";
import fragmentShader from "../shader/fragmentShader.glsl";
export default function Earthquake({ earthquakeAttributes }) {
  const uniforms = useMemo(
    () => ({
      progress: { value: 0 },
      shakingStrength: { value: 0.1 },
      timeWindow: { value: 0.01 },
      speed: { value: 0.003},
    }),
    []
  );

  const pointsRef = useRef();

  useEffect(() => {
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
    pointsRef.current.geometry.attributes.size.needsUpdate = true;
    pointsRef.current.geometry.attributes.time.needsUpdate = true;
  });

  useFrame(() => {
    const progress = pointsRef.current.material.uniforms.progress.value;
    pointsRef.current.material.uniforms.progress.value =
      progress + uniforms.speed.value;

  });

  return (

    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach={"attributes-position"}
          count={earthquakeAttributes.positions.length / 3}
          array={earthquakeAttributes.positions}
          itemSize={3}
          usage={THREE.DynamicDrawUsage}
        />
        <bufferAttribute
          attach={"attributes-color"}
          count={earthquakeAttributes.colors.length / 3}
          array={earthquakeAttributes.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={earthquakeAttributes.sizes.length}
          array={earthquakeAttributes.sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-time"
          count={earthquakeAttributes.time.length}
          array={earthquakeAttributes.time}
          itemSize={1}
        />
      </bufferGeometry>
      {/* <pointsMaterial size={.2} color={0xff00ff} sizeAttenuation={true} /> */}
      <shaderMaterial
        uniforms={uniforms}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        opacity={0.8}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
