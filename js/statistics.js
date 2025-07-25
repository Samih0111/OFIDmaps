// statistics.js - Statistics functionality module

const StatisticsManager = {
    // Update project statistics display
    updateStatistics(filteredData = null) {
        // Use filtered data if provided, otherwise use all data
        const dataToUse = filteredData || window.islandData;
        
        if (!dataToUse || dataToUse.length === 0) {
            // Show empty state
            const statsContainer = document.getElementById('statsContent');
            if (statsContainer) {
                statsContainer.innerHTML = `
                    <div class="text-center text-gray-500">
                        <p>No islands match current filters</p>
                    </div>
                `;
            }
            return;
        }

        // Get current filter criteria to determine which project types to show
        const currentFilter = window.mapHandler ? window.mapHandler.currentFilter : null;
        const selectedProjectTypes = currentFilter && currentFilter.projectType && currentFilter.projectType.length > 0 
            ? currentFilter.projectType 
            : ['water', 'sewerage', 'harbour', 'desalination'];
        const selectedFundingAgencies = currentFilter && currentFilter.funding && currentFilter.funding.length > 0 
            ? currentFilter.funding 
            : null;

        // Calculate project counts respecting funding agency filters
        const activeProjects = {
            water: dataToUse.filter(island => {
                const project = island.projects && island.projects.water;
                if (!project || !project.funding) return false;
                return selectedFundingAgencies ? selectedFundingAgencies.includes(project.funding) : true;
            }).length,
            sewerage: dataToUse.filter(island => {
                const project = island.projects && island.projects.sewerage;
                if (!project || !project.funding) return false;
                return selectedFundingAgencies ? selectedFundingAgencies.includes(project.funding) : true;
            }).length,
            harbour: dataToUse.filter(island => {
                const project = island.projects && island.projects.harbour;
                if (!project || !project.funding) return false;
                return selectedFundingAgencies ? selectedFundingAgencies.includes(project.funding) : true;
            }).length,
            desalination: dataToUse.filter(island => {
                const project = island.projects && island.projects.desalination;
                if (!project || !project.funding) return false;
                return selectedFundingAgencies ? selectedFundingAgencies.includes(project.funding) : true;
            }).length
        };

        // Build statistics HTML based on selected project types
        let projectStatsHtml = '';
        
        if (selectedProjectTypes.includes('water')) {
            projectStatsHtml += `
                <div class="flex justify-between">
                    <span class="text-gray-600">Water Projects:</span>
                    <span class="font-semibold text-blue-600">${activeProjects.water}</span>
                </div>`;
        }
        
        if (selectedProjectTypes.includes('sewerage')) {
            projectStatsHtml += `
                <div class="flex justify-between">
                    <span class="text-gray-600">Sewerage Projects:</span>
                    <span class="font-semibold text-green-600">${activeProjects.sewerage}</span>
                </div>`;
        }
        
        if (selectedProjectTypes.includes('harbour')) {
            projectStatsHtml += `
                <div class="flex justify-between">
                    <span class="text-gray-600">Harbour Projects:</span>
                    <span class="font-semibold text-yellow-600">${activeProjects.harbour}</span>
                </div>`;
        }
        
        if (selectedProjectTypes.includes('desalination')) {
            projectStatsHtml += `
                <div class="flex justify-between">
                    <span class="text-gray-600">Desalination:</span>
                    <span class="font-semibold text-purple-600">${activeProjects.desalination}</span>
                </div>`;
        }

        const statsHtml = `
            <div class="space-y-3">
                <div class="flex justify-between">
                    <span class="text-gray-600">Total Islands:</span>
                    <span class="font-semibold">${dataToUse.length}</span>
                </div>
                ${projectStatsHtml}
            </div>
        `;

        const statsContainer = document.getElementById('statsContent');
        if (statsContainer) {
            statsContainer.innerHTML = statsHtml;
        }
    },

    // Generate atoll navigation buttons
    generateAtollButtons() {
        if (!window.islandData || window.islandData.length === 0) {
            return;
        }

        const atolls = [...new Set(window.islandData.map(island => island.atoll))].sort();
        const buttonsContainer = document.getElementById('atollButtons');
        
        if (!buttonsContainer) {
            return;
        }

        atolls.forEach(atoll => {
            const button = document.createElement('button');
            button.className = 'atoll-btn px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition duration-200';
            button.textContent = atoll;
            button.setAttribute('data-atoll', atoll);
            button.addEventListener('click', () => {
                if (window.AtollSummaryManager) {
                    window.AtollSummaryManager.showAtollSummary(atoll);
                }
            });
            buttonsContainer.appendChild(button);
        });
    }
};

// Export for global access
window.StatisticsManager = StatisticsManager;