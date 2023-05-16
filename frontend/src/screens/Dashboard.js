import { Box, Divider, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import Layout from "../components/Layout";
import SidePanel from "../components/SidePanel";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import feed from "../rss.json";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const newsSource = searchParams.get("source") ?? "all";
  const [selectedSource, setSelectedSource] = useState(newsSource);

  const setNewsSource = (source) => {
    if (source === selectedSource) {
      source = "all";
    }
    setSearchParams({ source });
    setSelectedSource(source);
  };

  useEffect(() => {
    setSelectedSource(newsSource);
  }, [newsSource]);

  return (
    <Layout>
      <HStack
        spacing={4}
        display="flex"
        flexDir="inline-flex"
        className="h-[89vh] w-full"
      >
        <Box py={2} className="w-1/4" h="full" overflowY="scroll">
          <SidePanel
            newsSource={selectedSource}
            setNewsSource={setNewsSource}
          />
        </Box>
        <Divider orientation="vertical" />
        <VStack
          spacing={4}
          p={2}
          className="w-full"
          h="full"
          overflowY="scroll"
        >
          {feed.map((item) => (
            <VStack
              key={item.id}
              borderRadius="md"
              shadow="md"
              p={4}
              spacing={1}
              onClick={() => window.open(item.link, "_blank")}
              cursor="pointer"
              w="full"
              alignItems="flex-start"
            >
              {selectedSource === "all" && (
                <Text size="md" color="gray">
                  {item.outlet}
                </Text>
              )}
              <Heading as="h3" size="md">
                {item.title}
              </Heading>
              <Text>{item.description}</Text>
              <Text fontSize="sm" pt={4}>
                <strong>{item.author}</strong> • {item.pubDate}
              </Text>
            </VStack>
          ))}
        </VStack>
      </HStack>
    </Layout>
  );
};

export default Dashboard;
