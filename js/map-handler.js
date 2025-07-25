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
        Object.values(island.projects).forEach(project => {
            if (project.funding && project.funding !== null) {
                agencies.add(project.funding);
            }
        });
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
                const highlightStyle = isHighlighted ? 'bg-yellow-100 border-l-4 border-yellow-500 pl-2' : '';
                return `
                    <div class="mb-2 ${highlightStyle}">
                        <strong>${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}:</strong><br>
                        Funding: ${project.funding}<br>
                        Phase: ${project.phase || 'N/A'}<br>
                        Status: ${project.status || 'N/A'}
                    </div>
                `;
            }).join('');

        const content = `
            <div class="p-3 max-w-sm">
                <h3 class="font-bold text-lg mb-2">${island.locality}</h3>
                <p class="text-sm text-gray-600 mb-2">
                    <strong>Atoll:</strong> ${island.atoll}<br>
                    <strong>Population:</strong> ${island.population?.toLocaleString() || 'N/A'}
                </p>
                ${focusFundingAgency ? `
                    <div class="mb-2 text-sm bg-blue-50 p-2 rounded">
                        <strong>Showing projects for:</strong> ${focusFundingAgency}
                    </div>
                ` : ''}
                ${activeProjects ? `
                    <div class="border-t pt-2">
                        <h4 class="font-semibold mb-2">Active Projects:</h4>
                        ${activeProjects}
                    </div>
                ` : '<p class="text-gray-500 italic">No active projects</p>'}
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
                    .some(project => project.funding === markerFundingAgency && 
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
                        .some(project => project.funding === agency && 
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