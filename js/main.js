// main.js - Main application initialization and coordination

// Global variables
let map;
let islandData = [];
let mapHandler;

// Transform JSON data to required format
function transformJsonData(jsonIslands) {
    return jsonIslands.map(island => ({
        atoll: island.atoll,
        locality: island.locality,
        population: island.population,
        coordinates: {
            lat: island.coordinates.latitude,
            lng: island.coordinates.longitude
        },
        projects: {
            water: {
                funding: island.projects.water_network.funding,
                phase: island.projects.water_network.phase,
                status: island.projects.water_network.status,
                network_length_m: island.projects.water_network.network_length_m,
                connections_nos: island.projects.water_network.connections_nos,
                tanks_m3: island.projects.water_network.tanks_m3
            },
            sewerage: {
                funding: island.projects.sewerage_network.funding,
                phase: island.projects.sewerage_network.phase,
                status: island.projects.sewerage_network.status,
                network_length_m: island.projects.sewerage_network.network_length_m,
                connections: island.projects.sewerage_network.connections
            },
            harbour: {
                funding: island.projects.harbour.funding,
                phase: island.projects.harbour.phase,
                status: island.projects.harbour.status,
                info: island.projects.harbour.info
            },
            desalination: {
                funding: island.projects.desalination_plant.funding,
                phase: island.projects.desalination_plant.phase,
                status: island.projects.desalination_plant.status
            }
        },
        proposedForFunding: island.projects.proposed_for_funding || "",
        ongoingHarborProject: island.projects.ongoing_harbor_project || "",
        urbanCenters: island.projects.urban_centers || "",
        projects: {
            ...island.projects
        },
        area_sq_km: island.area_sq_km
    })).filter(island => island.coordinates.lat && island.coordinates.lng); // Only include islands with valid coordinates
}

// Initialize the application
async function initializeApp() {
    try {
        console.log('Starting application initialization...');
        
        // Step 1: Load components
        const componentsLoaded = await window.ComponentLoader.initializeComponents();
        if (!componentsLoaded) {
            throw new Error('Failed to load components');
        }
        
        // Step 2: Load island data
        const response = await fetch('maldives_projects_data.json').catch(() => {
            throw new Error('Please serve this page through a web server (e.g., python3 -m http.server 8000)');
        });
        const jsonData = await response.json();
        islandData = transformJsonData(jsonData.islands);
        
        // Make islandData globally accessible
        window.islandData = islandData;
        
        // Step 3: Create map handler
        mapHandler = new window.MapHandler();
        window.mapHandler = mapHandler;
        
        // Step 4: Setup all modules
        setupAllModules();
        
        // Step 5: Initialize event listeners after short delay to ensure DOM is ready
        setTimeout(() => {
            if (window.FilterManager) {
                window.FilterManager.setupEventListeners();
                console.log('Filter event listeners set up');
            }
        }, 200);
        
        console.log('Application initialized successfully');
        
    } catch (error) {
        console.error('Error initializing application:', error);
        
        // Show error message to user
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.innerHTML = `
                <div class="loading">
                    <div class="text-red-600">
                        <svg class="w-8 h-8 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-center">Error loading map: ${error.message}</p>
                    </div>
                </div>
            `;
        }
    }
}

// Setup all modules after components are loaded
function setupAllModules() {
    // Initialize map when Google Maps API is ready
    if (typeof google !== 'undefined' && google.maps) {
        initializeMap();
    } else {
        // Wait for Google Maps API to load
        window.initMap = initializeMap;
    }
}

// Initialize map and all related functionality
function initializeMap() {
    try {
        // Initialize map
        mapHandler.initializeMap();
        
        // Create markers
        mapHandler.createMarkers(islandData);
        
        // Setup remaining event listeners (FilterManager is already set up in initializeApp)
        window.StatisticsManager.generateAtollButtons();
        window.AtollSummaryManager.setupEventListeners();
        
        // Update initial statistics
        window.StatisticsManager.updateStatistics();
        
        console.log('Map and all modules initialized successfully');
        
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// Expose global functions for Google Maps callback
window.initMap = initializeMap;

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', initializeApp);