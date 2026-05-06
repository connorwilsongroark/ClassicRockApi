import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";

import DashboardPage from "./pages/DashboardPage";
import AlbumsPage from "./pages/AlbumsPage";
import AlbumDetailPage from "@/pages/AlbumDetailPage";
import ArtistsPage from "./pages/ArtistsPage";
import TracksPage from "./pages/TracksPage";
import GenresPage from "./pages/GenresPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path='/' element={<DashboardPage />} />
          <Route path='/albums' element={<AlbumsPage />} />
          <Route path='/albums/:albumId' element={<AlbumDetailPage />} />
          <Route path='/artists' element={<ArtistsPage />} />
          <Route path='/tracks' element={<TracksPage />} />
          <Route path='/genres' element={<GenresPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
