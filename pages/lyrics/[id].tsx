import React from "react";

import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { prisma } from "configurations";
import { Lyrics, User } from "@prisma/client";
import { Button, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import Head from "next/head";

dayjs.extend(duration);

interface Props {
  lyrics: (Lyrics & { uploader: User }) | null;
}

export const getStaticPaths: GetStaticPaths = async (ctx) => {
  const lyrics = await prisma.lyrics.findMany({
    select: { id: true, title: true },
  }); // your fetch function here

  return {
    paths: lyrics.map(({ id, title }) => ({
      params: { id: `${title}-${id}` },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async (ctx) => {
  const sl = (ctx.params!.id as string).split("-");
  const lyrics = await prisma.lyrics.findUnique({
    where: { id: sl[sl.length - 1] },
    include: { uploader: true },
  });

  return {
    props: {
      lyrics,
    },
  };
};

const IndividualLyrics: NextPage<Props> = ({ lyrics }) => {
  return (
    <VStack align="start" px="5" py="2">
      <Head>
        <title>Pika Lyrics - {lyrics?.title}</title>
      </Head>
      <Heading size="md">{lyrics?.title}</Heading>
      <Heading size="sm">Owner: {lyrics?.owner}</Heading>
      <Heading size="sm">{lyrics?.authors.join(", ")}</Heading>
      <Heading size="sm">Publisher: {lyrics?.uploader.name}</Heading>

      {Object.entries(lyrics?.syncedLyrics ?? {}).map(([time, line], i) => {
        return (
          <Text key={line + i}>
            [{dayjs.duration(parseInt(time), "seconds").format("ss:mm")}] {line}
          </Text>
        );
      })}
      <HStack justify="center" w="full">
        <Button
          colorScheme="whatsapp"
          onClick={() => {
            const element = document.createElement("a");
            const file = new Blob(
              [Object.values(lyrics?.syncedLyrics ?? {}).join("\n")],
              {
                type: "text/plain",
              }
            );
            element.href = URL.createObjectURL(file);
            element.download = `${lyrics?.title}-lyrics.txt`;
            document.body.appendChild(element); // Required for this to work in FireFox
            element.click();
          }}
        >
          Download Lyrics
        </Button>
        <Button
          colorScheme="whatsapp"
          onClick={() => {
            const element = document.createElement("a");
            const file = new Blob(
              [
                Object.entries(lyrics?.syncedLyrics ?? {})
                  .map(
                    ([time, line]) =>
                      `[${dayjs
                        .duration(parseInt(time), "seconds")
                        .format("ss:mm")}.00]${line}`
                  )
                  .join("\n"),
              ],
              {
                type: "text/plain",
              }
            );
            element.href = URL.createObjectURL(file);
            element.download = `${lyrics?.title}.lrc`;
            document.body.appendChild(element); // Required for this to work in FireFox
            element.click();
          }}
        >
          Download Synced Lyrics
        </Button>
      </HStack>
    </VStack>
  );
};

export default IndividualLyrics;
