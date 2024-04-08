import React from "react";
import {
  Box,
  Button,
  HStack,
  Heading,
  Link,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

function Layout({ children, backButton }) {
  const navigate = useNavigate();
  return (
    <Box p="4">
      <header></header>
      <main>
        <HStack>
          <VStack>
            <Heading
              as="h1"
              size="xl"
              color="primary.500"
              onClick={() => navigate("/")}
              cursor="pointer"
            >
              VC News
            </Heading>
            <Link href="mailto:ivanzhangofficial@gmail.com" w="full">
              Contact
            </Link>
          </VStack>
          <Spacer />
          {/* <Button colorScheme="primary" onClick={() => navigate("/top_news")}>
            Top News Articles (Beta)
          </Button> */}
        </HStack>
        <Box h="2" />
        {children}
      </main>
      <footer></footer>
    </Box>
  );
}

export default Layout;
