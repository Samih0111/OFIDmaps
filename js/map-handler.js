// map-handler.js - Map functionality module

class MapHandler {
    constructor() {
        this.map = null;
        this.markers = [];
        this.infoWindow = null;
        this.currentFilter = { funding: [], phase: [], projectType: [], proposedForFunding: false, ongoingHarbor: false, urbanCenters: false };
    }

    // Initialize Google Maps
    initializeMap() {
        const mapOptions = {
            zoom: 7,
            center: { lat: 3.2028, lng: 73.2207 }, // Center of Maldives
            mapTypeId: google.maps.MapTypeId.SATELLITE,
            styles: [
                {
                    featureType: 'water',
                    elementType: 'geometry',
                    stylers: [{ color: '#0099cc' }]
                }
            ]
        };

        this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
        this.infoWindow = new google.maps.InfoWindow();
        
        console.log('Map initialized successfully');
    }

    // Create markers for all islands
    createMarkers(islandData) {
        if (!this.map || !islandData) return;

        // Clear existing markers
        this.clearMarkers();

        islandData.forEach(island => {
            if (island.coordinates && (island.coordinates.lat || island.coordinates.latitude) && 
                (island.coordinates.lng || island.coordinates.longitude)) {
                // Create separate markers for each funding agency that has projects on this island
                const fundingAgencies = this.getFundingAgenciesForIsland(island);
                
                fundingAgencies.forEach((agency, index) => {
                    this.createMarker(island, agency, index, fundingAgencies.length);
                });
            }
        });

        console.log(`Created ${this.markers.length} markers`);
    }

    // Create individual marker
    createMarker(island, fundingAgency, index, totalAgencies) {
        // Calculate slight offset for multiple markers on same island
        const offset = totalAgencies > 1 ? (index - (totalAgencies - 1) / 2) * 0.002 : 0;
        
        const marker = new google.maps.Marker({
            position: {
                lat: (island.coordinates.lat || island.coordinates.latitude) + offset,
                lng: (island.coordinates.lng || island.coordinates.longitude) + offset
            },
            map: this.map,
            title: `${island.locality} - ${fundingAgency}`,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: this.getMarkerScale(fundingAgency),
                fillColor: this.getMarkerColorByAgency(fundingAgency),
                fillOpacity: 0.3,
                strokeColor: 'rgba(255, 255, 255, 0.5)',
                strokeWeight: 2
            }
        });

        // Add click listener for info window
        marker.addListener('click', () => {
            this.showInfoWindow(marker, island, fundingAgency);
        });

