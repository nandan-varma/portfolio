import { Parallax } from "react-scroll-parallax";
import Tilt from 'react-parallax-tilt'
import Link from "next/link";
let projectList = [
    {name : "Project 1"},
    {name : "Project 2"},
    {name : "Project 3"},
    {name : "Project 4"},
    {name : "Project 5"},
]

function isEven(n) {
    return n % 2 == 0;
 }

export default function Projects(){
    return (
        <>
        {
            projectList.map((proj,i) =>
                <Parallax
                translateY={['30vh','-30vh']}
                translateX={['0vh', '0vh']}
                scale={[0.6,1.4]}
                easing="easeInQuad"
                >
                    <Tilt>
                <div href="" className="project">
                    <p>{proj.name}</p>
                </div>
                </Tilt>
                </Parallax>
            )
        }
        </>
    )
}