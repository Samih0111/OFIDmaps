# CLAUDE.md - OFIDmap Project Documentation

## Project Overview
The **OFIDmap** is an interactive web application displaying infrastructure projects across the Maldives islands. It features dynamic filtering, project statistics, and detailed atoll summaries with Google Maps integration.

## Architecture

### Modular Structure
The application follows a modular architecture with separated concerns:

```
OFIDmap/
├── index.html                 # Main HTML file with component containers
├── components/                # HTML component files
│   ├── filter-section.html    # Filter interface with checkboxes
│   ├── statistics-panel.html  # Statistics display and atoll navigation
│   └── atoll-summary-panel.html # Dynamic atoll summary table
├── js/                        # JavaScript modules
│   ├── main.js                # Application initialization
│   ├── component-loader.js    # Dynamic HTML component loading
│   ├── map-handler.js         # Google Maps functionality
│   ├── filters.js             # Filter management
│   ├── statistics.js          # Statistics calculation
│   └── atoll-summary.js       # Atoll summary display
├── css/                       # Stylesheets
│   ├── main.css               # Main layout and common styles
│   └── components/            # Component-specific styles
│       ├── filters.css        # Filter interface styles
│       ├── statistics.css     # Statistics panel styles
│       └── atoll-summary.css  # Atoll summary styles
└── maldives_projects_data.json # Project data source
```

## Setup Instructions

### Prerequisites
- Modern web browser with JavaScript enabled
- Local web server (required due to CORS restrictions)
- Google Maps API key (already configured)

### Development Setup
1. **Clone/Download** the project files to your local machine
2. **Start a local web server** in the project directory:
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```
3. **Open browser** and navigate to `http://localhost:8000`

### Production Deployment
- Upload all files to your web server
- Ensure all file paths remain relative
- Verify Google Maps API key is valid for your domain

## Key Features

### 1. Interactive Filtering System
- **Funding Agency Filter**: OFID, Government of Maldives, World Bank, ADB
- **Project Phase Filter**: Phase 1, Phase 2, Phase 3
- **Project Type Filter**: Water Network, Sewerage Network, Harbour, Desalination Plant
- **Proposed for Funding**: Show only islands proposed for funding
- **Select All/Unselect All**: Bulk selection for each filter category
- **Real-time Filtering**: Immediate map and statistics updates

### 2. Dynamic Statistics
- Live project counts by type
- Total island count
- Color-coded legend for funding agencies
- Responsive atoll navigation buttons

### 3. Atoll Summary System
- Detailed island-by-island project breakdown
- Population and project status information
- Sortable tabular data
- Smooth scroll-to-view functionality

### 4. Google Maps Integration
- Satellite view of Maldives
- Color-coded markers by funding agency
- Interactive info windows with project details
- Automatic map bounds adjustment for filtered results

## Development Guidelines

### Adding New Features
1. **Components**: Create new HTML files in `components/` directory
2. **JavaScript**: Add new modules in `js/` directory with global exports
3. **Styles**: Create component-specific CSS in `css/components/`
4. **Data**: Update `maldives_projects_data.json` for new project data

### Code Structure
- **Global Variables**: Defined in `main.js` and exported to `window` object
- **Module Communication**: Uses global object references (`window.FilterManager`, etc.)
- **Event Handling**: Each module manages its own event listeners
- **Error Handling**: Comprehensive try-catch blocks with user feedback

### CSS Organization
- **TailwindCSS**: Primary utility framework (loaded via CDN)
- **Component Styles**: Specific styling for custom components
- **Responsive Design**: Mobile-first approach with breakpoints
- **Print Styles**: Optimized for printing maps and statistics

## Data Structure

### Island Data Format
```json
{
  "atoll": "HA",
  "locality": "Island Name",
  "population": 1234,
  "coordinates": {
    "lat": 6.7833,
    "lng": 73.0833
  },
  "projects": {
    "water": {"funding": "OFID", "phase": "Phase 2", "status": "Completed"},
    "sewerage": {"funding": "", "phase": "", "status": ""},
    "harbour": {"funding": "", "phase": "", "status": ""},
    "desalination": {"funding": "", "phase": "", "status": ""}
  },
  "proposedForFunding": "yes"
}
```

## Testing

### Manual Testing Checklist
- [ ] All components load without errors
- [ ] Filters work correctly (individual and combined)
- [ ] Select All/Unselect All buttons function properly
- [ ] Statistics update in real-time
- [ ] Atoll summary displays correctly
- [ ] Map markers filter appropriately
- [ ] Info windows show accurate data
- [ ] Responsive design works on mobile devices

### Common Commands
```bash
# Start development server
python3 -m http.server 8000

# Check for JavaScript errors (in browser console)
# Open Developer Tools → Console tab

# Validate HTML
# Use online HTML validator or browser dev tools

# Check network requests
# Open Developer Tools → Network tab
```

## Troubleshooting

### Common Issues

**1. Components not loading**
- Ensure web server is running (not opening file:// directly)
- Check browser console for fetch errors
- Verify all component files exist in `/components/` directory

**2. Map not displaying**
- Check Google Maps API key validity
- Verify internet connection
- Check browser console for API errors

**3. Filters not working**
- Ensure all JavaScript modules are loading
- Check for JavaScript errors in console
- Verify event listeners are properly bound

**4. Data not loading**
- Confirm `maldives_projects_data.json` is accessible
- Check for JSON syntax errors
- Verify web server is serving JSON files

### Browser Compatibility
- **Recommended**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Required Features**: ES6 modules, Fetch API, CSS Grid, Flexbox
- **Fallbacks**: TailwindCSS provides automatic vendor prefixes

## Performance Optimization

### Current Optimizations
- **Modular Loading**: Components loaded asynchronously
- **CSS Organization**: Separated component styles for better caching
- **Image Optimization**: Uses Google Maps built-in optimizations
- **Event Delegation**: Efficient event handling for dynamic content

### Future Improvements
- **Lazy Loading**: Load components only when needed
- **Service Workers**: Offline capability and caching
- **Bundle Optimization**: Minify CSS/JS for production
- **Image CDN**: Optimize marker icons and static assets

## API Dependencies

### Google Maps JavaScript API
- **Current Key**: Configured in `index.html`
- **Required Libraries**: `places` library enabled
- **Usage**: Map display, markers, info windows, bounds adjustment

### External Resources
- **TailwindCSS**: Loaded via CDN for styling utilities
- **Google Fonts**: Automatic loading for consistent typography

## Change Log

### Recent Updates
- **Modular Architecture**: Separated components, CSS, and JavaScript
- **Enhanced Filters**: Added checkbox-based filtering with select all/unselect all
- **Proposed Funding Filter**: New filter for islands proposed for funding  
- **Component Loader**: Dynamic HTML component loading system
- **Responsive Design**: Improved mobile and tablet layouts

### Migration Notes
- Moved from monolithic HTML file to modular structure
- Converted dropdown filters to checkbox-based system
- Separated inline styles to component-specific CSS files
- Updated event handling for modular architecture

---

**Last Updated**: July 2025  
**Version**: 2.0 (Modular Architecture)  
**Maintainer**: Development Team