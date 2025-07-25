# Product Requirements Document: Interactive Maldives Project Map

**Version:** 2.0  
**Date:** 25 July 2025

## 1. Introduction & Vision
To develop a web-based, interactive map application that provides a comprehensive, filterable, and user-friendly visualization of infrastructure projects (Water, Sewerage, Harbour, Desalination, etc.) across all islands of the Maldives. The tool is intended for planning, analysis, and public information purposes.

## 2. Core Features & User Stories

### 2.1. Map Visualization & Filtering
**Story 1: Base Map & Markers**  
- As a user, I want to see a map of the Maldives centered on the screen upon loading the page.  
- As a user, I want to see every island from the dataset represented by a default marker on the map.

**Story 2: Advanced Filtering & Highlighting**  
- As a user, I want to be able to filter the islands based on:  
  - Funding Agency (e.g., OFID, Government of Maldives)  
  - Project Phase (e.g., Phase 1, Phase 2)  
- As a user, I want to be able to combine these filters (e.g., show all "OFID" projects that are in "Phase 1").  
- As a user, when I apply a filter, I want the islands that match my criteria to be highlighted with a colored circle. The color of the circle must correspond to the Funding Agency (e.g., OFID projects are blue, GoM projects are green).

### 2.2. Interactive Information Display
**Story 3: Hover-to-View Island Details**  
- As a user, when I hover my mouse over a highlighted island's circle, I want a pop-up window (tooltip) to appear instantly.  
- As a user, this pop-up window should display all the detailed project information for that specific island as listed in the datasheet.

### 2.3. Atoll-Centric View
**Story 4: Atoll Selection & Focus**  
- As a user, I want to see a dedicated section on the page with buttons for each Atoll (e.g., "HA", "HDh", "Sh", etc.).  
- As a user, when I click an Atoll button (e.g., "HA"), I want the map to automatically pan and zoom to focus on that specific atoll.

**Story 5: Atoll Information Panel with Drill-Down**  
- As a user, when I click an Atoll button, I want a summary panel to appear, listing all the islands within that atoll.  
- As a user, this summary panel should initially display a table with the following columns:  
  - Island Name  
  - Population  
  - Water Network (Status)  
  - Sewerage Network (Status)  
  - Harbour (Status)  
  - Desalination Plant (Status)  
  - Proposed for funding (Yes/No)  
- As a user, I want the project status columns (e.g., "Water Network") in this table to be clickable. When I click one, it should expand to show the detailed sub-headings for that project (Funding, Phase, Status, Price, Network, Connections, Tank, etc.). This allows for a clean overview with the option to drill down into specifics.

## 3. Data & Technical Requirements
- **Data Source:** The provided CSV file (Book(Sheet1).csv).  
- **Data Processing:** The CSV data will be converted to a JSON format. Crucially, latitude and longitude coordinates will be added for each island to enable map plotting.  
- **Color-Coding:** We will define a specific color for each funding agency to be used for the map circles. (e.g., OFID: #007bff, GoM: #28a745, etc.).  
- **Technology Stack:** HTML, Tailwind CSS, JavaScript, Google Maps JavaScript API.

## 4. Phased Development Plan
We will build the application in four distinct phases:

### Phase 1: Foundation - Data & Basic Map
**Goal:** Get the data ready and display a basic map.  
**Tasks:**  
- Convert CSV to JSON.  
- Research and add latitude/longitude for all islands.  
- Set up the HTML structure.  
- Implement the initial Google Map centered on the Maldives.  
- Place a default marker on every island from the dataset.

### Phase 2: Core Interactivity - Filtering & Hover Info
**Goal:** Implement the main filtering and information-on-hover functionality.  
**Tasks:**  
- Create the UI for Funding and Phase filters (dropdowns/checkboxes).  
- Write the JavaScript logic to filter islands based on user selections.  
- Implement the color-coded circles for filtered results.  
- Create the on-hover pop-up/tooltip to display detailed island data.

### Phase 3: Atoll View - Selection & Summary Panel
**Goal:** Build the atoll-centric navigation and summary view.  
**Tasks:**  
- Dynamically create buttons for each atoll.  
- Implement the map pan/zoom functionality when an atoll button is clicked.  
- Create the atoll information panel.  
- Populate the panel with the initial summary table for the selected atoll.

### Phase 4: Final Polish - Drill-Down Functionality
**Goal:** Add the interactive drill-down feature to the atoll summary panel.  
**Tasks:**  
- Make the project columns in the summary table clickable.  
- Implement the "expand/collapse" (accordion) logic to show/hide the detailed project sub-headings.  
- Final styling and usability testing.

This PRD captures all your requested features and lays out a clear path forward. Once you approve this plan, I will begin with Phase 1.