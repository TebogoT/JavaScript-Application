const ingredientForm = document.getElementById('order-form');
const ingredientInput = document.getElementById('ingredient');

ingredientForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const ingredient = ingredientInput.value;  // Get the value from the input field
    async function fetchData() {
        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${ingredient}`);
            const gallery = document.getElementById('meal-gallery');
            const data = await response.json();
            const meals = data.meals;

            gallery.innerHTML = ''; // Clear previous results


            const mealMessage = document.getElementById('meal-message');
            mealMessage.textContent = `Showing results for "${ingredient}"`;
            mealMessage.style.fontSize = '18px';
            mealMessage.style.fontWeight = 'bold';
            mealMessage.appendChild(document.createElement('br')); // Add a line break after the message


            if (meals === null) {
                gallery.innerHTML = '<p>No meals found.</p>';
                return;
            }

            meals.forEach(meal => {
                const img = document.createElement('img');
                img.src = meal.strMealThumb; // Use the meal thumbnail as the image source
                img.alt = meal.strMeal || 'Meal Image';// Set alt text for accessibility
                img.style.width = '200px'; // Set a fixed width for the images
                img.style.height = 'auto'; // Maintain aspect ratio
                img.style.margin = '10px'; // Add some margin around the images
                gallery.appendChild(img);
            }
            );
        }
        catch (error) {
            console.error('Error fetching data:', error);
        }

    }
    fetchData();
});

