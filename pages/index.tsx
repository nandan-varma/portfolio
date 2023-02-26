import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import Link from 'next/link'
import {Parallax,ParallaxLayer} from '@react-spring/parallax'
import cloud1 from '../public/BW.jpg'

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
        <ParallaxLayer
        speed={1}><div className='name'>
          <h1 className='intro'>
            Under Construction by
          </h1>
          <h1 className='reveal-text'>
            Nandan Varma
          </h1>
          <Link className='contact' href="mailto:nandanvarma@icloud.com">Contact Me</Link>
        </div></ParallaxLayer>
        <ParallaxLayer offset={1}
        factor={2}
        style={{
          backgroundImage: `url(${cloud1})`,
          backgroundSize: 'cover',
        }}></ParallaxLayer>
        <ParallaxLayer></ParallaxLayer>
        
      </main>
    </>
  )
}
