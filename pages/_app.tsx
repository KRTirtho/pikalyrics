// pages/_app.js
import { ChakraProvider } from '@chakra-ui/react'
import { Navbar } from 'components/Navbar';
import type { AppProps} from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Navbar/>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp