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
  VStack,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useProgressScroll } from "hooks/useProgressScroll";
import { FC, RefObject, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { AiTwotoneEdit, AiTwotoneEye } from "react-icons/ai";
import TextAreaAutoSize from "react-textarea-autosize";
import YouTube from "react-youtube";

dayjs.extend(duration);

const durationRegex = /\d{2}:\d{2}/g;

interface Props {
  isEditing: boolean;
  youtubeRef: RefObject<YouTube>;
}

interface Timestamps {
  subtitle: string;
  time: number;
  index: number;
}

export const LyricInput: FC<Props> = ({
  isEditing: parentIsEditing,
  youtubeRef,
}) => {
  const [lyrics, setLyrics] = useState("");

  const [timestamps, setTimestamps] = useState<Timestamps[]>([]);

  // progress in seconds
  const [progress, setProgress] = useState(0);

  const [isEditing, setIsEditing] = useState(parentIsEditing);

  useEffect(() => {
    setIsEditing(parentIsEditing);
  }, [parentIsEditing]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const time = Math.ceil(
        await youtubeRef.current?.internalPlayer.getCurrentTime()
      );
      if (time != progress) setProgress(time);
    }, 1000);
    return () => clearInterval(interval);
  }, [youtubeRef, progress]);

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

  return (
    <chakra.div pt="5" w="full">
      <HStack pb="2">
        <ButtonGroup isAttached size="sm">
          <IconButton
            variant={!isEditing ? "outline" : undefined}
            colorScheme={isEditing ? "twitter" : undefined}
            aria-label="Edit"
            onClick={() => setIsEditing(true)}
          >
            <AiTwotoneEdit />
          </IconButton>
          <IconButton
            variant={isEditing ? "outline" : undefined}
            colorScheme={!isEditing ? "twitter" : undefined}
            aria-label="Edit"
            onClick={() => setIsEditing(false)}
          >
            <AiTwotoneEye />
          </IconButton>
        </ButtonGroup>
        <Heading size="md">Mode: {isEditing ? "Editing" : "Preview"}</Heading>
        <Checkbox
          colorScheme="twitter"
          isChecked={isAutoScroll}
          onChange={(e) => setIsAutoScroll(e.target.checked)}
        >
          Auto Scroll
        </Checkbox>
        <Button borderRadius="full" onClick={() => setTimestamps([])}>
          Reset
        </Button>
        <Button
          colorScheme="green"
          borderRadius="full"
          disabled={timestamps.length !== lyrics.split("\n").length}
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
  );
};

const LyricTimeEditable: FC<{
  line: string;
  isEditing: boolean;
  index: number;
  theLine: Timestamps | undefined;
  onClick: () => void;
  onEditDone: (e: string) => void;
}> = ({ line, index, theLine, onClick, onEditDone }) => {
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
      style={{ marginTop: index == 0 ? "50%" : 2 }}
      align="center"
      spacing="1"
    >
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
        variant={!hasLine ? "outline" : "ghost"}
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
