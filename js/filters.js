// filters.js - Filter functionality module

// Filter management object
const FilterManager = {
    // Setup all event listeners for filters
    setupEventListeners() {
        console.log('Setting up filter event listeners...');
        
        // Wait for elements to be available, retry if needed
        const maxRetries = 5;
        let retryCount = 0;
        
        const setupWithRetry = () => {
            console.log(`Setup attempt ${retryCount + 1}/${maxRetries}`);
            
            // Funding agency checkboxes
            const fundingCheckboxes = document.querySelectorAll('.funding-checkbox');
            console.log('Found funding checkboxes:', fundingCheckboxes.length);
            
            if (fundingCheckboxes.length === 0 && retryCount < maxRetries - 1) {
                retryCount++;
                setTimeout(setupWithRetry, 300);
                return;
            }
            
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
        };
        
        setupWithRetry();
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
    
    // Setup control buttons separately  
    setupControlButtons() {
        // Select/Unselect all buttons
        document.getElementById('selectAllFunding').addEventListener('click', () => this.toggleAllCheckboxes('.funding-checkbox', true));
        document.getElementById('unselectAllFunding').addEventListener('click', () => this.toggleAllCheckboxes('.funding-checkbox', false));
        
        document.getElementById('selectAllPhase').addEventListener('click', () => this.toggleAllCheckboxes('.phase-checkbox', true));
        document.getElementById('unselectAllPhase').addEventListener('click', () => this.toggleAllCheckboxes('.phase-checkbox', false));
        
        document.getElementById('selectAllProjectType').addEventListener('click', () => this.toggleAllCheckboxes('.project-type-checkbox', true));
        document.getElementById('unselectAllProjectType').addEventListener('click', () => this.toggleAllCheckboxes('.project-type-checkbox', false));
        
        // Reset button
        document.getElementById('resetFilters').addEventListener('click', this.resetFilters.bind(this));
    },

    // Helper function to get checked checkbox values
    getCheckedValues(selector) {
        return Array.from(document.querySelectorAll(selector + ':checked')).map(cb => cb.value);
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
        
        console.log('=== APPLYING FILTERS ===');
        console.log('Filter criteria:', criteria);
        console.log('Filter elements state:', {
            proposedFundingFilter: proposedFundingFilter ? proposedFundingFilter.checked : 'element not found',
            ongoingHarborFilter: ongoingHarborFilter ? ongoingHarborFilter.checked : 'element not found',
            urbanCentersFilter: urbanCentersFilter ? urbanCentersFilter.checked : 'element not found'
        });
        
        console.log('Applying filters:', criteria);
        console.log('window.mapHandler exists:', !!window.mapHandler);
        console.log('window.mapHandler object:', window.mapHandler);
        
        // Apply filters through map handler
        if (window.mapHandler) {
            console.log('Calling mapHandler.filterMarkers...');
            window.mapHandler.filterMarkers(criteria);
            
            // Update statistics with filtered data
            if (window.StatisticsManager) {
                const filteredData = window.mapHandler.getFilteredIslands();
                window.StatisticsManager.updateStatistics(filteredData);
            }
        } else {
            console.error('mapHandler not found!');
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