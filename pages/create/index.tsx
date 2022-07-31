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
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import { LyricInput } from "components/LyricInput";
import YouTube from "react-youtube";
import { useRef, useState } from "react";
import { BsFillPauseCircleFill, BsFillPlayCircleFill } from "react-icons/bs";
import { useHotkeys } from "react-hotkeys-hook";
import getYouTubeID from "get-youtube-id";

const playbackRate = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const LyricsPublisher: NextPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [urlValue, setUrlValue] = useState("");

  const videoId = getYouTubeID(urlValue);

  const youtubeRef = useRef<YouTube>(null);

  const togglePlayback = () => {
    !isPlaying
      ? youtubeRef.current?.internalPlayer.playVideo()
      : youtubeRef.current?.internalPlayer.pauseVideo();
  };

  const [mainArtist, setMainArtist] = useState("");
  const [artists, setArtists] = useState<string[]>([]);

  console.log(youtubeRef.current?.internalPlayer);
  const seekBy = async (pos: number) => {
    await youtubeRef.current?.internalPlayer.seekTo(
      (await youtubeRef.current?.internalPlayer.getCurrentTime()) + pos
    );
  };
  useHotkeys("space", togglePlayback, [isPlaying]);
  useHotkeys("right", () => {
    seekBy(5);
  });
  useHotkeys("left", () => {
    seekBy(-5);
  });

  return (
    <HStack p="5" align="start">
      <VStack align="start" maxW="33%">
        <VStack spacing="0" align="start">
          <Text fontSize="sm" fontWeight="bold" color="twitter.500">
            Main Artist
          </Text>
          <Input
            variant="flushed"
            placeholder="e.g Bucky Kentucky"
            value={mainArtist}
            onChange={(e) => setMainArtist(e.target.value)}
            isRequired
            required
          />
        </VStack>
        <Text fontSize="sm" fontWeight="bold" color="twitter.500">
          Associated Artists
        </Text>
        <Wrap align="center">
          {artists.map((artist, i) => (
            <Tag key={artist + i} colorScheme="twitter" borderRadius="full">
              <TagLabel>{artist}</TagLabel>
              <TagCloseButton
                onClick={() => {
                  setArtists(artists.filter((a) => a != artist));
                }}
              />
            </Tag>
          ))}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const values = Object.fromEntries(data.entries());
              if ((values.artist.valueOf() as string).length > 0) {
                setArtists([...artists, values.artist.valueOf() as string]);
                (e.target as any).reset();
              }
            }}
          >
            <Input
              name="artist"
              placeholder="e.g Twenty One Pilots"
              variant="flushed"
              type="text"
            />
          </form>
        </Wrap>
        <InputGroup pt="2">
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
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnd={() => setIsPlaying(false)}
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
            {!isPlaying ? <BsFillPlayCircleFill /> : <BsFillPauseCircleFill />}
          </IconButton>
        </HStack>
        <HStack pb="5">
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
        isEditing={!isPlaying}
        youtubeRef={youtubeRef}
        youtubeId={videoId}
        mainArtist={mainArtist}
        artists={artists}
      />
    </HStack>
  );
};

export default LyricsPublisher;
