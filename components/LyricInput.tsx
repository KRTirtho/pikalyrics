import {
  Button,
  ButtonGroup,
  chakra,
  Checkbox,
  Editable,
  EditableInput,
  EditablePreview,
  Heading,
  HStack,
  IconButton,
  Text,
  Textarea,
  Tooltip,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useProgressScroll } from "hooks/useProgressScroll";
import { useYtProgress } from "hooks/useYtProgress";
import { FC, RefObject, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { AiTwotoneEdit, AiTwotoneEye } from "react-icons/ai";
import { BsFullscreen } from "react-icons/bs";
import TextAreaAutoSize from "react-textarea-autosize";
import YouTube from "react-youtube";
import { KeyTooltip } from "./KeyTooltip";
import ViewSyncedLyrics from "./ViewSyncedLyrics";

dayjs.extend(duration);

const durationRegex = /\d{2}:\d{2}/g;

interface Props {
  isEditing: boolean;
  youtubeRef: RefObject<YouTube>;
  youtubeId: string | null;
  mainArtist: string;
  artists: string[];
}

export interface Timestamps {
  subtitle: string;
  time: number;
  index: number;
}

export const LyricInput: FC<Props> = ({
  isEditing: isPlaying,
  youtubeRef,
  youtubeId,
  artists,
  mainArtist,
}) => {
  const [lyrics, setLyrics] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [timestamps, setTimestamps] = useState<Timestamps[]>([]);

  // progress in seconds

  const [isEditing, setIsEditing] = useState(true);

  const [progress] = useYtProgress(youtubeRef);

  const [duration, setDuration] = useState(0);

  useEffect(() => {
    (async () => {
      const newDuration =
        await youtubeRef.current?.internalPlayer.getDuration();
      if (newDuration != duration) setDuration(newDuration);
    })();
  }, [isEditing, youtubeRef, duration]);

  const [startTime, setStartTime] = useState(0);
  const [isAutoScroll, setIsAutoScroll] = useState(false);

  const scrollRef = useProgressScroll<HTMLDivElement>(
    timestamps.length > 0 ? ((progress - startTime) * duration) / 100 : 0,
    isAutoScroll
  );

  useHotkeys("x", () => {
    setIsAutoScroll((prev) => !prev);
  });

  useHotkeys("p", () => {
    setIsEditing((prev) => !prev);
  });

  return (
    <>
      {isOpen && youtubeId && (
        <ViewSyncedLyrics
          youtubeId={youtubeId}
          timestamps={timestamps}
          onClose={onClose}
        />
      )}
      <chakra.div pt="5" w="full">
        <HStack pb="2">
          <ButtonGroup isAttached size="sm">
            <KeyTooltip keyboardKey="p" label="Text Editing Mode">
              <IconButton
                variant={!isEditing ? "outline" : undefined}
                colorScheme={isEditing ? "twitter" : undefined}
                aria-label="Edit"
                onClick={() => setIsEditing(true)}
              >
                <AiTwotoneEdit />
              </IconButton>
            </KeyTooltip>
            <KeyTooltip label="Sync/Time Editing Mode" keyboardKey="p">
              <IconButton
                variant={isEditing ? "outline" : undefined}
                colorScheme={!isEditing ? "twitter" : undefined}
                aria-label="Edit"
                onClick={() => setIsEditing(false)}
              >
                <AiTwotoneEye />
              </IconButton>
            </KeyTooltip>
          </ButtonGroup>
          <Heading size="md">Mode: {isEditing ? "Editing" : "Preview"}</Heading>
          <KeyTooltip
            keyboardKey="x"
            label="Automatically scroll"
            shouldWrapChildren
          >
            <Checkbox
              colorScheme="twitter"
              isChecked={isAutoScroll}
              onChange={(e) => setIsAutoScroll(e.target.checked)}
            >
              Auto Scroll
            </Checkbox>
          </KeyTooltip>
          <Tooltip label="Show Result in Fullscreen" shouldWrapChildren>
            <IconButton
              aria-label="View in Fullscreen"
              icon={<BsFullscreen />}
              size="sm"
              variant="outline"
              onClick={onOpen}
              disabled={!youtubeId || timestamps.length === 0}
            />
          </Tooltip>
          <Button
            borderRadius="full"
            onClick={() => {
              setTimestamps([]);
              youtubeRef.current?.internalPlayer.seekTo(0);
              youtubeRef.current?.internalPlayer.playVideo();
            }}
          >
            Reset
          </Button>
          <Button
            colorScheme="green"
            borderRadius="full"
            disabled={timestamps.length !== lyrics.split("\n").length}
            type="submit"
            onClick={async () => {
              if (!youtubeId || mainArtist.length === 0) return;
              const iframe: HTMLIFrameElement =
                await youtubeRef.current?.internalPlayer.getIframe();

              const headers = new Headers();
              headers.set("content-type", "application/json");
              const res = await fetch("/api/publish", {
                method: "POST",
                headers,
                body: JSON.stringify({
                  owner: mainArtist,
                  title: iframe.title,
                  youtubeId,
                  authors: artists,
                  syncedLyrics: timestamps.reduce<Record<string, string>>(
                    (acc, val) => {
                      acc[val.time.toString()] = val.subtitle;
                      return acc;
                    },
                    {}
                  ),
                } as Prisma.LyricsCreateWithoutUploaderInput),
              });
              console.log(await res.json());
            }}
          >
            Publish
          </Button>
        </HStack>
        {isEditing ? (
          <Textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            minH="unset"
            overflow="hidden"
            w="100%"
            resize="none"
            minRows={10}
            as={TextAreaAutoSize}
          />
        ) : (
          <VStack
            align="start"
            ref={scrollRef}
            maxH="80vh"
            overflow="auto"
            w="full"
          >
            {lyrics.split("\n").map((line, index) => (
              <LyricTimeEditable
                key={line + index}
                line={line}
                index={index}
                isEditing={isEditing}
                theLine={timestamps.find(
                  (s) => s.subtitle == line && s.index == index
                )}
                isAutoScroll={isAutoScroll}
                onClick={() => {
                  if (isEditing) return;
                  if (timestamps.length === 0) {
                    setStartTime(progress);
                  }

                  setTimestamps([
                    ...timestamps.filter((s) => s.index != index),
                    { index, subtitle: line, time: progress },
                  ]);
                }}
                onEditDone={(e) => {
                  const [mm, ss] = e.split(":");

                  setTimestamps(
                    timestamps.map((s) => {
                      if (s.subtitle == line && s.index == index) {
                        return {
                          ...s,
                          time: Math.ceil(
                            dayjs
                              .duration({
                                minutes: parseInt(mm),
                                seconds: parseInt(ss),
                              })
                              .asSeconds()
                          ),
                        };
                      }
                      return s;
                    })
                  );
                }}
              />
            ))}
          </VStack>
        )}
      </chakra.div>
    </>
  );
};

const LyricTimeEditable: FC<{
  isAutoScroll: boolean;
  line: string;
  isEditing: boolean;
  index: number;
  theLine: Timestamps | undefined;
  onClick: () => void;
  onEditDone: (e: string) => void;
}> = ({ line, index, theLine, isAutoScroll, onClick, onEditDone }) => {
  const hasLine = !!theLine;
  const lineTime = theLine?.time;
  const defaultDuration = lineTime
    ? dayjs.duration(lineTime, "seconds").format("mm:ss")
    : "";
  const [value, setValue] = useState(defaultDuration);

  useEffect(() => {
    setValue(defaultDuration);
  }, [defaultDuration]);

  if (line.length === 0) return null;

  return (
    <HStack
      style={{ marginTop: index == 0 && isAutoScroll ? "50%" : 2 }}
      align="center"
      spacing="1"
    >
      {/* <Text>{value}</Text> */}
      <Editable
        color="coral"
        fontWeight="bold"
        value={value}
        onChange={(e) => setValue(e)}
        onSubmit={(e) => {
          if (!durationRegex.test(e)) return setValue(defaultDuration);
          onEditDone(e);
        }}
      >
        <EditablePreview
          border="1px solid gray"
          borderRadius="0"
          px="1"
          py="0"
        />
        <EditableInput />
      </Editable>
      <Button
        height="6"
        variant={!hasLine ? "outline" : "solid"}
        colorScheme={hasLine ? "teal" : undefined}
        onClick={onClick}
        borderRadius="0"
        px="1"
      >
        {line}
      </Button>
    </HStack>
  );
};
