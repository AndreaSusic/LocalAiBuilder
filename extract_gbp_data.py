#!/usr/bin/env python3
"""
Extract Google Business Profile data from Kigen Plastika
GBP URL: https://g.co/kgs/y9oxxaQ
"""

import requests
import json
import re
from urllib.parse import urlparse, parse_qs

def extract_place_id_from_url(gbp_url):
    """Extract Google Place ID from various Google Maps URL formats"""
    
    # Handle g.co short URLs by following the redirect
    if 'g.co' in gbp_url:
        try:
            response = requests.get(gbp_url, allow_redirects=True, timeout=10)
            gbp_url = response.url
        except:
            print(f"Could not follow redirect for {gbp_url}")
            return None
    
    print(f"Processing URL: {gbp_url}")
    
    # Look for place_id in URL parameters
    parsed = urlparse(gbp_url)
    params = parse_qs(parsed.query)
    if 'place_id' in params:
        return params['place_id'][0]
    
    # Look for place_id in the URL path or fragment
    place_id_match = re.search(r'place_id=([A-Za-z0-9_-]+)', gbp_url)
    if place_id_match:
        return place_id_match.group(1)
    
    # Look for /maps/place/ format with place ID
    maps_match = re.search(r'/maps/place/[^/]+/.*?0x[0-9a-f]+:0x[0-9a-f]+', gbp_url)
    if maps_match:
        # Extract the hex coordinates and try to convert
        coords_match = re.search(r'0x([0-9a-f]+):0x([0-9a-f]+)', gbp_url)
        if coords_match:
            print(f"Found coordinates: {coords_match.group(1)}:{coords_match.group(2)}")
            return f"hex_coords_{coords_match.group(1)}_{coords_match.group(2)}"
    
    print("Could not extract place_id from URL")
    return None

def get_business_info_from_maps_url(gbp_url):
    """Extract basic business information from Google Maps URL"""
    
    # Get the full URL after redirects
    try:
        response = requests.get(gbp_url, allow_redirects=True, timeout=10)
        final_url = response.url
        page_content = response.text[:5000]  # Get first 5000 chars
        
        print(f"Final URL: {final_url}")
        
        # Extract business name from URL path
        business_name = None
        name_match = re.search(r'/maps/place/([^/@]+)', final_url)
        if name_match:
            business_name = name_match.group(1).replace('+', ' ').replace('%20', ' ')
            print(f"Extracted business name: {business_name}")
        
        # Look for structured data in the page
        info = {
            'name': business_name,
            'url': final_url,
            'place_id': extract_place_id_from_url(final_url)
        }
        
        # Try to extract additional info from page content
        # Look for address patterns
        address_patterns = [
            r'"address":"([^"]+)"',
            r'"streetAddress":"([^"]+)"',
            r'data-value="([^"]*Serbia[^"]*)"'
        ]
        
        for pattern in address_patterns:
            match = re.search(pattern, page_content)
            if match:
                info['address'] = match.group(1)
                break
        
        # Look for phone number
        phone_patterns = [
            r'"telephone":"([^"]+)"',
            r'tel:([+\d\s-]+)',
            r'\+\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4}'
        ]
        
        for pattern in phone_patterns:
            match = re.search(pattern, page_content)
            if match:
                info['phone'] = match.group(1)
                break
        
        return info
        
    except Exception as e:
        print(f"Error fetching URL: {e}")
        return None

# Test with the provided URL
gbp_url = "https://g.co/kgs/y9oxxaQ"
business_info = get_business_info_from_maps_url(gbp_url)

if business_info:
    print("\n=== EXTRACTED BUSINESS INFORMATION ===")
    print(json.dumps(business_info, indent=2, ensure_ascii=False))
    
    # Save to file for use in the application
    with open('kigen_plastika_gbp.json', 'w', encoding='utf-8') as f:
        json.dump(business_info, f, indent=2, ensure_ascii=False)
    
    print("\nBusiness info saved to kigen_plastika_gbp.json")
else:
    print("Could not extract business information")