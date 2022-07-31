import "styles/globals.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Navbar } from "components/Navbar";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";

const theme = extendTheme({
  components: {
    Button: {
      baseStyle: {
        borderRadius: "full",
      },
    },
  },
});
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <ChakraProvider theme={theme}>
        <Head>
          <title>Pika Lyrics</title>
        </Head>
        <Navbar />
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  );
}

export default MyApp;
