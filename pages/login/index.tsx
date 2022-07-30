import { Button, VStack } from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import React from "react";
import { AiOutlineGoogle } from "react-icons/ai";
import { useRedirectAuthenticated } from "hooks/useRedirectAuthenticated";

const LoginRoute = () => {
  useRedirectAuthenticated();
  return (
    <VStack h="90vh" justify="center">
      <Button leftIcon={<AiOutlineGoogle />} onClick={() => signIn()}>
        Login with Google
      </Button>
    </VStack>
  );
};

export default LoginRoute;
