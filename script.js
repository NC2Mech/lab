// Global variables
let attractions = [];
let currentIndex = 0;
let filteredAttractions = [];
let currentGrouping = 'none';
let currentGroupValue = '';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Load XML data
    loadXMLData();
    
    // Set up event listeners
    document.getElementById('prevBtn').addEventListener('click', showPreviousAttraction);
    document.getElementById('nextBtn').addEventListener('click', showNextAttraction);
    document.getElementById('resetBtn').addEventListener('click', showAllAttractions);
    document.getElementById('groupBy').addEventListener('change', handleGroupByChange);
    document.getElementById('groupValue').addEventListener('change', handleGroupValueChange);
    
    // Set up image modal
    const modal = document.getElementById('imagePreviewModal');
    const closeModal = document.querySelector('.close-modal');
    
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Function to load XML data
function loadXMLData() {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                parseXML(this);
            } else {
                showError("Failed to load attraction data. Please try again later.");
            }
        }
    };
    xhttp.open("GET", "attractions.xml", true);
    xhttp.send();
}

// Function to show error message
function showError(message) {
    const container = document.getElementById('attractionsList');
    container.innerHTML = `<div class="error-message">${message}</div>`;
}

// Function to parse XML data
function parseXML(xml) {
    try {
        const xmlDoc = xml.responseXML;
        const attractionNodes = xmlDoc.getElementsByTagName("Attraction");
        
        // Convert XML to array of objects
        for (let i = 0; i < attractionNodes.length; i++) {
            const attraction = {
                placeId: getXMLNodeValue(attractionNodes[i], "PlaceID"),
                name: getXMLNodeValue(attractionNodes[i], "Name"),
                city: getXMLNodeValue(attractionNodes[i], "City"),
                state: getXMLNodeValue(attractionNodes[i], "State"),
                description: getXMLNodeValue(attractionNodes[i], "Description"),
                openingHours: {
                    hours: getXMLNodeValues(attractionNodes[i], "Hours"),
                    weekendStatus: getXMLNodeValue(attractionNodes[i], "WeekendStatus")
                },
                category: getXMLNodeValue(attractionNodes[i], "Category"),
                ticket: getXMLNodeValue(attractionNodes[i], "Ticket"),
                price: getXMLNodeValue(attractionNodes[i], "Price"),
                image: getXMLNodeValue(attractionNodes[i], "Image")
            };
            
            attractions.push(attraction);
        }
        
        // Initialize the display
        filteredAttractions = [...attractions];
        displayAllAttractions();
    } catch (error) {
        showError("Error parsing attraction data: " + error.message);
    }
}

// Helper function to get XML node value
function getXMLNodeValue(parent, tagName) {
    try {
        const element = parent.getElementsByTagName(tagName)[0];
        return element ? element.textContent : "";
    } catch (error) {
        console.error(`Error getting value for ${tagName}:`, error);
        return "";
    }
}

// Helper function to get multiple XML node values
function getXMLNodeValues(parent, tagName) {
    try {
        const elements = parent.getElementsByTagName(tagName);
        const values = [];
        
        for (let i = 0; i < elements.length; i++) {
            values.push(elements[i].textContent);
        }
        
        return values;
    } catch (error) {
        console.error(`Error getting values for ${tagName}:`, error);
        return [];
    }
}

// Function to display all attractions
function displayAllAttractions() {
    const container = document.getElementById('attractionsList');
    container.innerHTML = '';
    
    if (filteredAttractions.length === 0) {
        container.innerHTML = '<div class="no-results">No attractions found.</div>';
        return;
    }
    
    filteredAttractions.forEach((attraction, index) => {
        const card = createAttractionCard(attraction, index);
        container.appendChild(card);
    });
    
    // Hide detailed view
    document.getElementById('attractionDetails').style.display = 'none';
    
    updateNavigationButtons();
}

