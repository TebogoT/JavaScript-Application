const ingredientForm = document.getElementById('order-form');
const ingredientInput = document.getElementById('ingredient');

//A FUNCTION TO FORMAT THE INGREDIENT INPUT FOR CASE-INSENSITIVE SEARCH
function formatIngredient(ingredient) {
    return ingredient.toLowerCase().replace(/\s+/g, '_');
}


//A FUNCTION TO GENERATE A RANDOM MEAL ORDER FROM THE FETCHED MEAL LIST
function randomOrder(meals) {
    const randomIndex = Math.floor(Math.random() * meals.length);
    const randomMeal = meals[randomIndex];

    const nextOrderNumber = sessionStorage.length + 1; // Generate a unique order number based on the current number of orders in sessionStorage
    
    // CREATE AN ORDER OBJECT TO STORE IN sessionStorage
    const myOrder = {
        description: randomMeal.strMeal,
        orderNumber: Date.now(), 
        completionStatus: 'incomplete' 
    };

    const orderText = JSON.stringify(myOrder); // Convert the order object to a string for storage
    sessionStorage.setItem(`order_${nextOrderNumber}`, orderText); // Store the order in sessionStorage with a unique key
   
    console.log('saved to sessionStorage', myOrder);
    return randomMeal;
}

// A FUNCTION TO FETCH MEAL DATA BASED ON THE USER'S INGREDIENT INPUT
async function fetchMealData(ingredient) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
        const data = await response.json();// Extract the meals array from the response data
        const meals = data.meals;

        //CHECK IF MEALS IS NULL OR UNDEFINED, THEN DISPLAY A MESSAGE TO THE USER
        if (meals === null || meals === undefined) {
            const newIngredient = ingredient.replace(/_/g, ' '); // Replace underscores with spaces for display
            const retryInput = prompt(`No meals found for ${newIngredient}. Please try again with a different ingredient:`);

            // CHECK IF THE USER ENTERED A NEW INGREDIENT, IF NOT, EXIT THE FUNCTION TO ALLOW THE USER TO ENTER A NEW ONE
            if (!retryInput || !retryInput.trim()) {
                return null; 
            }
            
            const newInput = formatIngredient(retryInput); // Format the retry input for case-insensitive search
            return await fetchMealData(newInput); // Recursively call the function with the new ingredient
        }
        return meals; // Return the meals array if it is valid
    } catch (error) {
        console.error('Error fetching data:', error);
        return null; // Return null in case of an error to allow the user to enter a new ingredient
    }

}

// A FUNCTION TO SHOW INCOMPLETE ORDERS STORED IN sessionStorage
function showIncompleteOrders() {
    console.log("incomplete orders");
    let incompleteOrders  = false;
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key.startsWith('order_')) { // Check if the key corresponds to an order
            const rawOrder = sessionStorage.getItem(key);
            const order = JSON.parse(rawOrder);
            if (order.completionStatus === 'incomplete') { // Check if the order is incomplete
                console.log(`Order ${order.orderNumber}: ${order.description} is incomplete.`);
                incompleteOrders = true;
            }
        }
    }
    // CHECK IF NO INCOMPLETE ORDERS WERE FOUND AND LOG A MESSAGE IF NONE ARE FOUND
    if (!incompleteOrders) {
        console.log("No incomplete orders found.");
    }
}

function showCompletedOrders() {
    const userInput = prompt("Enter order number to mark as completed:");
    const orderNumber = parseInt(userInput, 10); // Convert the user input to an integer  
    if (!orderNumber || orderNumber === 0) {
        alert("No order number entered. Please enter a valid order number.");
        return;
    }

    const targetKey = `order_${orderNumber}`; // Construct the key for the order based on the user input(
    const rawOrder = sessionStorage.getItem(targetKey); // Retrieve the order from sessionStorage using the constructed key

    if (rawOrder === null || rawOrder === undefined) {
        alert(`Order number ${orderNumber} not found. Please enter a valid order number.`);
        return;
    }

    const order = JSON.parse(rawOrder);
    order.completionStatus = 'completed';
    sessionStorage.setItem(targetKey, JSON.stringify(order));

    alert(`Order number ${orderNumber} marked as completed.`);

    showIncompleteOrders(); // Call the function to show incomplete orders after marking one as completed
}


// ADD AN EVENT LISTENER TO THE FORM SUBMISSION TO HANDLE THE MEAL ORDERING PROCESS
ingredientForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const gallery = document.getElementById('meal-gallery');
    const rawIngredient = ingredientInput.value;  // Get the value from the input field
    const ingredient = formatIngredient(rawIngredient); // Format the ingredient for case-insensitive search

    // CHECK IF THE USER HAS ENTERED AN INGREDIENT, IF NOT, ALERT THE USER TO ENTER ONE
    if (!ingredient) {
        alert("Please enter an ingredient first.");
        return;
    }

    const meals = await fetchMealData(ingredient); // Fetch meal data based on the formatted ingredient

    // CHECK IF MEALS IS NULL, THEN EXIT THE FUNCTION TO ALLOW THE USER TO ENTER A NEW INGREDIENT
    if (!meals) {
        if (gallery) gallery.innerHTML = "<p>Sorry, no meals found.</p>"; // Display a message in the gallery if no meals are found
        return;
    }

    gallery.innerHTML = ''; // Clear the gallery before displaying new results
    const randomMeal = randomOrder(meals); // Generate a random meal order from the fetched meals

    // UPDATE THE MEAL MESSAGE TO SHOW THE NAME OF THE RANDOM MEAL ORDERED
    const mealMessage = document.getElementById('meal-message');
    if (mealMessage) {

        mealMessage.textContent = `Random ${ingredient} meals "${randomMeal.strMeal}"`;
        mealMessage.style.fontSize = '18px';
        mealMessage.style.fontWeight = 'bold';
        mealMessage.appendChild(document.createElement('br')); 
    }

    // CREATE AN IMAGE ELEMENT FOR THE RANDOM MEAL AND APPEND IT TO THE GALLERY
    if (gallery) {
        const img = document.createElement('img');
        img.src = randomMeal.strMealThumb; // Use the meal thumbnail as the image source
        img.alt = randomMeal.strMeal || 'Meal Image';// Set alt text for accessibility
        img.style.width = '200px'; // Set a fixed width for the images
        img.style.height = 'auto'; // Maintain aspect ratio
        img.style.margin = '10px'; // Add some margin around the images
        gallery.appendChild(img);
    }
});

