import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API_ENDPOINT from '../global/api-endpoint';
import CONFIG from '../global/config';
import StarRatings from "react-star-ratings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const RestaurantDetail = () => {
  const [restaurant, setRestaurant] = useState(null);
  const { restaurantId } = useParams();
  const [reviewsToShow, setReviewsToShow] = useState([]);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const itemsPerPage = 4;
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', review: '', rating: 0 });

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await fetch(API_ENDPOINT.DETAIL(restaurantId));
        const data = await response.json();
        setRestaurant(data.restaurant);
        setReviewsToShow(data.restaurant.customerReviews.slice(0, itemsPerPage));
        setHasMoreReviews(data.restaurant.customerReviews.length > itemsPerPage);
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      }
    };

    fetchRestaurant();
  }, [restaurantId]);

  if (!restaurant) {
    return <div>Loading restaurant...</div>;
  }

  const handleLoadMoreReviews = async () => {
    const startIndex = reviewsToShow.length;
    const nextReviews = restaurant.customerReviews.slice(startIndex, startIndex + itemsPerPage);

    if (nextReviews.length === 0) {
      setHasMoreReviews(false);
      return;
    }

    setReviewsToShow([...reviewsToShow, ...nextReviews]);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleReviewChange = (event) => {
    const { name, value } = event.target;
    setNewReview({ ...newReview, [name]: value });
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(API_ENDPOINT.POST_REVIEW, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: restaurantId,
          name: newReview.name,
          review: newReview.review,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.error) {
        console.error('Error posting review:', data.message);
        return;
      }

      setRestaurant({ ...restaurant, customerReviews: data.customerReviews });
      setReviewsToShow(data.customerReviews.slice(0, reviewsToShow.length + itemsPerPage));
      setHasMoreReviews(data.customerReviews.length > reviewsToShow.length + itemsPerPage);
      setIsModalOpen(false);
      setNewReview({ name: '', review: '', rating: 0 });
    } catch (error) {
      console.error('Error posting review:', error);
    }
  };

  return (
    <section id="restaurant-detail">
      <div className='text-start mb-5 font-primary-blue cursor-pointer'>
        <FontAwesomeIcon icon={faArrowLeft} onClick={handleGoBack}/>
      </div>
      <div className='grid grid-row lg:grid-cols-2 gap-4'>
        <img className="w-full rounded-sm object-cover" src={restaurant.pictureId ? `${CONFIG.BASE_IMAGE_MEDIUM_URL}${restaurant.pictureId}` : 'vite.svg'} alt={restaurant.name} />
        <div className='text-start text-primary-blue'>
          <h2 className="text-2xl font-medium">{restaurant.name}</h2>
          <div className="flex justify-between my-2">
            <div className='flex gap-2'>
              <p className='font-medium text-lg'>{restaurant.rating}</p>
              <StarRatings
                rating={restaurant.rating}
                starRatedColor="rgb(36, 7, 80)"
                numberOfStars={5}
                name='rating'
                starDimension='20px'
                starSpacing="2px"
                readOnly
              />
            </div>
            <p className="text-gray-500">{restaurant.address} - {restaurant.city}</p>
          </div>
          <div>
            <p className="text-sm text-justify">{restaurant.description}</p>
          </div>
          <div className='flex justify-end gap-2 mt-2 mb-0'>
            {restaurant.categories && (
              <div className='text-center flex justify-around'>
                {restaurant.categories.map(category =>
                  <p key={category.name} className='italic text-sm m-1'>#{category.name}</p>
                )}
              </div>
            )}
            <button className='text-sm border px-4 py-2 rounded-sm bg-primary-blue text-white p-1 transition duration-300 ease-out hover:bg-darker-blue' onClick={handleOpenModal}>
              Write a Review
            </button>
          </div>
        </div>
      </div>
      <div className='grid grid-row lg:grid-cols-2 gap-4'>
        <div className="mt-4">
          <h3 className="text-medium font-medium my-3 text-xl w-full bg-primary-blue text-white p-2 rounded-sm">Menu</h3>
          {restaurant.menus && (
            <div className='text-center flex justify-around'>
              <div>
                <h4 className='font-medium text-lg mb-2'>Makanan</h4>
                <ul>
                  {restaurant.menus.foods.map(food =>
                    <li key={food.name}>{food.name}</li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className='font-medium text-lg mb-2'>Minuman</h4>
                <ul>
                  {restaurant.menus.drinks.map(drink =>
                    <li key={drink.name}>{drink.name}</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-medium font-medium my-3 text-xl w-full bg-primary-blue text-white p-2 rounded-sm">Reviews</h3>
          {restaurant.customerReviews && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {reviewsToShow.map((review) => (
                <div key={review.name} className="bg-white rounded-sm outline outline-1 outline-gray-500 p-4 mb-2">
                  <h5 className="text-base font-medium mb-2">{review.name}</h5>
                  <p className="text-sm">{review.review}</p>
                  <p className="text-xs text-gray-500">{review.date}</p>
                </div>
              ))}
              {hasMoreReviews && (
                <div className="text-center flex">
                  <button className="underline font-medium text-sm rounded-sm p-2 transition duration-300 ease-out hover:text-darker-blue" onClick={handleLoadMoreReviews}>
                    See more Reviews
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            <div className="inline-block align-bottom bg-white rounded-sm px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Write a Review</h3>
                <form onSubmit={handleSubmitReview}>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newReview.name}
                      onChange={handleReviewChange}
                      className="mt-1 p-2 block w-full shadow-sm sm:text-sm  border border-gray-300 rounded-sm"
                      required
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">Review</label>
                    <textarea
                      name="review"
                      value={newReview.review}
                      onChange={handleReviewChange}
                      className="mt-1 p-2 block w-full border sm:text-sm border-gray-300 rounded-sm"
                      required
                    ></textarea>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="mr-2 bg-gray-bg hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-sm"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-primary-blue hover:bg-darker-blue text-white font-medium py-2 px-4 rounded-sm"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RestaurantDetail;
