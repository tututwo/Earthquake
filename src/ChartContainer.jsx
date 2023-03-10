import { useEffect, useMemo, useState, useRef, useLayoutEffect } from "react";
import { Effects, Text, OrbitControls } from "@react-three/drei";

import { EffectComposer, Glitch, Bloom } from "@react-three/postprocessing";
import { GlitchMode } from "postprocessing";

import * as THREE from "three";
import * as d3 from "d3";
import { gsap } from "gsap";
import { generateAttributes, vertexOnSphere } from "./utility/utils";

import Land from "./ChartComponents/Land";
import Earthquakes from "./ChartComponents/Earthquakes";
import { useFrame } from "@react-three/fiber";

const currentTimestampFormat = d3.utcFormat("%H:%M %b.%e, %Y");
// initial value for position
const vertex_Num = 5000;
const filledArray = [...Array(vertex_Num)].map(() => {
  return {
    latitude: -1,
    longitude: -1,
    date: -1,
    magnitude: -1,
    time: 1,
  };
});

const positions = Float32Array.from({ length: vertex_Num * 3 }, () => 1);
const landPositions = Float32Array.from({ length: vertex_Num * 3 }, () => 1);
const colors = Float32Array.from({ length: vertex_Num * 3 }, () => 1);
const sizes = Float32Array.from({ length: vertex_Num }, () => 1);
const time = Float32Array.from({ length: vertex_Num }, () => 1);

const radius = 10;
//* color schemes
let colorSchemes = [
  "BuGn",
  "BuPu",
  "GnBu",
  "OrRd",
  "PuBuGn",
  "PuBu",
  "PuRd",
  "RdPu",
  "YlGnBu",
  "YlGn",
  "YlOrBr",
  "YlOrRd",
  "Cividis",
  "Viridis",
  "Inferno",
  "Magma",
  "Plasma",
  "Warm",
  "Cool",
  "CubehelixDefault",
  "Turbo",
];
export default function ChartContainer() {
  /* * * * * * * * * * * *
   * * Load Data * *
   *  * * * * * * * * * * */
  const [earthquake, setEarthquake] = useState(filledArray);
  const [landLines, setLandLines] = useState([
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 1, 0),
  ]);

  const [toBeFilteredEarthquake, setToBeFilteredEarthquake] =
    useState(filledArray);
  useEffect(() => {
    async function fetchData() {
      let promises = [d3.csv("/earthquakes.csv"), d3.json("/topoland.json")];
      const [EQData, LandData] = await Promise.all(promises);

      setEarthquake(
        EQData.map((d) => ({
          latitude: +d.latitude,
          longitude: +d.longitude,
          date: new Date(d.date),
          magnitude: +d.magnitude,
          depth: +d.depth,
        }))
      );
      setToBeFilteredEarthquake(
        EQData.map((d) => ({
          latitude: +d.latitude,
          longitude: +d.longitude,
          date: new Date(d.date),
          magnitude: +d.magnitude,
          depth: +d.depth,
        }))
      );
      const tempPosition = [];
      LandData.coordinates.forEach((landSection) => {
        //* for each land section
        for (
          let firstPoint = new THREE.Vector3(0, 0, 0),
            secondPoint = vertexOnSphere(landSection[0], radius),
            i = 1;
          i < landSection.length;
          ++i
        ) {
          firstPoint = secondPoint;
          secondPoint = vertexOnSphere(landSection[i], radius);
          tempPosition.push(firstPoint, secondPoint);
          // landPositions[i * 6] = firstPoint.x;
          // landPositions[i * 6 + 1] = firstPoint.y;
          // landPositions[i * 6 + 2] = firstPoint.z;
          // landPositions[i * 6 + 3] = secondPoint.x;
          // landPositions[i * 6 + 4] = secondPoint.y;
          // landPositions[i * 6 + 5] = secondPoint.z;
        }
      });
      setLandLines(tempPosition);
    }

    fetchData();
  }, []);
  /* * * * * * * * * * * *
   * * Convert Data into Scaled buffer data/typed array * *
   *  * * * * * * * * * * */

  let sliceValue = useRef();

  const earthquakeAttributes = useMemo(() => {
    return generateAttributes(
      earthquake,
      positions,
      colors,
      sizes,
      time,
      colorSchemes[16]
    );
  }, [earthquake, sliceValue.current]);

  const timeScale = d3
    .scaleLinear()
    .domain(d3.extent(earthquake, (d) => d.date))
    .range([0, 1]);

  const groupRef = useRef();
  useFrame((state, delta) => {
    groupRef.current.rotation.y += delta / 10;
  });

  // filter time < utc secs: earthquake.filter( d.time < 1494374400000)
  // animate this "time"
  useLayoutEffect(() => {
    sliceValue.current = 1494374400000;
    let context = gsap.context(() => {
      gsap.to(sliceValue, {
        current: 1588291200000,
        duration: 100,
        onUpdate: () => {
          setEarthquake(
            toBeFilteredEarthquake.filter((d) => +d.date <= sliceValue.current)
          );
        },
      });
    });
    return () => context.revert();
  }, [toBeFilteredEarthquake]);

  // console.log(earthquake)
  return (
    <>
      <OrbitControls makeDefault />
      <EffectComposer>
        <Glitch
          delay={[2.5, 5]}
          duration={[0.1, 0.3]}
          strength={[0.4, 0.8]}
          mode={GlitchMode.SPORADIC}
          columns={0.001}
        />
        <Bloom mipmapBlur intensity={2.0} luminanceThreshold={0.2} />
      </EffectComposer>
      {/* <Text>{currentTimestampFormat(sliceValue.current)}</Text> */}
      <group ref={groupRef} scale={.4}>
        {/* <Land landPositions={landLines} /> */}
        <Earthquakes
          earthquakeAttributes={earthquakeAttributes}
          timeScale={timeScale}
        />
      </group>
    </>
  );
}
