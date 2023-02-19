import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'

import ChartContainer from "./ChartContainer"

const root = ReactDOM.createRoot(document.querySelector('#root'))

root.render(
    <Canvas
        camera={ {
            fov: 45,
            near: 0.1,
            far: 200,
            position: [ - 4, 3, 6 ]
        } }
    >
        <ChartContainer />
    </Canvas>
)