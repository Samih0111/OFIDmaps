// mobile-gestures.js - Touch gestures and mobile enhancements

const MobileGestureManager = {
    startX: 0,
    startY: 0,
    isFilterOpen: false,
    
    init() {
        this.setupSwipeGestures();
        this.setupTouchEvents();
        this.addMobileFloatingControls();
        console.log('Mobile gesture manager initialized');
    },
    
    setupSwipeGestures() {
        let startX, startY, endX, endY;
        
        // Listen for touch events on the entire document
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!e.changedTouches[0]) return;
            
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const minSwipeDistance = 100;
            
            // Horizontal swipe detection
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    // Swipe right - open filters
                    this.openFilters();
                } else {
                    // Swipe left - close filters
                    this.closeFilters();
                }
            }
        }, { passive: true });
    },
    
    setupTouchEvents() {
        // Prevent double-tap zoom on buttons
        const buttons = document.querySelectorAll('button, .atoll-btn');
        buttons.forEach(button => {
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                button.click();
            });
        });
        
        // Enhanced touch feedback for filter elements
        const filterElements = document.querySelectorAll('.filter-section label, .special-filter-circle');
        filterElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            }, { passive: true });
            
            element.addEventListener('touchend', () => {
                setTimeout(() => {
                    element.style.backgroundColor = '';
                }, 150);
            }, { passive: true });
        });
    },
    
    addMobileFloatingControls() {
        // Create a floating control panel for quick actions
        const floatingPanel = document.createElement('div');
        floatingPanel.className = 'mobile-floating-panel';
        floatingPanel.innerHTML = `
            <button class="floating-control-btn" id="floatingStatsBtn" title="Show Statistics">
                📊
            </button>
            <button class="floating-control-btn" id="floatingResetBtn" title="Reset Map">
                🔄
            </button>
        `;
        
        document.body.appendChild(floatingPanel);
        
        // Add event listeners
        document.getElementById('floatingStatsBtn').addEventListener('click', this.toggleStatistics);
        document.getElementById('floatingResetBtn').addEventListener('click', this.resetMap);
        
        // Add CSS for floating panel
        this.addFloatingPanelStyles();
    },
    
    addFloatingPanelStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .mobile-floating-panel {
                position: fixed;
                bottom: 90px;
                right: 20px;
                display: none;
                flex-direction: column;
                gap: 10px;
                z-index: 999;
            }
            
            @media (max-width: 1024px) {
                .mobile-floating-panel {
                    display: none;
                }
            }
            
            .floating-control-btn {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: none;
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(10px);
                box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
                font-size: 1.2rem;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                touch-action: manipulation;
                user-select: none;
            }
            
            .floating-control-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
            }
            
            .floating-control-btn:active {
                transform: scale(0.9);
            }
        `;
        document.head.appendChild(style);
    },
    
    openFilters() {
        const filterContainer = document.getElementById('filterContainer');
        if (filterContainer && window.innerWidth <= 1024) {
            filterContainer.classList.add('mobile-visible');
            this.isFilterOpen = true;
        }
    },
    
    closeFilters() {
        const filterContainer = document.getElementById('filterContainer');
        if (filterContainer && window.innerWidth <= 1024) {
            filterContainer.classList.remove('mobile-visible');
            this.isFilterOpen = false;
        }
    },
    
    toggleStatistics() {
        const statsContainer = document.getElementById('statisticsContainer');
        if (statsContainer) {
            statsContainer.scrollIntoView({ behavior: 'smooth' });
        }
    },
    
    resetMap() {
        if (window.FilterManager) {
            window.FilterManager.resetFilters();
        }
        
        // Add visual feedback
        const resetBtn = document.getElementById('floatingResetBtn');
        if (resetBtn) {
            resetBtn.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                resetBtn.style.transform = '';
            }, 500);
        }
    },
    
    // Add haptic feedback for supported devices
    hapticFeedback() {
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
};

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MobileGestureManager.init());
} else {
    MobileGestureManager.init();
}

// Export for global access
window.MobileGestureManager = MobileGestureManager;