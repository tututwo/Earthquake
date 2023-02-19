import * as THREE from "three";
import * as d3 from "d3";
export function vertexOnSphere([longitude, latitude], radius) {
  const lambda = (longitude * Math.PI) / 180;
  const phi = (latitude * Math.PI) / 180;
  return new THREE.Vector3(
    radius * Math.cos(phi) * Math.cos(lambda),
    radius * Math.sin(phi),
    -radius * Math.cos(phi) * Math.sin(lambda)
  );
}

export function generateAttributes(
  earthquake,
  positions,
  colors,
  sizes,
  time,
  colorScheme,
  radius = 10,
  scaleFactor = 3.6,
  initialColor = new THREE.Color(0xffffff)
) {
  const depthScale = d3
    .scaleLinear()
    .domain(d3.extent(earthquake, (d) => d.depth))
    .range([radius, radius * 0.3]);
  const colorScale = d3
  .scaleSequential(d3[`interpolate${colorScheme}`])
    .domain(d3.extent(earthquake, (d) => d.magnitude));
  const sizeScale = d3
    .scaleSqrt()
    .domain(d3.extent(earthquake, (d) => d.magnitude))
    .range([2, 10]);
  const timeScale = d3
    .scaleLinear()
    .domain(d3.extent(earthquake, (d) => d.date))
    .range([0, 1]);

  earthquake.forEach((d, i) => {
    const earthquakeCoord = vertexOnSphere(
      [d.latitude, d.longitude],
      depthScale(d.depth)
    );
    positions[i * 3] = earthquakeCoord.x;
    positions[i * 3 + 1] = earthquakeCoord.y;
    positions[i * 3 + 2] = earthquakeCoord.z;

    // convert hexcode color into THREE.color
    let color = initialColor.setStyle(colorScale(d.magnitude));
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    sizes[i] = sizeScale(d.magnitude) * scaleFactor;
    time[i] = timeScale(d.date);
  });
  return {
    positions,
    colors,
    sizes,
    time,
  };
}
