import Head from 'next/head'
import Image from 'next/image'
import Button from 'react'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import Link from 'next/link'
// import { Parallax } from 'react-parallax';
import { Parallax } from 'react-scroll-parallax'
import cloud1 from '../public/BW.jpg'
import NavBar from '../components/navbar'
const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>Nandan Varma</title>
        <meta name="description" content="Portfolio of Nandan Varma" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {/* <Navigation></Navigation> */}
        <Parallax
          translateX={['-200px', '200px']}
          scale={[0.75, 1]}
          rotate={[-90,90 ]}
          >
          <NavBar></NavBar>
          <div className='name'>
            <h1 className='intro'>
              Under Construction by
            </h1>
            <h1 className='reveal-text'>
              Nandan Varma
            </h1>
            <button className='contact' onClick={() => window.open("mailto:nandanvarma@icloud.com", '_blank')}>Contact Me</button>
          </div>
        </Parallax>
        <div style={{height:'100vh'}}></div>
        <div style={{height:'100vh'}}></div>

      </main>
    </>
  )
}
