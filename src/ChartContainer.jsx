import { useEffect, useMemo, useState } from "react";
import { OrbitControls } from "@react-three/drei";

import { EffectComposer, Glitch } from "@react-three/postprocessing";

import * as d3 from "d3";

import { generateAttributes } from "./utility/utils";

// import Land from "./ChartComponents/Land"
import Earthquakes from "./ChartComponents/Earthquakes";
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
  const [land, setLand] = useState([]);
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
      setLand(LandData);
    }

    fetchData();
  }, []);
  /* * * * * * * * * * * *
   * * Convert Data into Scaled buffer data/typed array * *
   *  * * * * * * * * * * */
  const firstRender = useMemo(() => "first render", []);

  const earthquakeAttributes = useMemo(() => {
    return generateAttributes(
      earthquake,
      positions,
      colors,
      sizes,
      time,
      colorSchemes[16]
    );
  }, [earthquake, firstRender]);

  return (
    <>
      <OrbitControls makeDefault />
      <EffectComposer>
        <Glitch
          delay={[0.5, 1]}
          duration={[0.1, 0.3]}
          strength={[0.2, 0.4]}
          mode={GlitchMode.CONSTANT_MILD}
        />
      </EffectComposer>

      {/* <Land land={land} /> */}
      <Earthquakes earthquakeAttributes={earthquakeAttributes} />
    </>
  );
}
