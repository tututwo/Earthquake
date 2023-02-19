import { Line } from "@react-three/drei";
export default function Land({landPositions}) {
    return (
        <Line segments points={landPositions} color="#59FF00" lineWidth={.5} />
    );
}
