import {
  Badge,
  Button,
  ButtonGroup,
  Divider,
  HStack,
  Heading,
  IconButton,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { IoIosCopy, IoMdThumbsDown } from "react-icons/io";
import Layout from "../components/Layout";
import SidePanel from "../components/SidePanel";
import Filters from "../components/Filters";
import { toast } from "react-toastify";
import sources from "../sources.json";

const CATEGORIES = ["World", "Sports", "Business", "Sci/Tech", "Misc"];

function getSortedCategories(article) {
  const sortedCategories = Object.keys(article)
    .filter((key) => CATEGORIES.includes(key))
    .sort((a, b) => {
      return article[b] - article[a];
    });
  return sortedCategories;
}

const Dashboard = () => {
  const [selectedSources, setSelectedSources] = useState(
    new Set(Object.keys(sources))
  );
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState("most_recent");
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [types, setTypes] = useState(new Set(["Startup"]));
  const [sciTechMetric, setSciTechMetric] = useState(0.5);
  const [businessMetric, setBusinessMetric] = useState(0.25);
  const [hiddenArticles, setHiddenArticles] = useState(new Set());

  const fetchNews = async () => {
    if (isLoading) return; // Prevent multiple simultaneous requests
    setIsLoading(true);
    try {
      const response = await axios.post("/get", {
        selectedSources: Array.from(selectedSources),
        page,
        dateRange,
        sortOption,
        types: types.has("All") ? ["All"] : ["Startup"],
        sciTechMetric,
        businessMetric,
      });
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
    // console.log(types);
    try {
      const response = await axios.post("/get", {
        selectedSources: Array.from(selectedSources),
        page: 1,
        dateRange,
        sortOption,
        types: types.has("All") ? ["All"] : ["Startup"],
        sciTechMetric,
        businessMetric,
      });
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

  const onFinishSettingStartupValue = (type, value) => {
    if (type === "Sci/Tech") {
      setSciTechMetric(value / 100);
    } else if (type === "Business") {
      setBusinessMetric(value / 100);
    }
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
    if (selectedSources.size === 0) return;
    fetchNewNews();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedSources,
    sortOption,
    dateRange,
    types,
    sciTechMetric,
    businessMetric,
  ]);

  return (
    <Layout>
      <HStack
        spacing={4}
        display="flex"
        flexDir="inline-flex"
        className="h-[89vh] w-full"
      >
        <VStack className="w-1/4" h="full" overflowY="scroll" spacing={2}>
          <Filters
            onSelectSort={(opt) => setSortOption(opt)}
            dateRange={dateRange}
            setDateRange={setDateRange}
            types={types}
            onChangeTypes={(newType) => {
              const newTypes = new Set(types);
              if (newTypes.has(newType)) {
                newTypes.delete(newType);
              } else {
                newTypes.add(newType);
              }
              setTypes(newTypes);
            }}
            onSliderChangeEnd={onFinishSettingStartupValue}
          />
          <ButtonGroup gap="2" justifyContent="flex-start" w="full">
            <Button
              size="xs"
              variant="ghost"
              colorScheme="primary"
              onClick={() => setSelectedSources(new Set(Object.keys(sources)))}
            >
              Select All
            </Button>
            <Button
              size="xs"
              variant="ghost"
              colorScheme="primary"
              onClick={() => setSelectedSources(new Set())}
            >
              Clear All
            </Button>
          </ButtonGroup>
          <SidePanel
            newsSources={selectedSources}
            setNewsSources={setSelectedSources}
          />
        </VStack>
        <Divider orientation="vertical" />
        <VStack
          spacing={4}
          p={2}
          w="full"
          h="full"
          overflowY="scroll"
          onScroll={handleScroll}
        >
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
                    {types.has("Startup") &&
                      item["Sci/Tech"] > sciTechMetric &&
                      item["Business"] > businessMetric && (
                        <Badge
                          colorScheme="primary"
                          rounded="md"
                          variant="solid"
                        >
                          Startup
                        </Badge>
                      )}
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

export default Dashboard;
