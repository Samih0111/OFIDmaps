// atoll-summary.js - Atoll summary functionality module

const AtollSummaryManager = {
    // Show atoll summary panel
    showAtollSummary(atollCode) {
        if (!window.islandData || window.islandData.length === 0) {
            return;
        }

        // Focus map on the selected atoll
        if (window.mapHandler && window.mapHandler.focusOnAtoll) {
            window.mapHandler.focusOnAtoll(atollCode);
        }

        const atollIslands = window.islandData.filter(island => island.atoll === atollCode);
        const panel = document.getElementById('atollSummaryPanel');
        const title = document.getElementById('atollSummaryTitle');
        const content = document.getElementById('atollSummaryContent');
        
        if (!panel || !title || !content) {
            return;
        }

        title.textContent = `${atollCode} Atoll Summary`;
        
        let summaryHtml = `
            <div class="mb-6">
                <h4 class="text-lg font-semibold mb-2">Overview</h4>
                <p>Total Islands: <strong>${atollIslands.length}</strong></p>
                <p>Total Population: <strong>${atollIslands.reduce((sum, island) => sum + (island.population || 0), 0).toLocaleString()}</strong></p>
            </div>
            
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                <div class="flex items-center">
                                    <span class="mr-2">Details</span>
                                    <span>Island</span>
                                </div>
                            </th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Population</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Water</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sewerage</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Harbour</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Desalination</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Proposed for Funding</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ongoing Harbor Project</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
        `;
        
        atollIslands.forEach((island, index) => {
            const islandId = `${atollCode}-${index}`;
            summaryHtml += `
                <tr class="hover:bg-gray-50">
                    <td class="px-4 py-2">
                        <div class="flex items-center">
                            <button class="dropdown-toggle mr-3 p-1 hover:bg-gray-200 rounded transition-colors" 
                                    onclick="window.AtollSummaryManager.toggleDropdown('${islandId}')" 
                                    aria-expanded="false">
                                <svg class="w-4 h-4 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                            <span class="font-medium text-gray-900">${island.locality}</span>
                        </div>
                    </td>
                    <td class="px-4 py-2 text-gray-600">${island.population?.toLocaleString() || 'N/A'}</td>
                    <td class="px-4 py-2">
                        ${this.getStatusBadge(island.projects.water?.status)}
                    </td>
                    <td class="px-4 py-2">
                        ${this.getStatusBadge(island.projects.sewerage?.status)}
                    </td>
                    <td class="px-4 py-2">
                        ${this.getStatusBadge(island.projects.harbour?.status)}
                    </td>
                    <td class="px-4 py-2">
                        ${this.getStatusBadge(island.projects.desalination?.status)}
                    </td>
                    <td class="px-4 py-2">
                        ${this.getProposedFundingBadge(island.proposedForFunding)}
                    </td>
                    <td class="px-4 py-2">
                        ${this.getOngoingHarborBadge(island.ongoingHarborProject)}
                    </td>
                </tr>
                <tr id="dropdown-${islandId}" class="island-details hidden">
                    <td colspan="8" class="px-4 py-0">
                        <div class="bg-gray-50 border-l-4 border-blue-500 p-4 my-2 rounded-r">
                            <!-- Island Basic Information -->
                            <div class="mb-4 p-3 bg-white rounded border">
                                <h4 class="font-semibold text-sm text-gray-800 mb-2">Island Information</h4>
                                <div class="grid grid-cols-2 gap-2 text-xs">
                                    <div><span class="font-medium text-gray-600">Area (sq km):</span> <span class="text-gray-800">${island.area_sq_km || '-'}</span></div>
                                    <div></div>
                                    <div><span class="font-medium text-gray-600">Proposed for Funding:</span> <span class="text-gray-800">${island.proposedForFunding || 'no'}</span></div>
                                    <div><span class="font-medium text-gray-600">Ongoing Harbor Project:</span> <span class="text-gray-800">${island.ongoingHarborProject || 'no'}</span></div>
                                </div>
                            </div>
                            
                            <!-- Project Details -->
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                ${this.generateProjectDetails('Water Network', island.projects.water)}
                                ${this.generateProjectDetails('Sewerage Network', island.projects.sewerage)}
                                ${this.generateProjectDetails('Harbour', island.projects.harbour)}
                                ${this.generateProjectDetails('Desalination Plant', island.projects.desalination)}
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        summaryHtml += `
                    </tbody>
                </table>
            </div>
        `;
        
        content.innerHTML = summaryHtml;
        panel.classList.remove('hidden');
    },

    // Helper function to get status badge
    getStatusBadge(status) {
        if (status === null || status === undefined || status === '') {
            return '<span class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">-</span>';
        }
        
        const statusLower = String(status).toLowerCase();
        if (statusLower.includes('completed')) {
            return `<span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">${status}</span>`;
        } else if (statusLower.includes('progress')) {
            return `<span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">${status}</span>`;
        } else {
            return `<span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">${status}</span>`;
        }
    },

    // Helper function to get proposed funding badge
    getProposedFundingBadge(value) {
        if (value === null || value === undefined || value === '') {
            return '<span class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">-</span>';
        }
        return `<span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">${value}</span>`;
    },

    // Helper function to get ongoing harbor badge
    getOngoingHarborBadge(value) {
        if (value === null || value === undefined || value === '') {
            return '<span class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">-</span>';
        }
        return `<span class="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">${value}</span>`;
    },

    // Generate detailed project information
    generateProjectDetails(projectName, projectData) {
        const formatValue = (value) => (value === null || value === undefined || value === '') ? '-' : value;
        
        let fields = [];
        
        // Always show funding, phase, and status for all project types
        fields.push(`<div><span class="font-medium text-gray-600">Funding:</span> <span class="text-gray-800">${formatValue(projectData?.funding)}</span></div>`);
        fields.push(`<div><span class="font-medium text-gray-600">Phase:</span> <span class="text-gray-800">${formatValue(projectData?.phase)}</span></div>`);
        fields.push(`<div><span class="font-medium text-gray-600">Status:</span> <span class="text-gray-800">${formatValue(projectData?.status)}</span></div>`);
        
        // Add project-specific fields
        if (projectName === 'Water Network') {
            fields.push(`<div><span class="font-medium text-gray-600">Network Length (m):</span> <span class="text-gray-800">${formatValue(projectData?.network_length_m)}</span></div>`);
            fields.push(`<div><span class="font-medium text-gray-600">Connections:</span> <span class="text-gray-800">${formatValue(projectData?.connections_nos)}</span></div>`);
            fields.push(`<div><span class="font-medium text-gray-600">Tanks (m³):</span> <span class="text-gray-800">${formatValue(projectData?.tanks_m3)}</span></div>`);
        } else if (projectName === 'Sewerage Network') {
            fields.push(`<div><span class="font-medium text-gray-600">Network Length (m):</span> <span class="text-gray-800">${formatValue(projectData?.network_length_m)}</span></div>`);
            fields.push(`<div><span class="font-medium text-gray-600">Connections:</span> <span class="text-gray-800">${formatValue(projectData?.connections)}</span></div>`);
        } else if (projectName === 'Harbour') {
            fields.push(`<div><span class="font-medium text-gray-600">Info:</span> <span class="text-gray-800">${formatValue(projectData?.info)}</span></div>`);
        }

        return `
            <div class="bg-white p-3 rounded border">
                <h4 class="font-semibold text-sm text-gray-800 mb-2">${projectName}</h4>
                <div class="space-y-1 text-xs">
                    ${fields.join('')}
                </div>
            </div>
        `;
    },

    // Toggle dropdown for island details
    toggleDropdown(islandId) {
        const dropdown = document.getElementById(`dropdown-${islandId}`);
        const button = document.querySelector(`button[onclick*="${islandId}"]`);
        const icon = button?.querySelector('svg');
        
        if (dropdown && button && icon) {
            const isHidden = dropdown.classList.contains('hidden');
            
            if (isHidden) {
                dropdown.classList.remove('hidden');
                icon.style.transform = 'rotate(90deg)';
                button.setAttribute('aria-expanded', 'true');
            } else {
                dropdown.classList.add('hidden');
                icon.style.transform = 'rotate(0deg)';
                button.setAttribute('aria-expanded', 'false');
            }
        }
    },

    // Close atoll summary panel
    closeAtollPanel() {
        const panel = document.getElementById('atollSummaryPanel');
        if (panel) {
            panel.classList.add('hidden');
        }
    },

    // Setup event listeners for atoll summary
    setupEventListeners() {
        const closeButton = document.getElementById('closeAtollPanel');
        if (closeButton) {
            closeButton.addEventListener('click', this.closeAtollPanel.bind(this));
        }
    }
};

// Export for global access
window.AtollSummaryManager = AtollSummaryManager;