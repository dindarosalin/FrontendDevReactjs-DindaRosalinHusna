import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import API_ENDPOINT from '../global/api-endpoint';
import CONFIG from "../global/config";
import StarRatings from "react-star-ratings";
import { useNavigate } from "react-router-dom";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantsToShow, setRestaurantsToShow] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch(API_ENDPOINT.LIST);
        const data = await response.json();
        setRestaurants(data.restaurants);
        setFilteredRestaurants(data.restaurants);
        setRestaurantsToShow(data.restaurants.slice(0, itemsPerPage));
        setHasMore(data.restaurants.length > itemsPerPage);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    setRestaurantsToShow(filteredRestaurants.slice(0, itemsPerPage));
    setHasMore(filteredRestaurants.length > itemsPerPage);
    setCurrentPage(1);
  }, [filteredRestaurants]);

  const handleCityFilterChange = (event) => {
    const city = event.target.value;
    setSelectedCity(city);

    if (city === '') {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter((restaurant) => restaurant.city === city);
      setFilteredRestaurants(filtered);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();

    if (!searchTerm) {
      return; // Hindari pencarian kosong
    }

    try {
      const response = await fetch(`${API_ENDPOINT.SEARCH}?q=${searchTerm}`);
      const data = await response.json();

      if (data.error) {
        console.error('Error searching restaurants:', data.error);
        return;
      }

      setFilteredRestaurants(data.restaurants);
      setSelectedCity('');
    } catch (error) {
      console.error('Error searching restaurants:', error);
    }
  };

  const handleLoadMore = async () => {
    const startIndex = currentPage * itemsPerPage;
    const nextRestaurants = filteredRestaurants.slice(startIndex, startIndex + itemsPerPage);

    if (nextRestaurants.length === 0) {
      setHasMore(false);
      return;
    }

    setRestaurantsToShow([...restaurantsToShow, ...nextRestaurants]);
    setCurrentPage(currentPage + 1);
  };

  const handleLearnMore = (restaurantId) => {
    navigate(`/restaurants/${restaurantId}`);
  };

  const handleClearAll = () => {
    setFilteredRestaurants(restaurants);
    setSearchTerm('');
    setSelectedCity('');
  };

  return (
    <section id="Restaurant" className="mt-8">
      <div id="nav">
        <div className="text-start">
          <h1 className="text-3xl">Restaurants</h1>
          <p className="w-full md:w-3/5 lg:w-3/5 font-light my-4 text-md">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</p>
        </div>
        <nav className="p-3 border-y border-1">
          <div className="flex flex-col md:flex-row md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:gap-4">
              <p className="p-2 font-medium text-start">Filter by:</p>
              <div className="shadow rounded-sm hover:shadow-md p-2 md:p-0 lg:p-0">
                <select className="cursor-pointer p-2" value={selectedCity} onChange={handleCityFilterChange}>
                  <option value="">All Cities</option>
                  {[...new Set(restaurants.map((restaurant) => restaurant.city))].map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <form onSubmit={handleSearchSubmit}>
                <div className="flex items-center rounded-sm shadow hover:shadow-md p-2 md:p-0 lg:p-0">
                  <input type="text" id="search" name="search" className="flex-grow p-2 rounded-sm" placeholder="Search" value={searchTerm} onChange={handleSearchChange} />
                  <button type="submit" className="p-2 rounded-sm shadow hover:shadow-md bg-primary-blue text-white">Search</button>
                </div>
              </form>
            </div>
            <div className="md:mt-0 mt-4">
              <button className="text-sm border px-4 py-2 rounded-sm uppercase shadow hover:shadow-md" onClick={handleClearAll}>Clear All</button>
            </div>
          </div>
        </nav>
      </div>
      <h3 className="text-xl text-start my-4">All Restaurants</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10 text-primary-blue">
        {restaurantsToShow.map((restaurant) => (
          <div key={restaurant.id} className="text-start transition duration-500 ease-in-out max-w-sm rounded-sm shadow hover:scale-105 p-2">
            <img className="w-full rounded-sm h-40 object-cover" src={restaurant.pictureId ? `${CONFIG.BASE_IMAGE_MEDIUM_URL}${restaurant.pictureId}` : 'vite.svg'} alt={restaurant.name} />
            <div className="mt-2">
              <div className="font-medium text-lg">{restaurant.name}</div>
              <div className="my-2">
                <StarRatings
                  rating={restaurant.rating}
                  starRatedColor="rgb(36, 7, 80)"
                  numberOfStars={5}
                  name='rating'
                  starDimension='18px'
                  starSpacing="1px"
                />
              </div>
              <div className="flex justify-between mb-5">
                <p className="text-primary-blue">{restaurant.city}</p>
                <div>
                  <FontAwesomeIcon icon={faCircle} className="text-red h-2" /> <span className="text-sm"> Open Now</span>
                </div>
              </div>
            </div>
            <div className="mb-0">
              <button className="text-sm border px-4 py-2 rounded-sm uppercase bg-primary-blue text-white w-full transition duration-300 ease-out hover:bg-darker-blue"
                onClick={() => handleLearnMore(restaurant.id)}>Learn More</button>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="m-5 text-center">
          <button className="uppercase outline outline-1 font-medium text-sm rounded-sm p-2 w-24 md:w-48 lg:w-80 transition duration-300 ease-out hover:shadow-lg" onClick={handleLoadMore}>
            See more
          </button>
        </div>
      )}
    </section>
  );
};

export default Restaurants;
