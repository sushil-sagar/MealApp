//Using IIFE to maintain Scope
(() => {
    //DECLARING VARIABLES
    var favoritesArray = new Array();
    var onDomItemsArray = new Array();

    //getting home elements by their IDs
    const itemsContainer = document.getElementById("items-container");
    const itemContainer = document.getElementById("item-container");
    const searchInput = document.getElementById("search-input");

    //getting favorites elements by their IDs
    const favoritesContainer = document.getElementById("favorites-container");
    const favoriteItemsContainer = document.getElementById("favorite-items");
    const closeFavoriteBtn = document.getElementById("close-favorite");
    const favItems = document.getElementById("fav-items");

    //getting item description elements by their IDs
    const itemDescriptionContainer = document.getElementById("item-description-container");
    const itemDescription = document.getElementById("item-description");

    //for input

    //getting menu elements by their IDs
    //getting home elements by their IDs
    const closeMenuBtn = document.getElementById("close-menu-btn");
    const menuContainer = document.getElementById("menu-container");
    const favoriteItemCount = document.getElementById("favorite-items-count");
    //for themes


    // calling functions on app start
    onLoad();
    renderItems();
    renderFromLocalStorage();
    renderThemeFromLocalStorage();
    renderFavoriteItems();

    //loading 6 random items on DOM on app start
    async function onLoad() {
        // emptying array before populating it with items
        onDomItemsArray = [];
        searchInput.value="";

        //fetching random items using API 
        for (let i = 0; i < 6; i++) {
            let response = await fetch("https://www.themealdb.com/api/json/v1/1/random.php")
            let data = await response.json();
            let dataArray = data.meals;
            let arrElement = dataArray[0];
            let itemToPush = {
                arrElement: arrElement,
                isFavorite: false
            }
            onDomItemsArray.push(itemToPush);
        }
        //to render fetched items on DOM
        renderItems();
    }

    //function to render items on DOM
    function renderItems() {
        itemsContainer.innerHTML = "";
        for (let i = 0; i < onDomItemsArray.length; i++) {
            let onDOMitem = onDomItemsArray[i];

            let item = document.createElement("div");
            item.classList.add("item-container", "hover-anim");
            item.id = "item-container"
            item.dataset.id = onDOMitem.arrElement.idMeal
            if (onDOMitem.isFavorite) {
                item.innerHTML = `<img id="item-thumbnail" data-id="${onDOMitem.arrElement.idMeal}" src="${onDOMitem.arrElement.strMealThumb}" alt="" class="item-image">
            <h2 id="item-name" data-id="${onDOMitem.arrElement.idMeal}">${onDOMitem.arrElement.strMeal}</h2>
        <img src="Images/icons/added-favorite.png" alt="" id="add-favorite-${onDOMitem.arrElement.idMeal}" class="add-to-favorite" data-id="${onDOMitem.arrElement.idMeal}">`

            } else {
                item.innerHTML = `<img id="item-thumbnail" data-id="${onDOMitem.arrElement.idMeal}" src="${onDOMitem.arrElement.strMealThumb}" alt="" class="item-image">
            <h2 id="item-name" data-id="${onDOMitem.arrElement.idMeal}">${onDOMitem.arrElement.strMeal}</h2>
        <img src="Images/icons/add-to-favorite.png" alt="" id="add-favorite-${onDOMitem.arrElement.idMeal}" class="add-to-favorite" data-id="${onDOMitem.arrElement.idMeal}">`
            }
            itemsContainer.append(item);
        }
    }






    // ==============FOT TAKING INPUT===========
    //setting keyup event listener to the input
    searchInput.addEventListener("keyup", keyUpHandler);

    //to show the result on DOM as the user types or presses enter
    function keyUpHandler(event) {

        let query = event.target.value
        if (event.key == "Enter") {
            fetchItems(query);
            event.target.value = "";
            return;
        }
        //getting input by user and fetching items accordingly
        fetchItems(query);
    }

    function onSearchHandler() {
        let query = searchInput.value;
        fetchItems(query);
    }

    //function to fetch items according to user input
    async function fetchItems(query) {
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        let data = await response.json();
        if (data.meals != null) {
            let dataArray = data.meals;

            onDomItemsArray = [];
            for (let i = 0; i < dataArray.length; i++) {
                let item = favoritesArray.find((favItem) => {
                    return dataArray[i].idMeal == favItem.arrElement.idMeal;
                });
                let itemToPush;
                if (item) {
                    itemToPush = {
                        arrElement: dataArray[i],
                        isFavorite: true
                    }
                } else {
                    itemToPush = {
                        arrElement: dataArray[i],
                        isFavorite: false
                    }
                }
                onDomItemsArray.push(itemToPush);

            }
        } else onDomItemsArray = [];
        renderItems();
    }

    // ======FUNCTIONS FOR FAVORITES=======

    //to toggle whether iter is favorite or not
    function toggleFavorite(itemID) {
        const item = onDomItemsArray.find((item) => {
            return itemID == item.arrElement.idMeal
        });

        const favoriteIcon=document.getElementById(`add-favorite-${itemID}`);     
        if (item) {
            item.isFavorite = !item.isFavorite;
            if (item.isFavorite) {
                favoritesArray.push(item);
                favoriteIcon.setAttribute("src","Images/icons/added-favorite.png");
                addToLocalStorage(item);
            } else {
                favoritesArray.splice(favoritesArray.indexOf(item), 1);
                favoriteIcon.setAttribute("src","Images/icons/add-to-favorite.png");
                deleteFromLocalStorage(itemID);
            }
            // to delete items from favorites, if currently the item is not in onDomItemsArray
        } else deleteFavorite(itemID);

        renderFavoriteItems();
    }
    //function to delete items from the favorites, if currently the item is not in onDomItemsArray
    function deleteFavorite(itemId) {
        const item = favoritesArray.find((item) => {
            return item.arrElement.idMeal == itemId;
        });
        if (item) {
            favoritesArray.splice(favoritesArray.indexOf(item), 1);
            deleteFromLocalStorage(itemId);
        }
        //to update the DOM after removing the favorites
        renderItems();

    }

    //function to render favorite items on DOM
    function renderFavoriteItems() {
        favItems.innerHTML = "";
        for (let favorite of favoritesArray) {
            let item = document.createElement("div");
            item.classList.add("item-container", "hover-anim");
            item.dataset.id = favorite.arrElement.idMeal
            item.id = "item-container"
            item.innerHTML = `<img id="item-thumbnail" data-id="${favorite.arrElement.idMeal}" src="${favorite.arrElement.strMealThumb}" alt="" class="item-image">
            <h2 id="item-name" data-id="${favorite.arrElement.idMeal}">${favorite.arrElement.strMeal}</h2>
        <img src="Images/icons/added-favorite.png" alt="" id="add-to-favorite" class="add-to-favorite" data-id="${favorite.arrElement.idMeal}">`

            favItems.append(item);
        }
        //updating favoriteItems Count
        updateFavoriteItemCount();
    }
    //function to update favoriteItems count
    function updateFavoriteItemCount() {
        favoriteItemCount.innerText = `Favorites Count: ${favoritesArray.length}`
    }

    // ================== ITEM'S  DESCRIPTION==================== 
    //function to render item's description on DOM
    function renderItemDescription(itemId) {
        //searching the item with item Id in onDomItemsArray
        const item = onDomItemsArray.find((item) => {
            return item.arrElement.idMeal == itemId;
        });

        //if found in onDomItemsArray then 
        if (item) {
            itemDescription.innerHTML = descriptionHTML(item);
            itemDescriptionContainer.style.display = "flex";

            //and if not, then searching the item in favoritesArray
        } else {
            const favorite = favoritesArray.find((item) => {
                return item.arrElement.idMeal == itemId;
            });
            if (favorite) {
                itemDescription.innerHTML = descriptionHTML(favorite);
                itemDescriptionContainer.style.display = "flex";
            }
        }
    }
    //html to append to container
    function descriptionHTML(item) {
        return `<img src="Images/icons/close.png" alt="close Btn" class="close-btn on-hover-icon" id="close-description">
        <img src="${item.arrElement.strMealThumb}" alt="" class="description-item-image" id="description-item-image">
        <h1 class="item-name">${item.arrElement.strMeal}</h1>
        <p class="item-category"><strong>Category:</strong> <span>${item.arrElement.strCategory}</span></p>
        <p class="item-origin"><strong>Origin: </strong><span>${item.arrElement.strArea}</span></p>
        <p class="item-cooking-instructions"><strong>Instructions: </strong>
          <div class="instructions-container">
            <p>${item.arrElement.strInstructions}</p>
          </div>
        </p>
        <a class="play-video-link" href="${item.arrElement.strYoutube}" target="_blank">
          <p class="play-video">Play Video</p>
          <img src="Images/icons/play-button-arrowhead.png" alt="" class="play-video-icon">
        </a>`
    }







    // ========GLOBAL EVENT LISTENER===========
    // declaring fonts
    let fontCursive = "cursive";
    let fontNormal = `'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif`

    //theme object to store the colors and font style
    let theme = {
        itemColor: "rgb(0, 0, 0)",
        headerColor: "rgb(255, 43, 43)",
        backgroundColor: "rgb(255, 70, 70)",
        fontFamily: fontCursive

    };

    //setting click event listener to whole document
    document.addEventListener("click", (event) => {
        let targetId = event.target.id;

        //adding event listener to refresh and load random items to DOM when clicked heading/logo
        if (targetId == "app-logo"){
            onLoad(); renderItems();
        } 
        else if (targetId == "heading"){
            onLoad(); renderItems();
        }

        //adding event listeners to favorite page
        else if (targetId == "close-favorite" ||targetId == "favorites-container") favoritesContainer.style.display = "none";
        else if (targetId == "go-to-favorite-icon"||targetId == "go-to-favorite-text") favoritesContainer.style.display = "flex";

        //adding event listener to individual items
        //to add/remove favorite
        else if (event.target.classList[0] == "add-to-favorite") toggleFavorite(event.target.dataset.id);
    
        //to show the description of a item
        else if (targetId == "item-container"||targetId == "item-thumbnail"||targetId == "item-name") renderItemDescription(event.target.dataset.id);


        // to close description page
        else if (targetId == "close-description"||targetId == "item-description-container") itemDescriptionContainer.style.display = "none";

        //to search items using input box
        else if (targetId == "search-icon") onSearchHandler();

        //setting event listeners for menu
        else if (targetId == "menu-icon") menuContainer.style.display = "flex";
        else if (targetId == "close-menu-btn"||targetId == "menu-container") menuContainer.style.display = "none";

        //to change font to Normal
        else if (targetId == "change-to-normal") {
            document.documentElement.style.setProperty("--fontFamily", fontNormal);
            theme.fontFamily = fontNormal;
            storeThemeInLocalStorage(theme);
        }

        //to change font to cursive
        else if (targetId == "change-to-cursive") {
            document.documentElement.style.setProperty("--fontFamily", fontCursive);
            theme.fontFamily = fontCursive;
            storeThemeInLocalStorage(theme);
        }

        //to go to the favorites from menu
        else if (targetId == "favorite-items-count") {
            menuContainer.style.display = "none";
            renderFavoriteItems();
            favoritesContainer.style.display = "flex";
        }

        //setting event listeners for theme change

        else if (targetId === "0") {
            theme.headerColor = "rgb(0, 0, 0)"
            theme.itemColor = "rgb(0, 0, 0)"
            theme.backgroundColor = "rgb(255, 255, 255)"
            setThemeProperties(theme.headerColor, theme.itemColor, theme.backgroundColor, theme.fontFamily);
            storeThemeInLocalStorage(theme);
        }

        else if (targetId == 1) {
            theme.headerColor = "rgb(255, 43, 43)"
            theme.itemColor = "rgb(0, 0, 0)"
            theme.backgroundColor = "rgb(255, 70, 70)"
            setThemeProperties(theme.headerColor, theme.itemColor, theme.backgroundColor, theme.fontFamily);
            storeThemeInLocalStorage(theme);
        }

        else if (targetId == 2) {
            theme.headerColor = "rgb(0, 150, 137)"
            theme.itemColor = "rgb(90, 90, 90)"
            theme.backgroundColor = "rgb(125, 207, 200)"
            setThemeProperties(theme.headerColor, theme.itemColor, theme.backgroundColor, theme.fontFamily);
            storeThemeInLocalStorage(theme);
        }



    });


    //function to set theme properties
    function setThemeProperties(headerColor, itemColor, backgroundColor, fontFamily) {
        document.documentElement.style.setProperty("--headerColor", headerColor);
        document.documentElement.style.setProperty("--itemColor", itemColor);
        document.documentElement.style.setProperty("--backgroundColor", backgroundColor);
        document.documentElement.style.setProperty("--fontFamily", fontFamily);
    }

    // ==========LOCAL STORAGE============

    //function to store favorite items in the local storage
    function addToLocalStorage(item) {
        const favoriteItems = JSON.parse(localStorage.getItem("favoriteItems")) || [];
        favoriteItems.push(item);
        localStorage.setItem("favoriteItems", JSON.stringify(favoriteItems));
    }

    //function to delete favorite items from the local storage
    function deleteFromLocalStorage(itemId) {
        const favoriteItems = JSON.parse(localStorage.getItem("favoriteItems"));
        const itemIndex = favoriteItems.findIndex((item) => {
            return item.arrElement.idMeal == itemId;
        });
        if (itemIndex !== -1) {
            favoriteItems.splice(itemIndex, 1);
            localStorage.setItem("favoriteItems", JSON.stringify(favoriteItems));
        }

    }

    //function to render task to DOM when page app reloads
    function renderFromLocalStorage() {
        const favoriteItems = JSON.parse(localStorage.getItem("favoriteItems"));
        if (favoriteItems !== null) favoritesArray.push(...favoriteItems);
    }

    //function to store the theme and font style in local storage
    function storeThemeInLocalStorage(theme) {
        localStorage.setItem("mealsAppTheme", JSON.stringify(theme));
    }

    //to set the theme from local storage
    function renderThemeFromLocalStorage() {
        const theme = JSON.parse(localStorage.getItem("mealsAppTheme"));
        if (theme !== null) {
            setThemeProperties(theme.headerColor, theme.itemColor, theme.backgroundColor, theme.fontFamily);

        }
    }
})();