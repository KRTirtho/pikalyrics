import type { NextPage } from "next";
import {
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftAddon,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LyricInput } from "components/LyricInput";
import YouTube from "react-youtube";
import { useRef, useState } from "react";
import {
  BsFillPauseCircleFill,
  BsFillPlayCircleFill,
} from "react-icons/bs";
import { useHotkeys } from "react-hotkeys-hook";
import getYouTubeID from "get-youtube-id";

const playbackRate = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const Home: NextPage = () => {
  const [isEditing, setIsEditing] = useState(true);
  const [urlValue, setUrlValue] = useState("");


  const videoId = getYouTubeID(urlValue);

  const youtubeRef = useRef<YouTube>(null);

  const togglePlayback = () => {
    isEditing
      ? youtubeRef.current?.internalPlayer.playVideo()
      : youtubeRef.current?.internalPlayer.pauseVideo();
  };

  useHotkeys("space", togglePlayback, [isEditing]);

  return (
    <HStack p="5" align="start">
      <VStack align="start">
        <InputGroup>
          <InputLeftAddon>URL</InputLeftAddon>
          <Input
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value.trim())}
            type="url"
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          />
        </InputGroup>
        <HStack>
          {videoId && (
            <YouTube
              videoId={videoId}
              opts={{
                width: "350",
                height: "180",
              }}
              onPlay={() => setIsEditing(false)}
              onPause={() => setIsEditing(true)}
              onEnd={() => setIsEditing(true)}
              ref={youtubeRef}
            />
          )}

          <IconButton
            fontSize="45"
            aria-label="Play/Pause"
            size="lg"
            variant="ghost"
            color="gray.700"
            onClick={togglePlayback}
          >
            {isEditing ? <BsFillPlayCircleFill /> : <BsFillPauseCircleFill />}
          </IconButton>
        </HStack>
        <HStack>
          <Text>Speed</Text>
          <Slider
            colorScheme="twitter"
            w="xs"
            min={0.25}
            max={2}
            step={0.25}
            defaultValue={1}
            onChangeEnd={async (e) => {
              youtubeRef.current?.internalPlayer.setPlaybackRate(e);
            }}
          >
            {playbackRate.map((rate) => (
              <SliderMark mt="2" key={rate} value={rate} fontSize="sm">
                {rate}x
              </SliderMark>
            ))}
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </HStack>
      </VStack>
      <LyricInput
        isEditing={isEditing}
        youtubeRef={youtubeRef}
        youtubeId={videoId}
      />
    </HStack>
  );
};

export default Home;
