import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Content from './pages/Restaurants'
import RestaurantDetail from './pages/RestaurantDetail'

function App() {

  return (
    <BrowserRouter>
    <main>
      <Routes>
        <Route path='/' element={<Content />}></Route>
        <Route path='/restaurants/:restaurantId' element={<RestaurantDetail />}></Route>
      </Routes>
    </main>

    </BrowserRouter>
  )
}

export default App
