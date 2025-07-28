// filters.js - Filter functionality module

// Filter management object
const FilterManager = {
    // Setup all event listeners for filters
    setupEventListeners() {
        console.log('Setting up filter event listeners...');
        
        // Funding agency checkboxes
        const fundingCheckboxes = document.querySelectorAll('.funding-checkbox');
        console.log('Found funding checkboxes:', fundingCheckboxes.length);
        fundingCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', this.applyFilters.bind(this));
        });
        
        // Phase checkboxes
        document.querySelectorAll('.phase-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', this.applyFilters.bind(this));
        });
        
        // Project type checkboxes
        document.querySelectorAll('.project-type-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', this.applyFilters.bind(this));
        });
        
        this.setupSpecialFilters();
        this.setupControlButtons();
        this.setupMobileFilters();
        this.setupCollapsibleFilters();
        this.setupHamburgerMenu();
        
        // Initialize visual states for special filters
        setTimeout(() => {
            console.log('Initializing special filter visual states...');
            this.initializeSpecialFilterVisualStates();
            
            // Update counts after a short delay to ensure data is loaded
            setTimeout(() => {
                this.updateSpecialFilterCounts();
            }, 500);
        }, 1000);
        
        // Test that elements are found
        this.testFilterElements();
    },
    
    // Setup special filters separately
    setupSpecialFilters() {
        console.log('Setting up special filters...');
        
        // Special filter checkboxes with custom circles - use safer element checking
        const proposedFundingFilter = document.getElementById('proposedFundingFilter');
        const ongoingHarborFilter = document.getElementById('ongoingHarborFilter');
        const urbanCentersFilter = document.getElementById('urbanCentersFilter');
        
        console.log('Special filter elements found:', {
            proposedFundingFilter: !!proposedFundingFilter,
            ongoingHarborFilter: !!ongoingHarborFilter,
            urbanCentersFilter: !!urbanCentersFilter
        });
        
        // Note: Removed checkbox change listeners to prevent duplicate events
        // The circles handle the click events directly
        
        // Add click handlers for custom circles - use safer element checking
        const proposedCircle = document.querySelector('.special-filter-circle.proposed-funding');
        const ongoingCircle = document.querySelector('.special-filter-circle.ongoing-harbor');
        const urbanCircle = document.querySelector('.special-filter-circle.urban-centers');
        
        console.log('Special filter circles found:', {
            proposedCircle: !!proposedCircle,
            ongoingCircle: !!ongoingCircle,
            urbanCircle: !!urbanCircle
        });
        
        if (proposedCircle && proposedFundingFilter) {
            proposedCircle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🟢 Proposed funding filter toggled');
                proposedFundingFilter.checked = !proposedFundingFilter.checked;
                this.updateSpecialFilterVisualState(proposedFundingFilter, proposedCircle);
                this.handleSpecialFilter('proposedForFunding', proposedFundingFilter.checked);
            });
        }
        
        if (ongoingCircle && ongoingHarborFilter) {
            ongoingCircle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🟡 Ongoing harbor filter toggled');
                ongoingHarborFilter.checked = !ongoingHarborFilter.checked;
                this.updateSpecialFilterVisualState(ongoingHarborFilter, ongoingCircle);
                this.handleSpecialFilter('ongoingHarbor', ongoingHarborFilter.checked);
            });
        }
        
        if (urbanCircle && urbanCentersFilter) {
            urbanCircle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🟣 Urban centers filter toggled');
                urbanCentersFilter.checked = !urbanCentersFilter.checked;
                this.updateSpecialFilterVisualState(urbanCentersFilter, urbanCircle);
                this.handleSpecialFilter('urbanCenters', urbanCentersFilter.checked);
            });
        }
    },
    
    // Update special filter counts in the UI
    updateSpecialFilterCounts() {
        if (!window.mapHandler) return;
        
        const proposedCount = window.mapHandler.getSpecialFilterIslands('proposedForFunding').length;
        const harborCount = window.mapHandler.getSpecialFilterIslands('ongoingHarbor').length;
        const urbanCount = window.mapHandler.getSpecialFilterIslands('urbanCenters').length;
        
        const proposedCountElement = document.getElementById('proposedFundingCount');
        const harborCountElement = document.getElementById('ongoingHarborCount');
        const urbanCountElement = document.getElementById('urbanCentersCount');
        
        if (proposedCountElement) proposedCountElement.textContent = `(${proposedCount})`;
        if (harborCountElement) harborCountElement.textContent = `(${harborCount})`;
        if (urbanCountElement) urbanCountElement.textContent = `(${urbanCount})`;
        
        console.log('✅ Special filter counts updated:', {
            proposedForFunding: proposedCount,
            ongoingHarbor: harborCount,
            urbanCenters: urbanCount
        });
    },
    
    // Handle special filter toggle (show/hide overlays)
    handleSpecialFilter(filterType, isActive) {
        console.log(`Handling special filter: ${filterType}, active: ${isActive}`);
        
        if (!window.mapHandler) {
            console.error('mapHandler not available');
            return;
        }
        
        if (isActive) {
            // Show overlays for this filter type
            const islands = window.mapHandler.getSpecialFilterIslands(filterType);
            console.log(`Found ${islands.length} islands for ${filterType}`);
            window.mapHandler.createSpecialFilterOverlays(filterType, islands);
        } else {
            // Hide overlays for this filter type
            window.mapHandler.clearSpecialFilterOverlays(filterType);
        }
    },
    
    // Update visual state of special filter circles
    updateSpecialFilterVisualState(checkbox, circle) {
        if (!checkbox || !circle) return;
        
        if (checkbox.checked) {
            circle.classList.add('checked');
        } else {
            circle.classList.remove('checked');
        }
    },
    
    // Initialize visual state for all special filters
    initializeSpecialFilterVisualStates() {
        const proposedFundingFilter = document.getElementById('proposedFundingFilter');
        const ongoingHarborFilter = document.getElementById('ongoingHarborFilter');
        const urbanCentersFilter = document.getElementById('urbanCentersFilter');
        
        const proposedCircle = document.querySelector('.special-filter-circle.proposed-funding');
        const ongoingCircle = document.querySelector('.special-filter-circle.ongoing-harbor');
        const urbanCircle = document.querySelector('.special-filter-circle.urban-centers');
        
        this.updateSpecialFilterVisualState(proposedFundingFilter, proposedCircle);
        this.updateSpecialFilterVisualState(ongoingHarborFilter, ongoingCircle);
        this.updateSpecialFilterVisualState(urbanCentersFilter, urbanCircle);
    },
    
    // Setup mobile filter functionality
    setupMobileFilters() {
        const mobileToggle = document.querySelector('.mobile-filter-toggle');
        const backupToggle = document.getElementById('mobileFilterToggleBackup');
        const filterContainer = document.getElementById('filterContainer');
        const filterSection = document.querySelector('.filter-section');
        const mobileClose = document.querySelector('.mobile-filter-close');
        
        console.log('Setting up mobile filters...', {
            mobileToggle: !!mobileToggle,
            backupToggle: !!backupToggle,
            filterContainer: !!filterContainer,
            filterSection: !!filterSection,
            mobileClose: !!mobileClose
        });
        
        // Show backup button on mobile if primary button not found
        if (backupToggle && window.innerWidth <= 1024) {
            backupToggle.style.display = 'flex';
            backupToggle.style.alignItems = 'center';
            backupToggle.style.justifyContent = 'center';
        }
        
        // Setup click handlers for both buttons
        const toggleButtons = [mobileToggle, backupToggle].filter(btn => btn);
        
        toggleButtons.forEach(button => {
            if (button && filterContainer) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Filter toggle button clicked');
                    filterContainer.classList.toggle('mobile-visible');
                });
            }
        });
        
        if (mobileClose && filterContainer) {
            mobileClose.addEventListener('click', () => {
                filterContainer.classList.remove('mobile-visible');
            });
        }
        
        // Close filters when clicking on backdrop
        if (filterContainer) {
            filterContainer.addEventListener('click', (e) => {
                if (e.target === filterContainer) {
                    filterContainer.classList.remove('mobile-visible');
                }
            });
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (backupToggle) {
                if (window.innerWidth <= 1024) {
                    backupToggle.style.display = 'flex';
                } else {
                    backupToggle.style.display = 'none';
                }
            }
        });
    },
    
    // Setup hamburger menu functionality
    setupHamburgerMenu() {
        const hamburgerBtn = document.getElementById('hamburgerMenuBtn');
        const popup = document.getElementById('hamburgerFilterPopup');
        const closeBtn = document.getElementById('closeHamburgerFilter');
        const popupBody = document.getElementById('hamburgerFilterBody');
        
        console.log('Setting up hamburger menu...', {
            hamburgerBtn: !!hamburgerBtn,
            popup: !!popup,
            closeBtn: !!closeBtn,
            popupBody: !!popupBody
        });
        
        if (!hamburgerBtn || !popup || !closeBtn || !popupBody) {
            console.error('Hamburger menu elements not found');
            return;
        }
        
        // Open popup
        hamburgerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openHamburgerPopup();
        });
        
        // Close popup
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.closeHamburgerPopup();
        });
        
        // Close popup when clicking backdrop
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                this.closeHamburgerPopup();
            }
        });
        
        // Close popup on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popup.classList.contains('show')) {
                this.closeHamburgerPopup();
            }
        });
    },
    
    // Open hamburger filter popup
    openHamburgerPopup() {
        const popup = document.getElementById('hamburgerFilterPopup');
        const hamburgerBtn = document.getElementById('hamburgerMenuBtn');
        const popupBody = document.getElementById('hamburgerFilterBody');
        
        if (!popup || !hamburgerBtn || !popupBody) return;
        
        // Clear previous content
        popupBody.innerHTML = '';
        
        // Clone filter content from the main filter section
        const filterSection = document.querySelector('.filter-section');
        if (filterSection) {
            const filterClone = filterSection.cloneNode(true);
            
            // Remove mobile-specific elements
            const mobileClose = filterClone.querySelector('.mobile-filter-close');
            if (mobileClose) mobileClose.remove();
            
            // Remove classes that might interfere
            filterClone.classList.remove('mobile-visible');
            filterClone.style.position = 'static';
            filterClone.style.transform = 'none';
            filterClone.style.background = 'transparent';
            filterClone.style.maxHeight = 'none';
            filterClone.style.boxShadow = 'none';
            filterClone.style.borderRadius = '0';
            filterClone.style.margin = '0';
            filterClone.style.maxWidth = 'none';
            filterClone.style.width = '100%';
            
            popupBody.appendChild(filterClone);
            
            // Re-bind event listeners for the cloned elements
            this.rebindFilterEvents(filterClone);
        }
        
        // Show popup
        popup.classList.add('show');
        hamburgerBtn.classList.add('active');
        
        // Focus trap
        const focusableElements = popup.querySelectorAll('button, input[type="checkbox"], [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    },
    
    // Close hamburger filter popup
    closeHamburgerPopup() {
        const popup = document.getElementById('hamburgerFilterPopup');
        const hamburgerBtn = document.getElementById('hamburgerMenuBtn');
        
        if (!popup || !hamburgerBtn) return;
        
        popup.classList.remove('show');
        hamburgerBtn.classList.remove('active');
    },
    
    // Rebind event listeners for cloned filter elements
    rebindFilterEvents(container) {
        // Funding agency checkboxes
        container.querySelectorAll('.funding-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', this.applyFilters.bind(this));
        });
        
        // Phase checkboxes
        container.querySelectorAll('.phase-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', this.applyFilters.bind(this));
        });
        
        // Project type checkboxes
        container.querySelectorAll('.project-type-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', this.applyFilters.bind(this));
        });
        
        // Control buttons
        const selectAllFunding = container.querySelector('#selectAllFunding');
        const unselectAllFunding = container.querySelector('#unselectAllFunding');
        const selectAllProjectType = container.querySelector('#selectAllProjectType');
        const unselectAllProjectType = container.querySelector('#unselectAllProjectType');
        const resetFilters = container.querySelector('#resetFilters');
        
        if (selectAllFunding) selectAllFunding.addEventListener('click', () => {
            this.toggleAllCheckboxes('.funding-checkbox', true);
            this.closeHamburgerPopup();
        });
        if (unselectAllFunding) unselectAllFunding.addEventListener('click', () => {
            this.toggleAllCheckboxes('.funding-checkbox', false);
            this.closeHamburgerPopup();
        });
        if (selectAllProjectType) selectAllProjectType.addEventListener('click', () => {
            this.toggleAllCheckboxes('.project-type-checkbox', true);
            this.closeHamburgerPopup();
        });
        if (unselectAllProjectType) unselectAllProjectType.addEventListener('click', () => {
            this.toggleAllCheckboxes('.project-type-checkbox', false);
            this.closeHamburgerPopup();
        });
        if (resetFilters) {
            resetFilters.addEventListener('click', () => {
                this.resetFilters();
                this.closeHamburgerPopup();
            });
        }
        
        // Special filters
        this.setupSpecialFiltersInContainer(container);
        
        // Collapsible sections
        const filterHeaders = container.querySelectorAll('.filter-group-header');
        filterHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const targetId = header.getAttribute('data-target');
                const content = container.querySelector('#' + targetId);
                const icon = header.querySelector('.filter-toggle-icon');
                
                if (content && icon) {
                    content.classList.toggle('collapsed');
                    icon.classList.toggle('rotated');
                }
            });
        });
    },
    
    // Setup special filters within a container
    setupSpecialFiltersInContainer(container) {
        const proposedCircle = container.querySelector('.special-filter-circle.proposed-funding');
        const ongoingCircle = container.querySelector('.special-filter-circle.ongoing-harbor');
        const urbanCircle = container.querySelector('.special-filter-circle.urban-centers');
        
        const proposedFundingFilter = container.querySelector('#proposedFundingFilter');
        const ongoingHarborFilter = container.querySelector('#ongoingHarborFilter');
        const urbanCentersFilter = container.querySelector('#urbanCentersFilter');
        
        if (proposedCircle && proposedFundingFilter) {
            proposedCircle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Update the original checkbox
                const originalCheckbox = document.getElementById('proposedFundingFilter');
                if (originalCheckbox) {
                    originalCheckbox.checked = !originalCheckbox.checked;
                    proposedFundingFilter.checked = originalCheckbox.checked;
                    this.updateSpecialFilterVisualState(proposedFundingFilter, proposedCircle);
                    this.handleSpecialFilter('proposedForFunding', originalCheckbox.checked);
                }
            });
        }
        
        if (ongoingCircle && ongoingHarborFilter) {
            ongoingCircle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const originalCheckbox = document.getElementById('ongoingHarborFilter');
                if (originalCheckbox) {
                    originalCheckbox.checked = !originalCheckbox.checked;
                    ongoingHarborFilter.checked = originalCheckbox.checked;
                    this.updateSpecialFilterVisualState(ongoingHarborFilter, ongoingCircle);
                    this.handleSpecialFilter('ongoingHarbor', originalCheckbox.checked);
                }
            });
        }
        
        if (urbanCircle && urbanCentersFilter) {
            urbanCircle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const originalCheckbox = document.getElementById('urbanCentersFilter');
                if (originalCheckbox) {
                    originalCheckbox.checked = !originalCheckbox.checked;
                    urbanCentersFilter.checked = originalCheckbox.checked;
                    this.updateSpecialFilterVisualState(urbanCentersFilter, urbanCircle);
                    this.handleSpecialFilter('urbanCenters', originalCheckbox.checked);
                }
            });
        }
    },
    
    // Setup collapsible filter sections
    setupCollapsibleFilters() {
        const filterHeaders = document.querySelectorAll('.filter-group-header');
        
        filterHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const targetId = header.getAttribute('data-target');
                const content = document.getElementById(targetId);
                const icon = header.querySelector('.filter-toggle-icon');
                
                if (content && icon) {
                    content.classList.toggle('collapsed');
                    icon.classList.toggle('rotated');
                }
            });
        });
    },
    
    // Setup control buttons separately  
    setupControlButtons() {
        // Select/Unselect all buttons with error handling
        const selectAllFunding = document.getElementById('selectAllFunding');
        const unselectAllFunding = document.getElementById('unselectAllFunding');
        const selectAllPhase = document.getElementById('selectAllPhase');
        const unselectAllPhase = document.getElementById('unselectAllPhase');
        const selectAllProjectType = document.getElementById('selectAllProjectType');
        const unselectAllProjectType = document.getElementById('unselectAllProjectType');
        const resetFilters = document.getElementById('resetFilters');
        
        if (selectAllFunding) selectAllFunding.addEventListener('click', () => this.toggleAllCheckboxes('.funding-checkbox', true));
        if (unselectAllFunding) unselectAllFunding.addEventListener('click', () => this.toggleAllCheckboxes('.funding-checkbox', false));
        if (selectAllPhase) selectAllPhase.addEventListener('click', () => this.toggleAllCheckboxes('.phase-checkbox', true));
        if (unselectAllPhase) unselectAllPhase.addEventListener('click', () => this.toggleAllCheckboxes('.phase-checkbox', false));
        if (selectAllProjectType) selectAllProjectType.addEventListener('click', () => this.toggleAllCheckboxes('.project-type-checkbox', true));
        if (unselectAllProjectType) unselectAllProjectType.addEventListener('click', () => this.toggleAllCheckboxes('.project-type-checkbox', false));
        if (resetFilters) resetFilters.addEventListener('click', this.resetFilters.bind(this));
    },

    // Helper function to get checked checkbox values
    getCheckedValues(selector) {
        const checkboxes = document.querySelectorAll(selector + ':checked');
        return Array.from(checkboxes).map(cb => cb.value);
    },
    
    // Test function to verify elements exist
    testFilterElements() {
        console.log('=== TESTING FILTER ELEMENTS ===');
        console.log('Funding checkboxes:', document.querySelectorAll('.funding-checkbox').length);
        console.log('Phase checkboxes:', document.querySelectorAll('.phase-checkbox').length);
        console.log('Project type checkboxes:', document.querySelectorAll('.project-type-checkbox').length);
        console.log('Special filter elements:', {
            proposed: !!document.getElementById('proposedFundingFilter'),
            harbor: !!document.getElementById('ongoingHarborFilter'), 
            urban: !!document.getElementById('urbanCentersFilter')
        });
        
        // Test data availability for special filters
        if (window.islandData) {
            const proposedCount = window.islandData.filter(island => 
                island.proposedForFunding && island.proposedForFunding.toLowerCase() === 'yes'
            ).length;
            
            const harborCount = window.islandData.filter(island => 
                island.ongoingHarborProject && island.ongoingHarborProject.toLowerCase() === 'yes'
            ).length;
            
            const urbanCount = window.islandData.filter(island => 
                island.urbanCenters && island.urbanCenters.toLowerCase() === 'yes'
            ).length;
            
            console.log('Special filter data counts:', {
                proposedForFunding: proposedCount,
                ongoingHarbor: harborCount,
                urbanCenters: urbanCount,
                totalIslands: window.islandData.length
            });
        }
    },
    
    // Helper function to toggle all checkboxes
    toggleAllCheckboxes(selector, checked) {
        document.querySelectorAll(selector).forEach(checkbox => {
            checkbox.checked = checked;
        });
        this.applyFilters();
    },

    // Apply filters
    applyFilters() {
        console.log('🔍 applyFilters() called');
        const proposedFundingFilter = document.getElementById('proposedFundingFilter');
        const ongoingHarborFilter = document.getElementById('ongoingHarborFilter');
        const urbanCentersFilter = document.getElementById('urbanCentersFilter');
        
        // Only include regular filter criteria (not special filters)
        const criteria = {
            funding: this.getCheckedValues('.funding-checkbox'),
            phase: this.getCheckedValues('.phase-checkbox'),
            projectType: this.getCheckedValues('.project-type-checkbox')
        };
        
        console.log('Applying regular filters with criteria:', criteria);
        
        // Apply filters through map handler
        if (window.mapHandler && typeof window.mapHandler.filterMarkers === 'function') {
            console.log('Calling mapHandler.filterMarkers...');
            try {
                window.mapHandler.filterMarkers(criteria);
                
                // Update statistics with filtered data
                if (window.StatisticsManager && typeof window.mapHandler.getFilteredIslands === 'function') {
                    const filteredData = window.mapHandler.getFilteredIslands();
                    window.StatisticsManager.updateStatistics(filteredData);
                }
            } catch (error) {
                console.error('Error applying filters:', error);
            }
        } else {
            console.error('mapHandler not found or filterMarkers method missing!', !!window.mapHandler);
        }
    },

    // Reset filters
    resetFilters() {
        // Uncheck all checkboxes
        document.querySelectorAll('.funding-checkbox').forEach(cb => cb.checked = false);
        document.querySelectorAll('.phase-checkbox').forEach(cb => cb.checked = false);
        document.querySelectorAll('.project-type-checkbox').forEach(cb => cb.checked = false);
        const proposedFundingFilter = document.getElementById('proposedFundingFilter');
        const ongoingHarborFilter = document.getElementById('ongoingHarborFilter');
        const urbanCentersFilter = document.getElementById('urbanCentersFilter');
        
        if (proposedFundingFilter) proposedFundingFilter.checked = false;
        if (ongoingHarborFilter) ongoingHarborFilter.checked = false;
        if (urbanCentersFilter) urbanCentersFilter.checked = false;
        
        // Reset visual states for special filters
        this.initializeSpecialFilterVisualStates();
        
        // Clear all special filter overlays
        if (window.mapHandler) {
            window.mapHandler.clearAllSpecialFilterOverlays();
        }
        
        // Reset map
        if (window.mapHandler) {
            window.mapHandler.resetMap();
            
            // Update statistics with all data (no filters)
            if (window.StatisticsManager) {
                window.StatisticsManager.updateStatistics();
            }
        }
        
        // Close atoll panel
        if (window.AtollSummaryManager) {
            window.AtollSummaryManager.closeAtollPanel();
        }
    }
};

