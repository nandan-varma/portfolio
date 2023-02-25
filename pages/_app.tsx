import type { AppProps } from 'next/app'
import '../public/index.css'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
