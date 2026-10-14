
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Sessions from "./pages/Sessions";
import Heatmap from "./pages/Heatmap";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Navbar />}>
          <Route path="/" element={<Sessions />} />
          <Route path="/heatmap" element={<Heatmap />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
