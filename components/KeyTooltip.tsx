import {
  ComponentWithAs,
  HStack,
  Icon,
  Text,
  Tooltip,
  TooltipProps,
} from "@chakra-ui/react";
import { BsKeyboard } from "react-icons/bs";

export const KeyTooltip: ComponentWithAs<
  "div",
  TooltipProps & {
    keyboardKey?: string;
  }
> = ({ keyboardKey, ...props }) => {
  return (
    <Tooltip
      {...(props as unknown as TooltipProps)}
      label={
        <HStack align="center" py="1">
          <Icon fontSize="2xl"><BsKeyboard/></Icon>
          <Text
            px="1.5"
            border="1px solid white"
            borderRadius="sm"
            fontWeight="bold"
          >
            {keyboardKey}
          </Text>
          <Text as="span">{props.label}</Text>
        </HStack>
      }
    />
  );
};
