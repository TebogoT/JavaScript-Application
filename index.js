const ingredientForm = document.getElementById('order-form');
const ingredientInput = document.getElementById('ingredient');

//A FUNCTION TO FORMAT THE INGREDIENT INPUT FOR CASE-INSENSITIVE SEARCH
function formatIngredient(ingredient) {
    return ingredient.toLowerCase().replace(/\s+/g, '_');// Convert the ingredient to lowercase and replace spaces with underscores for consistent formatting
}


//A FUNCTION TO GENERATE A RANDOM MEAL ORDER FROM THE FETCHED MEAL LIST
function randomOrder(meals) {
    const randomIndex = Math.floor(Math.random() * meals.length);
    const randomMeal = meals[randomIndex];


    const storedOrders = sessionStorage.getItem('last_order_number');// Retrieve the last order number from sessionStorage

    const currentOrderNumber = storedOrders ? parseInt(storedOrders, 10) : 0; 
    const nextOrderNumber = currentOrderNumber + 1; 
    
    // CREATE AN ORDER OBJECT TO STORE IN sessionStorage
    const myOrder = {
        description: randomMeal.strMeal,
        orderNumber: nextOrderNumber,
        completionStatus: 'incomplete'
    };

    // RETRIEVE THE EXISTING ORDERS FROM sessionStorage, ADD THE NEW ORDER TO THE ARRAY, AND STORE IT BACK IN sessionStorage
    const randomOrders = sessionStorage.getItem('all_orders');// Retrieve the existing orders from sessionStorage

    const ordersArray = randomOrders ? JSON.parse(randomOrders) : [];// Parse the existing orders or initialize an empty array if none exist
    ordersArray.push(myOrder);// Add the new order to the orders array
    sessionStorage.setItem('all_orders', JSON.stringify(ordersArray)); // Store the updated orders array in sessionStorage
    sessionStorage.setItem('last_order_number', nextOrderNumber.toString()); // Store the latest order number
    return randomMeal; // Return the randomly selected meal

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
    const orderDisplay = document.getElementById('incomplete-orders-list');

    orderDisplay.innerHTML = ''; // Clear the order display before showing new orders

    // LOOP THROUGH sessionStorage TO FIND ALL ORDERS AND CHECK THEIR COMPLETION STATUS
    const sessionOrders = sessionStorage.getItem('all_orders'); // Retrieve the stored orders from sessionStorage
    const allOrders = sessionOrders ? JSON.parse(sessionOrders) : []; // Parse the stored orders or initialize an empty array if none exist

    const incompleteOrdersList = allOrders.filter(order => order.completionStatus === 'incomplete'); // Filter the orders to get only incomplete ones

    // CHECK IF INCOMPLETE ORDERS WERE FOUND AND DISPLAY THEM, OTHERWISE DISPLAY A MESSAGE
    if (incompleteOrdersList.length === 0) {
        orderDisplay.innerHTML = "<p>No incomplete orders found.</p>"; // Display a message if no incomplete orders are found
    } else {
        incompleteOrdersList.forEach(order => {
            orderDisplay.innerHTML += `<li>Order #${order.orderNumber}: ${order.description}</li>`; // Display each incomplete order in the order display element
        });
    }
}


// A FUNCTION TO SHOW COMPLETED ORDERS STORED IN sessionStorage AND ALLOW THE USER TO MARK INCOMPLETE ORDERS AS COMPLETED
function sessionCompletedOrderList() {
    const completedOrderDisplay = document.getElementById('completed-orders-list');

    completedOrderDisplay.innerHTML = ''; // Clear the completed order display before showing new orders

  // LOOP THROUGH sessionStorage TO FIND ALL ORDERS AND CHECK THEIR COMPLETION STATUS
    const sessionOrders = sessionStorage.getItem('all_orders'); // Retrieve the stored orders from sessionStorage
    const allOrders = sessionOrders ? JSON.parse(sessionOrders) : []; // Parse the stored orders or initialize an empty array if none exist

    const completedOrdersList = allOrders.filter(order => order.completionStatus === 'completed'); // Filter the orders to get only completed ones

    if (completedOrdersList.length === 0) {
        completedOrderDisplay.innerHTML = "<p>No completed orders found.</p>"; // Display a message if no completed orders are found
        return;
    }
    
    completedOrdersList.forEach(order => {
        completedOrderDisplay.innerHTML += `<li>Order #${order.orderNumber}: ${order.description}</li>`; // Display each completed order in the completed order display element
    });
}



