import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./screens/Dashboard";
import theme from "./theme";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import TopNews from "./screens/TopNews";
import Generated from "./screens/Generated";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/top_news" element={<TopNews />} />
          <Route path="/generated/:generated_id" element={<Generated />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
