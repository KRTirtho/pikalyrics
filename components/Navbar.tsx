import {
  useColorModeValue,
  useDisclosure,
  chakra,
  Flex,
  HStack,
  IconButton,
  VStack,
  CloseButton,
  Button,
  InputGroup,
  InputLeftElement,
  Input,
  Avatar,
  Box,
  Heading,
  Link,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import {
  AiFillHome,
  AiOutlineInbox,
  AiOutlineMenu,
  AiOutlineSearch,
} from "react-icons/ai";
import { BsFillCameraVideoFill } from "react-icons/bs";
import NavLink from "next/link";
import { IoMusicalNotesOutline } from "react-icons/io5";

export const Navbar = () => {
  const bg = useColorModeValue("white", "gray.800");
  const mobileNav = useDisclosure();
  const { data: session } = useSession();

  return (
    <>
      <chakra.header
        bg={bg}
        w="full"
        px={{
          base: 2,
          sm: 4,
        }}
        py={4}
        shadow="md"
      >
        <Flex alignItems="center" justifyContent="space-between" mx="auto">
          <HStack display="flex" spacing={3} alignItems="center">
            <Box
              display={{
                base: "inline-flex",
                md: "none",
              }}
            >
              <IconButton
                display={{
                  base: "flex",
                  md: "none",
                }}
                aria-label="Open menu"
                fontSize="20px"
                color="gray.800"
                _dark={{
                  color: "inherit",
                }}
                variant="ghost"
                icon={<AiOutlineMenu />}
                onClick={mobileNav.onOpen}
              />
              <VStack
                pos="absolute"
                top={0}
                left={0}
                right={0}
                display={mobileNav.isOpen ? "flex" : "none"}
                flexDirection="column"
                p={2}
                pb={4}
                m={2}
                bg={bg}
                spacing={3}
                rounded="sm"
                shadow="sm"
              >
                <CloseButton
                  aria-label="Close menu"
                  justifySelf="self-start"
                  onClick={mobileNav.onClose}
                />
                <Button w="full" variant="ghost" leftIcon={<AiFillHome />}>
                  Dashboard
                </Button>
                <Button
                  w="full"
                  variant="solid"
                  colorScheme="brand"
                  leftIcon={<AiOutlineInbox />}
                >
                  Inbox
                </Button>

                <NavLink href="/create">
                  <Button
                    w="full"
                    colorScheme="twitter"
                    variant="ghost"
                    leftIcon={<IoMusicalNotesOutline />}
                  >
                    Create Lyrics
                  </Button>
                </NavLink>
              </VStack>
            </Box>
            <NavLink href="/" passHref>
              {/*  */}
              <Heading as={Link} size="md">
                Pika Lyrics
              </Heading>
            </NavLink>

            <HStack
              spacing={3}
              display={{
                base: "none",
                md: "inline-flex",
              }}
            >
              <Button variant="ghost" leftIcon={<AiFillHome />} size="sm">
                Dashboard
              </Button>
              <Button variant="ghost" leftIcon={<AiOutlineInbox />} size="sm">
                Inbox
              </Button>
              <NavLink href="/create">
                <Button
                  colorScheme="twitter"
                  leftIcon={<IoMusicalNotesOutline />}
                  size="sm"
                >
                  Create Lyrics
                </Button>
              </NavLink>
            </HStack>
          </HStack>
          <HStack
            spacing={3}
            display={mobileNav.isOpen ? "none" : "flex"}
            alignItems="center"
          >
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <AiOutlineSearch />
              </InputLeftElement>
              <Input type="tel" placeholder="Search..." />
            </InputGroup>
            {session ? (
              <Avatar size="sm" src={session?.user?.image ?? undefined} />
            ) : (
              <NavLink href="/login" passHref>
                <Button variant="link" as={Link} colorScheme="pink">
                  Login
                </Button>
              </NavLink>
            )}
          </HStack>
        </Flex>
      </chakra.header>
    </>
  );
};
