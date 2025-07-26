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
        
        if (proposedFundingFilter) {
            proposedFundingFilter.addEventListener('change', this.applyFilters.bind(this));
        }
        if (ongoingHarborFilter) {
            ongoingHarborFilter.addEventListener('change', this.applyFilters.bind(this));
        }
        if (urbanCentersFilter) {
            urbanCentersFilter.addEventListener('change', this.applyFilters.bind(this));
        }
        
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
            proposedCircle.addEventListener('click', () => {
                proposedFundingFilter.checked = !proposedFundingFilter.checked;
                this.applyFilters();
            });
        }
        
        if (ongoingCircle && ongoingHarborFilter) {
            ongoingCircle.addEventListener('click', () => {
                ongoingHarborFilter.checked = !ongoingHarborFilter.checked;
                this.applyFilters();
            });
        }
        
        if (urbanCircle && urbanCentersFilter) {
            urbanCircle.addEventListener('click', () => {
                urbanCentersFilter.checked = !urbanCentersFilter.checked;
                this.applyFilters();
            });
        }
    },
    
    // Setup mobile filter functionality
    setupMobileFilters() {
        const mobileToggle = document.querySelector('.mobile-filter-toggle');
        const filterSection = document.querySelector('.filter-section');
        const mobileClose = document.querySelector('.mobile-filter-close');
        
        if (mobileToggle && filterSection) {
            mobileToggle.addEventListener('click', () => {
                filterSection.classList.toggle('mobile-visible');
            });
        }
        
        if (mobileClose && filterSection) {
            mobileClose.addEventListener('click', () => {
                filterSection.classList.remove('mobile-visible');
            });
        }
        
        // Close filters when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && 
                filterSection && 
                filterSection.classList.contains('mobile-visible') &&
                !filterSection.contains(e.target) && 
                !mobileToggle.contains(e.target)) {
                filterSection.classList.remove('mobile-visible');
            }
        });
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
        const proposedFundingFilter = document.getElementById('proposedFundingFilter');
        const ongoingHarborFilter = document.getElementById('ongoingHarborFilter');
        const urbanCentersFilter = document.getElementById('urbanCentersFilter');
        
        const criteria = {
            funding: this.getCheckedValues('.funding-checkbox'),
            phase: this.getCheckedValues('.phase-checkbox'),
            projectType: this.getCheckedValues('.project-type-checkbox'),
            proposedForFunding: proposedFundingFilter ? proposedFundingFilter.checked : false,
            ongoingHarbor: ongoingHarborFilter ? ongoingHarborFilter.checked : false,
            urbanCenters: urbanCentersFilter ? urbanCentersFilter.checked : false
        };
        
        console.log('Applying filters with criteria:', criteria);
        
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