#!/usr/bin/env python3
"""
CSV to JSON Converter for Maldives Infrastructure Project Data
This script converts the OFID project data CSV to a clean JSON format
suitable for the interactive map application.
"""

import pandas as pd
import json
import sys
import os
import re
import urllib.parse
import numpy as np

def clean_csv_data(input_file):
    """
    Clean and process the CSV data, handling the multi-header structure.
    """
    try:
        # Read the raw CSV file
        with open(input_file, 'r', encoding='utf-8') as file:
            lines = file.readlines()
        
        # Find the actual header row (contains "Atoll,Locality,Population")
        header_row_index = -1
        for i, line in enumerate(lines):
            if 'Atoll,Locality,Population' in line:
                header_row_index = i
                break
        
        if header_row_index == -1:
            raise ValueError("Could not find the main header row in the CSV file")
        
        # Extract the clean CSV content starting from the header row
        clean_lines = lines[header_row_index:]
        
        # Write the cleaned CSV to a temporary file
        temp_file = 'temp_cleaned.csv'
        with open(temp_file, 'w', encoding='utf-8') as file:
            file.writelines(clean_lines)
        
        # Read the cleaned CSV with pandas
        df = pd.read_csv(temp_file)
        
        # Clean up the temporary file
        os.remove(temp_file)
        
        return df
    
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return None

def extract_coordinates_from_google_maps_url(map_url):
    """
    Extract latitude and longitude from Google Maps URL or direct coordinate string.
    Supports various Google Maps URL formats and direct coordinate pairs.
    """
    if not map_url or pd.isna(map_url):
        return None, None
    
    try:
        map_str = str(map_url).strip()
        
        # Check if it's direct coordinates (latitude, longitude)
        # Pattern for direct coordinates like "7.011340988007471, 72.99857858303288"
        direct_coords_pattern = r'^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$'
        match = re.search(direct_coords_pattern, map_str)
        if match:
            lat = float(match.group(1))
            lng = float(match.group(2))
            return lat, lng
        
        # Pattern 1: Direct coordinates in URL like @lat,lng,zoom
        pattern1 = r'@(-?\d+\.?\d*),(-?\d+\.?\d*),\d+\.?\d*z?'
        match = re.search(pattern1, map_str)
        if match:
            lat = float(match.group(1))
            lng = float(match.group(2))
            return lat, lng
        
        # Pattern 2: Query parameters with ll= (latitude,longitude)
        pattern2 = r'll=(-?\d+\.?\d*),(-?\d+\.?\d*)'
        match = re.search(pattern2, map_str)
        if match:
            lat = float(match.group(1))
            lng = float(match.group(2))
            return lat, lng
        
        # Pattern 3: Query parameters with q= containing coordinates
        pattern3 = r'q=(-?\d+\.?\d*),(-?\d+\.?\d*)'
        match = re.search(pattern3, map_str)
        if match:
            lat = float(match.group(1))
            lng = float(match.group(2))
            return lat, lng
        
        # If URL is shortened (like goo.gl), we can't extract coordinates directly
        # For now, return None - these would need to be resolved or manually added
        return None, None
        
    except Exception as e:
        print(f"Error extracting coordinates from URL {map_str}: {e}")
        return None, None

def get_maldives_island_coordinates(atoll, locality):
    """
    Get approximate coordinates for Maldives islands based on atoll and locality.
    This is a fallback method for islands without map links.
    Returns approximate coordinates based on known atoll locations.
    """
    # Approximate center coordinates for each atoll in Maldives
    atoll_centers = {
        'HA': (6.8, 73.1),      # Haa Alif
        'HDh': (6.6, 73.0),     # Haa Dhaalu
        'Sh': (5.9, 73.3),      # Shaviyani
        'N': (5.8, 73.2),       # Noonu
        'R': (5.6, 73.0),       # Raa
        'B': (5.3, 73.0),       # Baa
        'Lh': (5.2, 73.2),      # Lhaviyani
        'K': (4.8, 73.5),       # Kaafu
        'AA': (3.9, 72.8),      # Alif Alif
        'ADh': (3.7, 72.9),     # Alif Dhaal
        'V': (3.2, 73.5),       # Vaavu
        'M': (3.0, 73.5),       # Meemu
        'F': (2.9, 73.0),       # Faafu
        'Dh': (2.2, 73.0),      # Dhaalu
        'Th': (1.8, 73.2),      # Thaa
        'L': (1.5, 73.2),       # Laamu
        'GA': (0.6, 73.1),      # Gaafu Alif
        'GDh': (0.2, 73.0),     # Gaafu Dhaalu
        'Gn': (-0.3, 73.4),     # Gnaviyani (Fuvahmulah)
        'S': (-0.7, 73.1),      # Seenu
    }
    
    if atoll in atoll_centers:
        base_lat, base_lng = atoll_centers[atoll]
        # Add small random offset for different islands in same atoll
        # In a real implementation, you'd want actual coordinates
        import random
        random.seed(hash(locality))  # Consistent random offset based on locality name
        lat_offset = (random.random() - 0.5) * 0.1  # ±0.05 degrees
        lng_offset = (random.random() - 0.5) * 0.1  # ±0.05 degrees
        return base_lat + lat_offset, base_lng + lng_offset
    
    return None, None

