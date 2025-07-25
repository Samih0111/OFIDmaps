// component-loader.js - Utility for loading HTML components

const ComponentLoader = {
    // Load a component and inject it into a target element
    async loadComponent(componentPath, targetElementId) {
        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentPath}`);
            }
            
            const htmlContent = await response.text();
            const targetElement = document.getElementById(targetElementId);
            
            if (!targetElement) {
                throw new Error(`Target element not found: ${targetElementId}`);
            }
            
            targetElement.innerHTML = htmlContent;
            return true;
        } catch (error) {
            console.error('Component loading error:', error);
            return false;
        }
    },

    // Load multiple components
    async loadComponents(components) {
        const loadPromises = components.map(({ path, target }) => 
            this.loadComponent(path, target)
        );
        
        try {
            const results = await Promise.all(loadPromises);
            return results.every(result => result === true);
        } catch (error) {
            console.error('Error loading components:', error);
            return false;
        }
    },

    // Initialize all components for the application
    async initializeComponents() {
        const timestamp = Date.now(); // Cache busting
        const components = [
            { path: `components/filter-section.html?v=${timestamp}`, target: 'filterContainer' },
            { path: `components/statistics-panel.html?v=${timestamp}`, target: 'statisticsContainer' },
            { path: `components/atoll-summary-panel.html?v=${timestamp}`, target: 'atollSummaryContainer' }
        ];

        const success = await this.loadComponents(components);
        
        if (success) {
            console.log('All components loaded successfully');
            return true;
        } else {
            console.error('Some components failed to load');
            return false;
        }
    }
};

// Export for global access
window.ComponentLoader = ComponentLoader;