// A FUNCTION TO SHOW COMPLETED ORDERS AND ALLOW THE USER TO MARK INCOMPLETE ORDERS AS COMPLETED
function showCompletedOrders() {
    const userInput = prompt("Enter order number to mark as completed:");
    const orderNumber = parseInt(userInput, 10); // Convert the user input to an integer  
    
    if (orderNumber === 0) {
        return;
    }

    if (isNaN(orderNumber)) {
        alert("Invalid input. Please enter a valid order number.");
        return;
    }

    const rawOrder = sessionStorage.getItem('all_orders'); // Retrieve the order from sessionStorage using the constructed key
    const allOrders = rawOrder ? JSON.parse(rawOrder) : []; // Parse the stored orders or initialize an empty array if none exist
    const targetOrderIndex = allOrders.findIndex(order => order.orderNumber === orderNumber); // Find the index of the order with the matching order number



    if (targetOrderIndex === -1) {
        alert(`Order number ${orderNumber} not found. Please enter a valid order number.`);
        return;
    }


    
    allOrders[targetOrderIndex].completionStatus = 'completed';
    sessionStorage.setItem('all_orders', JSON.stringify(allOrders));

    alert(`Order number ${orderNumber} marked as completed.`);

    showIncompleteOrders(); // Call the function to show incomplete orders after marking one as completed
    sessionCompletedOrderList(); // Call the function to show completed orders and allow the user to mark incomplete orders as completed
}


// ADD AN EVENT LISTENER TO THE INGREDIENT FORM TO HANDLE THE SUBMISSION AND FETCH MEAL DATA BASED ON THE USER'S INPUT
if (ingredientForm) {
    ingredientForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const gallery = document.getElementById('meal-gallery');// Get the gallery element to display meal images
        const rawIngredient = ingredientInput.value;  // Get the value from the input field
        const ingredient = formatIngredient(rawIngredient); // Format the ingredient for case-insensitive search

        // CHECK IF THE USER HAS ENTERED AN INGREDIENT, IF NOT, ALERT THE USER TO ENTER ONE
        if (!rawIngredient.trim()) {
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

            mealMessage.innerHTML = `Chefs selection of ${ingredient} inspired meals <br><span id="meal-name">${randomMeal.strMeal}</span>`;
            mealMessage.appendChild(document.getElementById('meal-name'));
        }

        // CREATE AN IMAGE ELEMENT FOR THE RANDOM MEAL AND APPEND IT TO THE GALLERY
        if (gallery) {
            const img = document.createElement('img');
            img.src = randomMeal.strMealThumb; // Use the meal thumbnail as the image source
            img.alt = randomMeal.strMeal || 'Meal Image';// Set alt text for accessibility
            img.style.width = '400px'; // Set a fixed width for the images
            img.style.height = 'auto'; // Maintain aspect ratio
            img.style.margin = '10px'; // Add some margin around the images
            gallery.appendChild(img);
        }

        showIncompleteOrders(); // Call the function to show incomplete orders after placing a new order
        sessionCompletedOrderList(); // Call the function to show completed orders and allow the user to mark incomplete orders as completed
    });
}

// ADD AN EVENT LISTENER TO THE "VIEW COMPLETED ORDERS" BUTTON TO SHOW COMPLETED ORDERS WHEN CLICKED
const markCompleteButton = document.getElementById('mark-complete');
if (markCompleteButton) {
    markCompleteButton.addEventListener('click', () => {
        showCompletedOrders();
    });
}
