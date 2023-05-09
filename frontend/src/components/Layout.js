import React from "react";
import { Box, Heading } from "@chakra-ui/react";

function Layout({ children, backButton }) {
  return (
    <Box p="4">
      <header></header>
      <main>
        <Heading as="h1" size="xl" color="primary.500">
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
