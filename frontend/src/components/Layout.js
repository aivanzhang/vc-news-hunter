import React from "react";
import { Box, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

function Layout({ children, backButton }) {
  const navigate = useNavigate();
  return (
    <Box p="4">
      <header></header>
      <main>
        <Heading
          as="h1"
          size="xl"
          color="primary.500"
          onClick={() => navigate("/")}
          cursor="pointer"
        >
          VC News
        </Heading>
        <Box h="2" />
        {children}
      </main>
      <footer></footer>
    </Box>
  );
}

export default Layout;