        // Store reference
        marker.islandData = island;
        marker.fundingAgency = fundingAgency;
        this.markers.push(marker);
    }

    // Get funding agencies for an island
    getFundingAgenciesForIsland(island) {
        const agencies = new Set();
        if (island.projects) {
            Object.values(island.projects).forEach(project => {
                if (project && project.funding && project.funding !== null && project.funding !== '') {
                    agencies.add(project.funding);
                }
            });
        }
        return Array.from(agencies);
    }

    // Get marker scale based on funding agency
    getMarkerScale(fundingAgency) {
        switch(fundingAgency) {
            case 'OFID': return 11;
            case 'GOV (PSIP)': return 15;
            case 'EXIM (India)': return 7;
            case 'IDB': return 11;
            default: return 8;
        }
    }

    // Get marker color based on funding agency
    getMarkerColorByAgency(fundingAgency) {
        switch(fundingAgency) {
            case 'OFID': return '#007bff';
            case 'GOV (PSIP)': return '#28a745';
            case 'EXIM (India)': return '#dc3545';
            case 'IDB': return '#ffc107';
            default: return '#6c757d';
        }
    }

    // Show info window for marker
    showInfoWindow(marker, island, focusFundingAgency) {
        const projects = island.projects;
        const activeProjects = Object.entries(projects)
            .filter(([key, project]) => project.funding)
            .map(([type, project]) => {
                const isHighlighted = project.funding === focusFundingAgency;
                const highlightStyle = isHighlighted ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 shadow-sm' : 'bg-gray-50';
                
                // Get project type icon
                const getProjectIcon = (type) => {
                    switch(type) {
                        case 'water': return '💧';
                        case 'sewerage': return '🚰';
                        case 'harbour': return '⚓';
                        case 'desalination': return '🏭';
                        default: return '🏗️';
                    }
                };

                // Get status color
                const getStatusColor = (status) => {
                    switch(status?.toLowerCase()) {
                        case 'completed': return 'text-green-600 bg-green-100';
                        case 'ongoing': return 'text-blue-600 bg-blue-100';
                        case 'planned': return 'text-orange-600 bg-orange-100';
                        default: return 'text-gray-600 bg-gray-100';
                    }
                };

                return `
                    <div class="mb-3 p-3 rounded-lg ${highlightStyle} transition-all duration-200 hover:shadow-md">
                        <div class="flex items-center mb-2">
                            <span class="text-lg mr-2">${getProjectIcon(type)}</span>
                            <h5 class="font-semibold text-gray-800">${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}</h5>
                        </div>
                        <div class="space-y-1 text-sm">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">Funding:</span>
                                <span class="font-medium text-gray-800 bg-white px-2 py-1 rounded text-xs">${project.funding}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">Phase:</span>
                                <span class="font-medium text-gray-700">${project.phase || 'N/A'}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">Status:</span>
                                <span class="px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}">${project.status || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

        const content = `
            <div class="p-4 max-w-sm bg-white rounded-lg shadow-lg">
                <div class="border-b pb-3 mb-3">
                    <h3 class="font-bold text-xl text-gray-800 mb-1">${island.locality}</h3>
                    <div class="flex items-center text-sm text-gray-600 space-x-4">
                        <span class="flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                            </svg>
                            ${island.atoll} Atoll
                        </span>
                        <span class="flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            ${island.population?.toLocaleString() || 'N/A'} people
                        </span>
                    </div>
                </div>
                ${focusFundingAgency ? `
                    <div class="mb-3 p-2 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg">
                        <div class="flex items-center text-sm">
                            <svg class="w-4 h-4 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                            </svg>
                            <span class="text-indigo-700 font-medium">Showing projects for: ${focusFundingAgency}</span>
                        </div>
                    </div>
                ` : ''}
                ${activeProjects ? `
                    <div>
                        <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"></path>
                            </svg>
                            Projects
                        </h4>
                        <div class="space-y-2">
                            ${activeProjects}
                        </div>
                    </div>
                ` : `
                    <div class="text-center py-6">
                        <svg class="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        <p class="text-gray-500 italic">No projects available</p>
                    </div>
                `}
            </div>
        `;

        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, marker);
    }

    // Filter markers based on criteria
    filterMarkers(criteria) {
        this.currentFilter = criteria;
        console.log('Filtering markers with criteria:', criteria);
        console.log('Total markers:', this.markers.length);
        
        let visibleCount = 0;
        this.markers.forEach(marker => {
            const island = marker.islandData;
            const markerFundingAgency = marker.fundingAgency;
            let showMarker = true;

            // Filter by funding agency (if any agencies are selected)
            if (criteria.funding.length > 0) {
                if (!criteria.funding.includes(markerFundingAgency)) {
                    showMarker = false;
                }
            }

            // Filter by phase (if any phases are selected)
            if (criteria.phase.length > 0) {
                const hasPhase = Object.values(island.projects)
                    .some(project => project && project.funding === markerFundingAgency && 
                                   project.phase && criteria.phase.includes(project.phase));
                if (!hasPhase) showMarker = false;
            }

            // Filter by project type (if any project types are selected)
            if (criteria.projectType.length > 0) {
                const hasProjectType = criteria.projectType.some(projectType => {
                    const project = island.projects[projectType];
                    // Show if project exists with the marker's funding agency and has meaningful data
                    return project && project.funding === markerFundingAgency && 
                           (project.funding && project.funding !== null || 
                            project.phase && project.phase !== null || 
                            project.status && project.status !== null);
                });
                if (!hasProjectType) showMarker = false;
            }

            // Filter by proposed for funding
            if (criteria.proposedForFunding) {
                const hasProposedFunding = (island.proposedForFunding && island.proposedForFunding.toLowerCase() === 'yes') ||
                    (island.projects && island.projects.proposed_for_funding && island.projects.proposed_for_funding.toLowerCase() === 'yes');
                if (!hasProposedFunding) showMarker = false;
            }
            
            // Filter by ongoing harbor project
            if (criteria.ongoingHarbor) {
                const hasOngoingHarbor = (island.ongoingHarborProject && island.ongoingHarborProject.toLowerCase() === 'yes') ||
                    (island.projects && island.projects.ongoing_harbor_project && island.projects.ongoing_harbor_project.toLowerCase() === 'yes');
                if (!hasOngoingHarbor) showMarker = false;
            }
            
            // Filter by urban centers
            if (criteria.urbanCenters) {
                const isUrbanCenter = (island.urbanCenters && island.urbanCenters.toLowerCase() === 'yes') ||
                    (island.projects && island.projects.urban_centers && island.projects.urban_centers.toLowerCase() === 'yes');
                if (!isUrbanCenter) showMarker = false;
            }

            marker.setVisible(showMarker);
            if (showMarker) visibleCount++;
        });
        
        console.log('Visible markers after filtering:', visibleCount);
    }

    // Get filtered island data based on current filter criteria
    getFilteredIslands() {
        if (!window.islandData) return [];
        
        return window.islandData.filter(island => {
            // Check if island should be shown based on current filter criteria
            let shouldShow = false;
            
            // Get funding agencies for this island
            const fundingAgencies = this.getFundingAgenciesForIsland(island);
            
            // Check each funding agency to see if any marker for this island would be visible
            fundingAgencies.forEach(agency => {
                let showForThisAgency = true;
                
                // Filter by funding agency
                if (this.currentFilter.funding.length > 0) {
                    if (!this.currentFilter.funding.includes(agency)) {
                        showForThisAgency = false;
                    }
                }
                
                // Filter by phase
                if (this.currentFilter.phase.length > 0) {
                    const hasPhase = Object.values(island.projects)
                        .some(project => project && project.funding === agency && 
                                       project.phase && this.currentFilter.phase.includes(project.phase));
                    if (!hasPhase) showForThisAgency = false;
                }
                
                // Filter by project type
                if (this.currentFilter.projectType.length > 0) {
                    const hasProjectType = this.currentFilter.projectType.some(projectType => {
                        const project = island.projects[projectType];
                        return project && project.funding === agency && 
                               (project.funding && project.funding !== null || 
                                project.phase && project.phase !== null || 
                                project.status && project.status !== null);
                    });
                    if (!hasProjectType) showForThisAgency = false;
                }
                
                // Filter by proposed for funding
                if (this.currentFilter.proposedForFunding) {
                    const hasProposedFunding = (island.proposedForFunding && island.proposedForFunding.toLowerCase() === 'yes') ||
                        (island.projects && island.projects.proposed_for_funding && island.projects.proposed_for_funding.toLowerCase() === 'yes');
                    if (!hasProposedFunding) showForThisAgency = false;
                }
                
                // Filter by ongoing harbor project
                if (this.currentFilter.ongoingHarbor) {
                    const hasOngoingHarbor = (island.ongoingHarborProject && island.ongoingHarborProject.toLowerCase() === 'yes') ||
                        (island.projects && island.projects.ongoing_harbor_project && island.projects.ongoing_harbor_project.toLowerCase() === 'yes');
                    if (!hasOngoingHarbor) showForThisAgency = false;
                }
                
                // Filter by urban centers
                if (this.currentFilter.urbanCenters) {
                    const isUrbanCenter = (island.urbanCenters && island.urbanCenters.toLowerCase() === 'yes') ||
                        (island.projects && island.projects.urban_centers && island.projects.urban_centers.toLowerCase() === 'yes');
                    if (!isUrbanCenter) showForThisAgency = false;
                }
                
                if (showForThisAgency) {
                    shouldShow = true;
                }
            });
            
            return shouldShow;
        });
    }

    // Reset map to show all markers
    resetMap() {
        this.currentFilter = { funding: [], phase: [], projectType: [], proposedForFunding: false, ongoingHarbor: false, urbanCenters: false };
        this.markers.forEach(marker => marker.setVisible(true));
        this.infoWindow.close();
    }

    // Focus on specific atoll
    focusOnAtoll(atollCode) {
        const atollMarkers = this.markers.filter(marker => 
            marker.islandData.atoll === atollCode && marker.getVisible()
        );

        if (atollMarkers.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            atollMarkers.forEach(marker => {
                bounds.extend(marker.getPosition());
            });
            this.map.fitBounds(bounds);
            
            // Ensure minimum zoom level
            const listener = google.maps.event.addListener(this.map, 'idle', () => {
                if (this.map.getZoom() > 10) this.map.setZoom(10);
                google.maps.event.removeListener(listener);
            });
        }
    }

    // Clear all markers
    clearMarkers() {
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];
    }
}

// Export for global access
window.MapHandler = MapHandler;