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
                translateX={['5vh', '0vh']}
                scale={[0.7,1.3]}
                >
                    <Tilt>
                <div href="" className="project name">
                    <p>{proj.name}</p>
                </div>
                </Tilt>
                </Parallax>
            )
        }
        </>
    )
}