// Export for global access
window.FilterManager = FilterManager;

// Add a global test function
window.testFilters = function() {
    console.log('=== MANUAL FILTER TEST ===');
    if (window.FilterManager) {
        window.FilterManager.testFilterElements();
        console.log('FilterManager found and test completed');
    } else {
        console.error('FilterManager not found');
    }
};

// Add global test function for special filters
window.testSpecialFilters = function() {
    console.log('=== MANUAL SPECIAL FILTER TEST ===');
    const proposedFundingFilter = document.getElementById('proposedFundingFilter');
    const ongoingHarborFilter = document.getElementById('ongoingHarborFilter');
    const urbanCentersFilter = document.getElementById('urbanCentersFilter');
    
    const proposedCircle = document.querySelector('.special-filter-circle.proposed-funding');
    const ongoingCircle = document.querySelector('.special-filter-circle.ongoing-harbor');
    const urbanCircle = document.querySelector('.special-filter-circle.urban-centers');
    
    console.log('Elements found:', {
        proposedFundingFilter: !!proposedFundingFilter,
        ongoingHarborFilter: !!ongoingHarborFilter,
        urbanCentersFilter: !!urbanCentersFilter,
        proposedCircle: !!proposedCircle,
        ongoingCircle: !!ongoingCircle,
        urbanCircle: !!urbanCircle
    });
    
    if (proposedFundingFilter) {
        console.log('Testing proposed funding filter...');
        proposedFundingFilter.checked = true;
        if (window.FilterManager) window.FilterManager.applyFilters();
    }
};

// Add global function to manually test circle clicks
window.testCircleClick = function(type) {
    console.log(`Testing ${type} circle click...`);
    const circles = {
        proposed: document.querySelector('.special-filter-circle.proposed-funding'),
        harbor: document.querySelector('.special-filter-circle.ongoing-harbor'),
        urban: document.querySelector('.special-filter-circle.urban-centers')
    };
    
    if (circles[type]) {
        circles[type].click();
    } else {
        console.error(`Circle ${type} not found`);
    }
};