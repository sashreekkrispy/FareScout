// utils/fareCalculator.js

// Define base rates for different services.
const baseRates = {
    "Uber Go": {
      baseFare: 50,
      perKm: 7,
      perMinute: 1,
      minimumFare: 60,
    },
    "Uber Premier": {
      baseFare: 80,
      perKm: 14,
      perMinute: 1.5,
      minimumFare: 120,
    },
    "Ola Mini": {
      baseFare: 45,
      perKm: 7,
      perMinute: 1,
      minimumFare: 60,
    },
    "Ola Prime": {
      baseFare: 75,
      perKm: 12,
      perMinute: 1.5,
      minimumFare: 100,
    },
  };
  
  // Helper function: Convert degrees to radians.
  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
  
  // Calculate distance using the Haversine formula.
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  // Estimate travel time in minutes based on average speed (25 km/h).
  function estimateTravelTime(distanceKm) {
    return (distanceKm / 25) * 60;
  }
  
  // Calculate surge factor based on time and an optional demand factor.
  function getSurgeFactor(currentTime, demandFactor = 1.0) {
    const hour = currentTime.getHours();
    let surge = 1.0;
  
    if (hour >= 7 && hour <= 10) {
      surge = 1.3; // Morning rush
    } else if (hour >= 17 && hour <= 20) {
      surge = 1.4; // Evening rush
    } else if (hour >= 22 || hour <= 5) {
      surge = 1.2; // Late night
    }
  
    return surge * demandFactor;
  }
  
  // Main function to calculate fare estimates given pickup/drop locations.
  export function calculateFareEstimates(pickupLocation, dropLocation, currentTime = new Date(), demandFactor = 1.0) {
    const distanceKm = calculateDistance(
      pickupLocation.lat,
      pickupLocation.lng,
      dropLocation.lat,
      dropLocation.lng
    );
    const estimatedMinutes = estimateTravelTime(distanceKm);
    const surgeFactor = getSurgeFactor(currentTime, demandFactor);
    
    // We'll use a counter to generate a unique id for each fare estimate.
    let idCounter = 0;
    
    // Generate estimates for each service and group them by provider.
    const priceEstimates = Object.entries(baseRates).reduce((acc, [serviceName, rates]) => {
      let fare = rates.baseFare + distanceKm * rates.perKm + estimatedMinutes * rates.perMinute;
      fare = fare * surgeFactor;
      fare = Math.max(fare, rates.minimumFare);
      const roundedFare = Math.round(fare);
      const minFare = Math.round(roundedFare * 0.9);
      const maxFare = Math.round(roundedFare * 1.1);
    
      // Determine provider key based on serviceName (using lowercase for consistency)
      const providerKey = serviceName.toLowerCase().includes("uber") ? "uber" : "ola";
    
      const estimate = {
        id: `${serviceName}-${idCounter++}`, // Unique id, e.g. "Uber Go-0"
        service: serviceName,
        provider: providerKey,
        estimatedFare: roundedFare,
        fareRange: `₹${minFare} - ₹${maxFare}`,
        distance: Math.round(distanceKm * 10) / 10,
        duration: Math.round(estimatedMinutes),
        surgeMultiplier: surgeFactor,
      };
    
      if (!acc[providerKey]) {
        acc[providerKey] = [];
      }
      acc[providerKey].push(estimate);
      return acc;
    }, {});
    
    return priceEstimates;
  }
  