// Function to create attraction card
function createAttractionCard(attraction, index) {
    const card = document.createElement('div');
    card.className = 'attraction-card';
    card.dataset.index = index;
    
    // Add image at the top
    const image = document.createElement('img');
    image.className = 'card-image';
    image.src = attraction.image;
    image.alt = attraction.name;
    image.onerror = function() {
        this.src = 'images/placeholder.jpg'; // Fallback image
        this.alt = 'Image not available';
    };
    
    const header = document.createElement('div');
    header.className = 'card-header';
    
    const title = document.createElement('h2');
    title.textContent = attraction.name;
    
    const placeId = document.createElement('div');
    placeId.className = 'place-id';
    placeId.textContent = attraction.placeId;
    
    header.appendChild(title);
    header.appendChild(placeId);
    
    const body = document.createElement('div');
    body.className = 'card-body';
    
    const location = document.createElement('p');
    location.innerHTML = `<strong>Location:</strong> ${attraction.city}, ${attraction.state}`;
    
    const category = document.createElement('p');
    category.innerHTML = `<strong>Category:</strong> ${attraction.category}`;
    
    body.appendChild(location);
    body.appendChild(category);
    
    const footer = document.createElement('div');
    footer.className = 'card-footer';
    
    const ticketInfo = document.createElement('span');
    ticketInfo.textContent = attraction.ticket === 'Yes' 
        ? `Ticket: RM ${parseFloat(attraction.price).toFixed(2)}` 
        : 'Free Entry';
    
    footer.appendChild(ticketInfo);
    
    card.appendChild(image);
    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);
    
    // Add click event
    card.addEventListener('click', () => {
        displayAttractionDetails(attraction);
    });
    
    return card;
}

// Function to display attraction details
function displayAttractionDetails(attraction) {
    const container = document.getElementById('attractionDetails');
    container.innerHTML = '';
    
    // Create detail header
    const header = document.createElement('div');
    header.className = 'detail-header';
    
    const title = document.createElement('h2');
    title.textContent = attraction.name;
    
    const placeId = document.createElement('div');
    placeId.className = 'place-id';
    placeId.textContent = attraction.placeId;
    
    header.appendChild(title);
    header.appendChild(placeId);
    
    // Create detail content
    const content = document.createElement('div');
    content.className = 'detail-content';
    
    // Image section
    const imageSection = document.createElement('div');
    imageSection.className = 'detail-image';
    
    const image = document.createElement('img');
    image.src = attraction.image;
    image.alt = attraction.name;
    image.onerror = function() {
        this.src = 'images/placeholder.jpg'; // Fallback image
        this.alt = 'Image not available';
    };
    
    // Add click event to open image in modal
    image.addEventListener('click', function() {
        const modal = document.getElementById('imagePreviewModal');
        const modalImg = document.getElementById('modalImage');
        modal.style.display = 'block';
        modalImg.src = this.src;
    });
    
    imageSection.appendChild(image);
    
    // Info section
    const infoSection = document.createElement('div');
    infoSection.className = 'detail-info';
    
    const description = document.createElement('p');
    description.innerHTML = `<strong>Description:</strong> ${attraction.description}`;
    
    const location = document.createElement('p');
    location.innerHTML = `<strong>Location:</strong> ${attraction.city}, ${attraction.state}`;
    
    const category = document.createElement('p');
    category.innerHTML = `<strong>Category:</strong> ${attraction.category}`;
    
    const openingHours = document.createElement('p');
    let hoursText = '';
    
    if (attraction.openingHours.hours.length > 0) {
        hoursText = attraction.openingHours.hours.join('<br>');
    } else {
        hoursText = 'Not specified';
    }
    
    openingHours.innerHTML = `<strong>Opening Hours:</strong> <br>${hoursText}`;
    
    const weekend = document.createElement('p');
    weekend.innerHTML = `<strong>Weekend:</strong> ${attraction.openingHours.weekendStatus}`;
    
    const ticket = document.createElement('p');
    ticket.innerHTML = `<strong>Ticket:</strong> ${attraction.ticket}`;
    
    const price = document.createElement('p');
    price.innerHTML = `<strong>Price (RM):</strong> ${parseFloat(attraction.price).toFixed(2)}`;
    
    infoSection.appendChild(description);
    infoSection.appendChild(location);
    infoSection.appendChild(category);
    infoSection.appendChild(openingHours);
    infoSection.appendChild(weekend);
    infoSection.appendChild(ticket);
    infoSection.appendChild(price);
    
    content.appendChild(imageSection);
    content.appendChild(infoSection);
    
    // Add all sections to container
    container.appendChild(header);
    container.appendChild(content);
    
    // Show the details
    container.style.display = 'block';
    
    // Scroll to details
    container.scrollIntoView({ behavior: 'smooth' });
}

