$(document).ready(function() {
    let pantryIngredients = [];

    function initializeFilters() {
        const categories = [...new Set(recipes.map(r => r.category))].sort();
        const dietaryOptions = [...new Set(recipes.map(r => r.dietary))].sort();

        categories.forEach(cat => $('#category-filter').append(`<option value="${cat}">${cat}</option>`));
        dietaryOptions.forEach(diet => $('#dietary-filter').append(`<option value="${diet}">${diet}</option>`));
    }

    function displayRecipeOfTheDay() {
        const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
        // Corrected path: Look for the image in the main folder
        const imageUrl = randomRecipe.image;
        
        $('#recipe-of-the-day').html(`
            <div class="rotd-card" style="--rotd-bg: url('${imageUrl}')">
                <h2>Recipe of the Day</h2>
                <h3>${randomRecipe.title}</h3>
                <p>${randomRecipe.description}</p>
                <button class="btn btn-light" data-id="${randomRecipe.id}">View Recipe</button>
            </div>
        `);
    }

    function renderPantry() {
        $('#pantry-list').empty();
        pantryIngredients.forEach(ingredient => {
            $('#pantry-list').append(`
                <div class="pantry-item">
                    ${ingredient}
                    <button class="remove-pantry-item" data-ingredient="${ingredient}">&times;</button>
                </div>
            `);
        });
        filterRecipes();
    }

    $('#pantry-form').on('submit', function(e) {
        e.preventDefault();
        const newIngredient = $('#pantry-input').val().trim().toLowerCase();
        if (newIngredient && !pantryIngredients.includes(newIngredient)) {
            pantryIngredients.push(newIngredient);
            renderPantry();
        }
        $('#pantry-input').val('');
    });

    $(document).on('click', '.remove-pantry-item', function() {
        const ingredientToRemove = $(this).data('ingredient');
        pantryIngredients = pantryIngredients.filter(ing => ing !== ingredientToRemove);
        renderPantry();
    });

    function filterRecipes() {
        let category = $('#category-filter').val();
        let difficulty = $('#difficulty-filter').val();
        let dietary = $('#dietary-filter').val();
        let searchTerm = $('#ingredient-search').val().toLowerCase();

        let filtered = recipes.filter(r => {
            let catMatch = !category || r.category === category;
            let diffMatch = !difficulty || r.difficulty === difficulty;
            let dietMatch = !dietary || r.dietary === dietary;
            
            let searchMatch = !searchTerm ||
                              r.title.toLowerCase().includes(searchTerm) ||
                              (r.searchTerms && r.searchTerms.some(term => term.toLowerCase().includes(searchTerm))) ||
                              r.ingredients.some(i => i.toLowerCase().includes(searchTerm));

            return catMatch && diffMatch && dietMatch && searchMatch;
        });
        
        renderRecipes(filtered);
    }

    function renderRecipes(data) {
        const recipeList = $('#recipe-list');
        recipeList.empty();

        if (data.length === 0) {
            $('#no-results').show();
            return;
        }
        $('#no-results').hide();

        if (pantryIngredients.length > 0) {
            data.sort((a, b) => {
                const aMissing = a.ingredients.filter(recipeIng => 
                    !pantryIngredients.some(pantryIng => recipeIng.toLowerCase().includes(pantryIng) || pantryIng.toLowerCase().includes(recipeIng.toLowerCase()))
                ).length;
                const bMissing = b.ingredients.filter(recipeIng => 
                    !pantryIngredients.some(pantryIng => recipeIng.toLowerCase().includes(pantryIng) || pantryIng.toLowerCase().includes(recipeIng.toLowerCase()))
                ).length;
                return aMissing - bMissing;
            });
        }

        data.forEach(r => {
            let cardClass = '';
            let overlayHtml = '';

            if (pantryIngredients.length > 0) {
                const recipeIngredientsLower = r.ingredients.map(i => i.toLowerCase());
                const missingIngredients = recipeIngredientsLower.filter(recipeIng => {
                    return !pantryIngredients.some(pantryIng => recipeIng.includes(pantryIng) || pantryIng.includes(recipeIng));
                });
                
                if (missingIngredients.length === 0) {
                    cardClass = 'can-make';
                    overlayHtml = `<div class="card-overlay">You can make this! ✨</div>`;
                } else {
                    cardClass = 'missing-ingredients';
                    overlayHtml = `<div class="card-overlay">Missing ${missingIngredients.length} ingredient(s)</div>`;
                }
            }
            
            // Corrected path: Look for the image in the main folder
            const imageUrl = r.image;
            
            recipeList.append(`
              <div class="col-lg-4 col-md-6 mb-4">
                <div class="card h-100 ${cardClass}" data-id="${r.id}">
                  <img src="${imageUrl}" alt="${r.title}" class="card-img-top">
                  <div class="badge-container">
                      <span class="badge bg-secondary">${r.difficulty}</span>
                      <span class="badge" style="background-color: var(--secondary-color); color: var(--accent-color);">${r.category}</span>
                  </div>
                  <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${r.title}</h5>
                    <p class="card-text flex-grow-1">${r.description}</p>
                  </div>
                  ${overlayHtml}
                </div>
              </div>
            `);
        });
    }

    $('#category-filter, #difficulty-filter, #dietary-filter').on('change', filterRecipes);
    $('#ingredient-search').on('input', filterRecipes);

    $('#reset-filters').on('click', function() {
        $('#category-filter, #difficulty-filter, #dietary-filter').val('');
        $('#ingredient-search').val('');
        pantryIngredients = [];
        renderPantry();
    });

    $(document).on('click', '.card, .rotd-card .btn', function() {
        const id = $(this).data('id');
        const recipe = recipes.find(rec => rec.id === id);
        // Corrected path: Look for the image in the main folder
        const imageUrl = recipe.image;

        $('#modal-title').text(recipe.title);
        $('#modal-body').html(`
            <div class="row">
                <div class="col-md-6">
                    <img src="${imageUrl}" class="modal-img mb-3">
                    <p>${recipe.description}</p>
                    <p><strong>Difficulty:</strong> ${recipe.difficulty} | <strong>Genre:</strong> ${recipe.category} | <strong>Diet:</strong> ${recipe.dietary}</p>
                    <p><em>${recipe.additional}</em></p>
                </div>
                <div class="col-md-6">
                    <h5>Ingredients:</h5>
                    <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
                    <h5>Steps:</h5>
                    <ol>${recipe.steps.map(s => `<li>${s}</li>`).join('')}</ol>
                </div>
            </div>
        `);
        new bootstrap.Modal(document.getElementById('recipeModal')).show();
    });
    
    initializeFilters();
    displayRecipeOfTheDay();
    filterRecipes();
});

