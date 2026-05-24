const ingredientForm = document.getElementById('order-form');
const ingredientInput = document.getElementById('ingredient');

// USING FETCH API TO GET DATA FROM THEMEALDB BASED ON THE USER INGREDIENT INPUT
ingredientForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const rawIngredient = ingredientInput.value.trim();  // Get the value from the input field
    const ingredient = rawIngredient.toLowerCase().replace(/\s+/g, ''); // Convert the input to lowercase for case-insensitive search

    // CHECK IF THE USER HAS ENTERED AN INGREDIENT, IF NOT, ALERT THE USER TO ENTER ONE
    if (!ingredient) {
        alert("Please enter an ingredient first.");
        return;
    }

    async function fetchData(ingredient) {
        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
            const gallery = document.getElementById('meal-gallery');
            const data = await response.json();
            const meals = data.meals;

            gallery.innerHTML = ''; // Clear previous results


            //CHECK IF MEALS IS NULL OR UNDEFINED, THEN DISPLAY A MESSAGE TO THE USER
            if (meals === null || meals === undefined) {
                gallery.innerHTML = '<p>No meals found.</p>';
                return;
            }
            

            //FUNCTION TO GENERATE A RANDOM MEAL ORDER FROM THE FETCHED MEAL LIST
            function randomOrder(mealList) {
                const randomIndex = Math.floor(Math.random() * mealList.length);
                const randomMeal = mealList[randomIndex];
                const myOrder = {
                    orderDescription: randomMeal.strMeal,
                    orderNumber: Date.now(), 
                    item: randomMeal.strMeal,
                    status: 'incomplete' 
                };
                console.log('Final order:', myOrder);
                return randomMeal;
            }

            const mealMessage = document.getElementById('meal-message');
            mealMessage.textContent = `Showing results for "${ingredient}"`;
            mealMessage.style.fontSize = '18px';
            mealMessage.style.fontWeight = 'bold';
            mealMessage.appendChild(document.createElement('br')); 


            const randomMeal = randomOrder(meals);

            const img = document.createElement('img');
            img.src = randomMeal.strMealThumb; // Use the meal thumbnail as the image source
            img.alt = randomMeal.strMeal || 'Meal Image';// Set alt text for accessibility
            img.style.width = '200px'; // Set a fixed width for the images
            img.style.height = 'auto'; // Maintain aspect ratio
            img.style.margin = '10px'; // Add some margin around the images
            gallery.appendChild(img);
            }

        catch (error) {
            console.error('Error fetching data:', error);
        }

    }
    fetchData(ingredient);
});