// Function to handle group by change
function handleGroupByChange() {
    const groupBy = document.getElementById('groupBy').value;
    currentGrouping = groupBy;
    
    const groupValueContainer = document.getElementById('groupValueContainer');
    const groupValueSelect = document.getElementById('groupValue');
    
    if (groupBy === 'none') {
        groupValueContainer.style.display = 'none';
        showAllAttractions();
        return;
    }
    
    // Get unique values for the selected grouping
    const uniqueValues = [...new Set(attractions.map(attraction => {
        if (groupBy === 'state') return attraction.state;
        if (groupBy === 'city') return attraction.city;
        if (groupBy === 'category') return attraction.category;
    }))].sort();
    
    // Populate the group value select
    groupValueSelect.innerHTML = '';
    uniqueValues.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        groupValueSelect.appendChild(option);
    });
    
    // Show the group value select
    groupValueContainer.style.display = 'flex';
    
    // Filter attractions by the first value
    if (uniqueValues.length > 0) {
        currentGroupValue = uniqueValues[0];
        groupValueSelect.value = currentGroupValue;
        filterAttractionsByGroup();
    }
}

// Function to handle group value change
function handleGroupValueChange() {
    currentGroupValue = document.getElementById('groupValue').value;
    filterAttractionsByGroup();
}

// Function to filter attractions by group
function filterAttractionsByGroup() {
    if (currentGrouping === 'none') {
        filteredAttractions = [...attractions];
    } else {
        filteredAttractions = attractions.filter(attraction => {
            if (currentGrouping === 'state') return attraction.state === currentGroupValue;
            if (currentGrouping === 'city') return attraction.city === currentGroupValue;
            if (currentGrouping === 'category') return attraction.category === currentGroupValue;
            return false;
        });
    }
    
    displayAllAttractions();
}

// Function to show previous attraction
function showPreviousAttraction() {
    if (currentGrouping !== 'none') {
        // Handle previous in grouped view
        const groupValues = [...new Set(attractions.map(attraction => {
            if (currentGrouping === 'state') return attraction.state;
            if (currentGrouping === 'city') return attraction.city;
            if (currentGrouping === 'category') return attraction.category;
        }))].sort();
        
        const currentGroupIndex = groupValues.indexOf(currentGroupValue);
        if (currentGroupIndex > 0) {
            currentGroupValue = groupValues[currentGroupIndex - 1];
            document.getElementById('groupValue').value = currentGroupValue;
            filterAttractionsByGroup();
        }
    } else {
        currentIndex = Math.max(0, currentIndex - 1);
        updateNavigationButtons();
    }
}

// Function to show next attraction
function showNextAttraction() {
    if (currentGrouping !== 'none') {
        // Handle next in grouped view
        const groupValues = [...new Set(attractions.map(attraction => {
            if (currentGrouping === 'state') return attraction.state;
            if (currentGrouping === 'city') return attraction.city;
            if (currentGrouping === 'category') return attraction.category;
        }))].sort();
        
        const currentGroupIndex = groupValues.indexOf(currentGroupValue);
        if (currentGroupIndex < groupValues.length - 1) {
            currentGroupValue = groupValues[currentGroupIndex + 1];
            document.getElementById('groupValue').value = currentGroupValue;
            filterAttractionsByGroup();
        }
    } else {
        currentIndex = Math.min(currentIndex + 1, filteredAttractions.length - 1);
        updateNavigationButtons();
    }
}

// Function to update navigation buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (currentGrouping !== 'none') {
        // Handle button state for grouped view
        const groupValues = [...new Set(attractions.map(attraction => {
            if (currentGrouping === 'state') return attraction.state;
            if (currentGrouping === 'city') return attraction.city;
            if (currentGrouping === 'category') return attraction.category;
        }))].sort();
        
        const currentGroupIndex = groupValues.indexOf(currentGroupValue);
        prevBtn.disabled = currentGroupIndex === 0;
        nextBtn.disabled = currentGroupIndex >= groupValues.length - 1;
    } else {
        // Handle button state for individual view
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= filteredAttractions.length - 1;
    }
}

// Function to show all attractions
function showAllAttractions() {
    currentGrouping = 'none';
    document.getElementById('groupBy').value = 'none';
    document.getElementById('groupValueContainer').style.display = 'none';
    
    filteredAttractions = [...attractions];
    currentIndex = 0;
    
    displayAllAttractions();
}
var btn = document.querySelector("button");

var dropdown = document.querySelector(".dropdown-options");

var optionLinks = document.querySelectorAll(".option a");

console.log(optionLinks);

btn.addEventListener("click", function(e) {
   e.preventDefault();
   console.log("btn");
   dropdown.classList.toggle("open");
});

var clickFn = function(e) {
   e.preventDefault();

   dropdown.classList.remove("open");

   btn.innerHTML = this.text;
   var activeLink = document.querySelector(".option .active")

   if (activeLink) {
      activeLink.classList.remove("active");
   }

   this.classList.add("active");
}

for (var i = 0; i < optionLinks.length; i++) {
   optionLinks[i].addEventListener("mousedown", clickFn, false);
}