import Head from 'next/head'
import { Inter } from 'next/font/google'
// import { Parallax } from 'react-parallax';
import { Parallax } from 'react-scroll-parallax'
import Tilt from 'react-parallax-tilt'
import Projects from '../components/projects'
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
        {/* <NavBar></NavBar> */}
        <Tilt>
          <div className='name'>
            <h1 className='reveal-text'>
              Nandan Varma
            </h1>
            {/* <button className='contact' onClick={() => window.open("mailto:nandanvarma@icloud.com", '_blank')}>Contact Me</button> */}
          </div>
        </Tilt>
        <Projects></Projects>
      </main>
    </>
  )
}
