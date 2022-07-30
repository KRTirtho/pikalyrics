import { chakra, Heading, IconButton, Portal, Text } from "@chakra-ui/react";
import { usePrevious } from "hooks/usePrevious";
import { useYtProgress } from "hooks/useYtProgress";
import React, { FC, useEffect, useMemo, useRef } from "react";
import { IoCloseCircle as IoClose } from "react-icons/io5";
import YouTube from "react-youtube";
import { Timestamps } from "./LyricInput";

interface Props {
  youtubeId: string;
  timestamps: Timestamps[];
  onClose: () => void;
}

const ViewSyncedLyrics: FC<Props> = ({ youtubeId, timestamps, onClose }) => {
  const ref = useRef<YouTube>(null);

  const [progress] = useYtProgress(ref);
  const prevProgress = usePrevious(progress);
  const timestampsMap = useMemo(() => {
    return timestamps.reduce<Record<string, string>>((acc, val) => {
      acc[val.time] = val.subtitle;
      return acc;
    }, {});
  }, [timestamps]);

  return (
    <Portal>
      <chakra.div
        h="100vh"
        w="100vw"
        position="absolute"
        top="0"
        left="0"
        background="black"
        zIndex="1"
      >
        <IconButton
          position="absolute"
          right="6"
          top="6"
          aria-label="close lyric preview"
          icon={<IoClose />}
          fontSize="3xl"
          color="red.400"
          variant="outline"
          colorScheme="red"
          bg="white"
          borderWidth="2px"
          onClick={onClose}
          borderRadius="full"
          zIndex={1}
        />
        <Heading
          pos="absolute"
          bottom="20"
          left="50%"
          transform="translateX(-50%)"
          zIndex="2"
          color="white"
          bg="gray.800"
          px="5"
          py="2"
          borderRadius="lg"
        >
          {timestampsMap[progress] ?? timestampsMap[prevProgress ?? "0"]}
        </Heading>
        <YouTube
          videoId={youtubeId}
          ref={ref}
          style={{
            width: "100%",
            height: "100vh",
            overflow: "hidden",
            position: "relative",
          }}
          iframeClassName="yt-iframe"
        />
      </chakra.div>
    </Portal>
  );
};

export default ViewSyncedLyrics;
