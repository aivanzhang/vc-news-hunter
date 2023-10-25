import {
  Badge,
  Box,
  Button,
  Checkbox,
  HStack,
  Heading,
  IconButton,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Spacer,
  Text,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { IoIosCopy, IoMdThumbsDown } from "react-icons/io";
import { PiNewspaperFill } from "react-icons/pi";
import Layout from "../components/Layout";
import { toast } from "react-toastify";
import sources from "../sources.json";
import TwitterInsights from "../components/TwitterInsights";
import GenerateModal from "../components/GenerateModal";

const CATEGORIES = ["World", "Sports", "Business", "Sci/Tech", "Misc"];

function getSortedCategories(article) {
  const sortedCategories = Object.keys(article)
    .filter((key) => CATEGORIES.includes(key))
    .sort((a, b) => {
      return article[b] - article[a];
    });
  return sortedCategories;
}

const TopNews = () => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [hiddenArticles, setHiddenArticles] = useState(new Set());
  const [daysOld, setDaysOld] = useState(7);
  const [numArticles, setNumArticles] = useState(10);
  const [sortByTwitter, setSortByTwitter] = useState(true);
  const [newsletterArticles, setNewsletterArticles] = useState(new Set());

  const getTop = async () => {
    if (isLoading) return; // Prevent multiple simultaneous requests
    setIsLoading(true);
    try {
      const response = await axios.post("/top", {
        daysOld,
        numArticles,
        sortByTwitter,
      });
      const fetchedNews = response.data;
      setNews(fetchedNews.articles);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
    setIsLoading(false);
  };

  const onHideArticle = async (article) => {
    const newHiddenArticles = new Set(hiddenArticles);
    newHiddenArticles.add(article.title);
    setHiddenArticles(newHiddenArticles);
    try {
      await axios.post("/hide", {
        articleId: article._id,
      });
    } catch (error) {
      console.error("Error hiding news:", error);
    }
  };

  useEffect(() => {
    getTop();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daysOld, numArticles, sortByTwitter]);

  const handleDaysChangeEnd = (value) => {
    if (value < 2) {
      setDaysOld(1);
    } else if (value < 4.5) {
      setDaysOld(2);
    } else {
      setDaysOld(7);
    }
  };
  return (
    <Layout>
      <HStack
        spacing={4}
        display="flex"
        flexDir="inline-flex"
        className="h-[89vh] w-full"
      >
        <GenerateModal
          isOpen={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          articles={() => {
            const articles = [];
            for (const article of newsletterArticles) {
              articles.push(
                news.find((newsArticle) => newsArticle._id === article)
              );
            }
            return articles;
          }}
        />
        <VStack spacing={4} p={2} w="full" h="full" overflowY="scroll">
          <VStack w="full" spacing={5} alignItems="flex-start">
            <HStack w="30%" spacing={20}>
              {/* Slider for Days Old */}
              <Box className="flex flex-col w-1/2">
                <Text mb="2">Days Old: {daysOld}</Text>
                <Slider
                  min={1}
                  max={7}
                  step={1}
                  value={daysOld}
                  onChange={(value) => handleDaysChangeEnd(value)}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={6}>
                    <Box color="tomato" />
                  </SliderThumb>
                </Slider>
              </Box>

              {/* Slider for Number of Articles */}
              <Box className="flex flex-col w-1/2">
                <Text mb="2">Number of Articles: {numArticles}</Text>
                <Slider
                  min={10}
                  max={20}
                  step={2}
                  value={numArticles}
                  onChange={(value) => setNumArticles(value)}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={6}>
                    <Box color="blue.500" />
                  </SliderThumb>
                </Slider>
              </Box>
            </HStack>
            <HStack w="100%" spacing={20}>
              <Wrap spacing={3}>
                <Checkbox
                  isChecked={sortByTwitter}
                  colorScheme="primary"
                  onChange={() => setSortByTwitter((prev) => !prev)}
                >
                  Sort by Twitter Popularity
                </Checkbox>
              </Wrap>
            </HStack>
            {newsletterArticles.size > 0 && (
              <Button
                colorScheme="primary"
                onClick={() => setIsGenerateModalOpen(true)}
              >
                Generate Newsletter ({newsletterArticles.size})
              </Button>
            )}
          </VStack>
          {news.length === 0 && (
            <Text fontSize="lg" color="gray">
              No articles found
            </Text>
          )}
          {news.map(
            (item, index) =>
              !hiddenArticles.has(item.title) && (
                <VStack
                  key={index}
                  borderRadius="md"
                  shadow="md"
                  p={4}
                  spacing={1}
                  w="full"
                  alignItems="flex-start"
                  cursor="pointer"
                  onClick={() => window.open(item.link, "_blank")}
                >
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    w="full"
                  >
                    <VStack spacing={1} w="full" alignItems="flex-start">
                      <Text size="md" color="gray">
                        {sources[item.outlet]}
                      </Text>
                      <Heading as="h3" size="md">
                        {item.title}
                      </Heading>
                    </VStack>
                    <Button
                      p="2"
                      px="4"
                      leftIcon={<PiNewspaperFill />}
                      colorScheme="blue"
                      variant={
                        newsletterArticles.has(item._id) ? "solid" : "outline"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        const newNewsletterArticles = new Set(
                          newsletterArticles
                        );
                        if (newNewsletterArticles.has(item._id)) {
                          newNewsletterArticles.delete(item._id);
                        } else {
                          newNewsletterArticles.add(item._id);
                        }
                        setNewsletterArticles(newNewsletterArticles);
                      }}
                    >
                      Add
                    </Button>
                    {item.tweets && (
                      <TwitterInsights
                        tweetsArray={item.tweets}
                        tweets_summary={item.tweets_summary}
                      />
                    )}
                    <IconButton
                      icon={<IoIosCopy />}
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(item.title);
                        toast("Copied title to clipboard!", {
                          position: "top-right",
                          autoClose: 5000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          progress: undefined,
                          theme: "light",
                        });
                      }}
                    />
                    <IconButton
                      icon={<IoMdThumbsDown />}
                      variant="ghost"
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        onHideArticle(item);
                        toast("Feedback noted!", {
                          position: "top-right",
                          autoClose: 5000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          progress: undefined,
                          theme: "light",
                        });
                      }}
                    />
                  </HStack>
                  <Text>{item.description}</Text>
                  <HStack alignItems="center" w="full">
                    <Text fontSize="sm">
                      {item.authors.length > 0 && (
                        <>
                          <strong>{item.authors.join(", ")}</strong> •{" "}
                        </>
                      )}
                      {new Date(item.pub_date).toLocaleString()}
                    </Text>
                    <Spacer />
                    {getSortedCategories(item).map((category, index) => (
                      <Badge
                        key={index}
                        colorScheme="primary"
                        rounded="md"
                        variant={
                          category === item["type"] ? "solid" : "outline"
                        }
                      >
                        {category}: {item[category].toFixed(2)}
                      </Badge>
                    ))}
                  </HStack>
                </VStack>
              )
          )}
        </VStack>
      </HStack>
    </Layout>
  );
};

export default TopNews;