def structure_project_data(row):
    """
    Structure the project data into organized categories.
    """
    def clean_value(value):
        """Clean NaN and null values"""
        if pd.isna(value) or value == '' or str(value).strip() == '' or str(value) == 'nan':
            return None  
        # Handle numpy NaN values
        if hasattr(value, 'dtype') and pd.api.types.is_numeric_dtype(value) and pd.isna(value):
            return None
        return str(value).strip() if isinstance(value, str) else value
    
    projects = {
        'water_network': {
            'funding': clean_value(row.get('wat_Funding')),
            'phase': clean_value(row.get('wat_Phase')),
            'status': clean_value(row.get('wat_Status')),
            'network_length_m': clean_value(row.get('wat_Network (m)')),
            'connections_nos': clean_value(row.get('wat_Connections (nos)')),
            'tanks_m3': clean_value(row.get('wat_Tanks (m3)'))
        },
        'sewerage_network': {
            'funding': clean_value(row.get('sew_Funding')),
            'phase': clean_value(row.get('sew_Phase')),
            'status': clean_value(row.get('sew_Status')),
            'network_length_m': clean_value(row.get('sew_Network')),
            'connections': clean_value(row.get('sew_Connections'))
        },
        'harbour': {
            'funding': clean_value(row.get('har_Funding')),
            'phase': clean_value(row.get('har_hase ')),  # Note the space in column name
            'status': clean_value(row.get('har_Status')),
            'info': clean_value(row.get('har_Info'))
        },
        'desalination_plant': {
            'funding': clean_value(row.get('des_Funding')),
            'phase': clean_value(row.get('des_Phase ')),  # Note the space in column name
            'status': clean_value(row.get('des_Status'))
        },
        'proposed_for_funding': clean_value(row.get('Proposed_for_funding')),
        'ongoing_harbor_project': clean_value(row.get('Ongoing_Harbor_Project')),
        'urban_centers': clean_value(row.get('Urban_centers'))
    }
    
    return projects

