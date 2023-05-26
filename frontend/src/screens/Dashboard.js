import {
  Box,
  Divider,
  HStack,
  Heading,
  IconButton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";
import Layout from "../components/Layout";
import SidePanel from "../components/SidePanel";
import SortSelect from "../components/SortSelect";
import sources from "../sources.json";
import authors from "../authors.json";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const newsSource = searchParams.get("source") ?? "all";
  const [selectedSource, setSelectedSource] = useState(newsSource);
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchNews = async () => {
    if (isLoading) return; // Prevent multiple simultaneous requests
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://fe3c-3-81-162-197.ngrok-free.app/get",
        // "http://localhost:3000/get",
        {
          newsSource: authors[newsSource]
            ? authors[newsSource].outlet
            : newsSource,
          page,
          sortBy: sortOption,
          author: authors[newsSource] ? authors[newsSource].author : null,
        }
      );
      const fetchedNews = response.data;
      const newNews = [...news, ...fetchedNews.articles];
      setNews(newNews);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
    setIsLoading(false);
  };

  const fetchNewNews = async () => {
    if (isLoading) return; // Prevent multiple simultaneous requests
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://fe3c-3-81-162-197.ngrok-free.app/get",
        // "http://localhost:3000/get",
        {
          newsSource: authors[newsSource]
            ? authors[newsSource].outlet
            : newsSource,
          page: 1,
          sortBy: sortOption,
          author: authors[newsSource] ? authors[newsSource].author : null,
        }
      );
      const fetchedNews = response.data;
      setNews(fetchedNews.articles);
      setPage(2);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
    setIsLoading(false);
  };

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading) {
      fetchNews();
    }
  };

  const setNewsSource = (source) => {
    if (source === selectedSource) {
      source = "all";
    }
    setSearchParams({ source });
    setSelectedSource(source);
  };

  useEffect(() => {
    fetchNewNews();
  }, [newsSource, sortOption]); // eslint-disable-line react-hooks/exhaustive-deps

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
          w="full"
          h="full"
          overflowY="scroll"
          onScroll={handleScroll}
        >
          <SortSelect onChange={(opt) => setSortOption(opt)} />
          {news.map((item, index) => (
            <VStack
              key={index}
              borderRadius="md"
              shadow="md"
              p={4}
              spacing={1}
              w="full"
              alignItems="flex-start"
            >
              <HStack
                justifyContent="space-between"
                alignItems="center"
                w="full"
              >
                <VStack spacing={1} w="full" alignItems="flex-start">
                  {selectedSource === "all" && (
                    <Text size="md" color="gray">
                      {sources[item.outlet]}
                    </Text>
                  )}
                  <Heading
                    as="h3"
                    size="md"
                    className="clickable"
                    onClick={() => navigator.clipboard.writeText(item.title)}
                    cursor="pointer"
                  >
                    {item.title}
                  </Heading>
                </VStack>
                <IconButton
                  icon={<FiExternalLink />}
                  variant="ghost"
                  onClick={() => window.open(item.link, "_blank")}
                />
              </HStack>
              <Text
                cursor="pointer"
                className="clickable"
                onClick={() => navigator.clipboard.writeText(item.description)}
              >
                {item.description}
              </Text>
              <Text fontSize="sm" pt={4}>
                {item.authors.length > 0 && (
                  <>
                    <strong>{item.authors.join(", ")}</strong> •{" "}
                  </>
                )}
                {new Date(item.pub_date).toLocaleString()}
              </Text>
            </VStack>
          ))}
        </VStack>
      </HStack>
    </Layout>
  );
};

export default Dashboard;