def convert_to_json(df, output_file):
    """
    Convert the DataFrame to JSON format with proper structure.
    """
    islands_data = []
    coordinates_extracted = 0
    coordinates_estimated = 0
    
    for index, row in df.iterrows():
        # Skip rows with no atoll or locality data
        if pd.isna(row.get('Atoll')) or pd.isna(row.get('Locality')):
            continue
        
        # Extract coordinates from Google Maps URL if available
        map_link = row.get('MapLink')
        lat, lng = extract_coordinates_from_google_maps_url(map_link)
        
        if lat is not None and lng is not None:
            coordinates_extracted += 1
        else:
            # Use approximate coordinates based on atoll
            lat, lng = get_maldives_island_coordinates(row.get('Atoll'), row.get('Locality'))
            if lat is not None and lng is not None:
                coordinates_estimated += 1
        
        # Structure the island data
        island_data = {
            'atoll': row.get('Atoll'),
            'locality': row.get('Locality'),
            'population': int(str(row.get('Population')).strip()) if pd.notna(row.get('Population')) and str(row.get('Population')).strip().isdigit() else None,
            'area_sq_km': float(str(row.get('Area (in sq km)')).strip()) if pd.notna(row.get('Area (in sq km)')) and str(row.get('Area (in sq km)')).strip() and str(row.get('Area (in sq km)')).strip() != '' else None,
            'map_link': map_link if pd.notna(map_link) else None,
            
            # Add coordinates (extracted from map links or estimated)
            'coordinates': {
                'latitude': lat,
                'longitude': lng,
                'source': 'extracted' if coordinates_extracted > len(islands_data) else 'estimated' if lat else 'unknown'
            },
            
            # Structure the projects data
            'projects': structure_project_data(row)
        }
        
        islands_data.append(island_data)
    
    # Create the final JSON structure
    json_output = {
        'metadata': {
            'title': 'Maldives Infrastructure Projects Data',
            'description': 'Water, Sewerage, Harbour, and Desalination projects across Maldives islands',
            'total_islands': len(islands_data),
            'coordinates_info': {
                'extracted_from_maps': coordinates_extracted,
                'estimated_from_atoll': coordinates_estimated,
                'missing': len(islands_data) - coordinates_extracted - coordinates_estimated
            },
            'funding_agencies': list(set([
                island['projects']['water_network']['funding'] for island in islands_data 
                if island['projects']['water_network']['funding'] and island['projects']['water_network']['funding'] != 'None'
            ] + [
                island['projects']['sewerage_network']['funding'] for island in islands_data 
                if island['projects']['sewerage_network']['funding'] and island['projects']['sewerage_network']['funding'] != 'None'
            ] + [
                island['projects']['harbour']['funding'] for island in islands_data 
                if island['projects']['harbour']['funding'] and island['projects']['harbour']['funding'] != 'None'
            ] + [
                island['projects']['desalination_plant']['funding'] for island in islands_data 
                if island['projects']['desalination_plant']['funding'] and island['projects']['desalination_plant']['funding'] != 'None'
            ])),
            'atolls': list(set([island['atoll'] for island in islands_data if island['atoll'] and island['atoll'] != 'None' and str(island['atoll']).strip() != '']))
        },
        'islands': islands_data
    }
    
    # Custom JSON encoder to handle NaN values
    def json_serializer(obj):
        """Custom JSON serializer to handle pandas NaN values"""
        if pd.isna(obj):
            return None
        if isinstance(obj, (pd.Timestamp, pd.NaType)):
            return None
        if hasattr(obj, 'dtype'):
            if pd.api.types.is_numeric_dtype(obj) and pd.isna(obj):
                return None
        return obj
    
    # Write to JSON file
    try:
        # First convert all data to clean Python types
        clean_json_output = json.loads(json.dumps(json_output, default=json_serializer))
        
        with open(output_file, 'w', encoding='utf-8') as file:
            json.dump(clean_json_output, file, indent=2, ensure_ascii=False)
        
        # Print coordinate extraction summary
        print(f"\n📍 Coordinate extraction summary:")
        print(f"   - Extracted from Google Maps URLs: {coordinates_extracted}")
        print(f"   - Estimated from atoll location: {coordinates_estimated}")
        print(f"   - Missing coordinates: {len(islands_data) - coordinates_extracted - coordinates_estimated}")
        
        return True
    except Exception as e:
        print(f"Error writing JSON file: {e}")
        return False

def main():
    """
    Main function to execute the conversion.
    """
    # Set input and output file names
    input_file = 'OFIDtest1Sheet1.csv'
    output_file = 'maldives_projects_data.json'
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' not found.")
        print("Please ensure the CSV file is in the same directory as this script.")
        sys.exit(1)
    
    print(f"Reading CSV file: {input_file}")
    
    # Clean and read the CSV data
    df = clean_csv_data(input_file)
    if df is None:
        print("Failed to read and clean CSV data.")
        sys.exit(1)
    
    print(f"Successfully read {len(df)} rows from CSV file.")
    
    # Convert to JSON
    print(f"Converting to JSON format...")
    success = convert_to_json(df, output_file)
    
    if success:
        print(f"✅ Successfully converted CSV to JSON: {output_file}")
        print("\n📋 Next steps:")
        print("1. The JSON file includes coordinates extracted from Google Maps URLs")
        print("2. Islands without map links have estimated coordinates based on atoll location")
        print("3. The JSON file is ready to be used in your interactive map application")
        print("4. You can review and refine coordinates for islands with 'estimated' or 'unknown' coordinate sources")
    else:
        print("❌ Failed to convert CSV to JSON.")
        sys.exit(1)

if __name__ == "__main__":
    main()