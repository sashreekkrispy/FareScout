import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, 
  ScrollView, Modal, Image, StatusBar, Dimensions, Animated
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import axios from "axios";
import * as Location from "expo-location";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { calculateFareEstimates } from "../../utils/fareCalculator";
import { Linking } from 'react-native';




const Colors = {
  PRIMARY: "#000000",
  SECONDARY: "#FFFFFF",
  ACCENT: "#276EF1",
  GRAY: "#6E6E6E",
  LIGHT_GRAY: "#F0F0F0",
  BACKGROUND: "#FFFFFF",
  CARD_BG: "#FFFFFF",
  SHADOW: "rgba(0, 0, 0, 0.1)",
  DIVIDER: "#E0E0E0",
  UBER_COLOR: "#000000",
  OLA_COLOR: "#4CAF50",
  RAPIDO_COLOR: "#F44336",
};

// Map styles
const standardMapStyle = null; // Default Google Maps style
const blackAndWhiteMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{"color": "#f5f5f5"}]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{"visibility": "off"}]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#616161"}]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{"color": "#f5f5f5"}]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#bdbdbd"}]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{"color": "#eeeeee"}]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#757575"}]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{"color": "#e5e5e5"}]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#9e9e9e"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{"color": "#ffffff"}]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#757575"}]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{"color": "#dadada"}]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#616161"}]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#9e9e9e"}]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{"color": "#e5e5e5"}]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [{"color": "#eeeeee"}]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{"color": "#c9c9c9"}]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#9e9e9e"}]
  }
];

const { width, height } = Dimensions.get("window");

const CARD_HEIGHT = 130;
const CARD_WIDTH = width * 0.85;

// Provider options
const providers = [
  {
    id: "uber",
    name: "Uber",
    color: Colors.UBER_COLOR,
    icon: "car",
  },
  {
    id: "ola",
    name: "Ola",
    color: Colors.OLA_COLOR,
    icon: "taxi",
  },
  {
    id: "rapido",
    name: "Rapido",
    color: Colors.RAPIDO_COLOR,
    icon: "motorcycle",
  }
];

export default function HomeScreen() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [places, setPlaces] = useState([]);
  const [region, setRegion] = useState(null);
  const [location, setLocation] = useState(null);
  const [showFares, setShowFares] = useState(false);
  const [selectedFare, setSelectedFare] = useState(null);
  const [scrollX] = useState(new Animated.Value(0));
  const [isBlackAndWhiteMap, setIsBlackAndWhiteMap] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("uber");
  const [isSourceSearch, setIsSourceSearch] = useState(false);
  const [sourcePlaces, setSourcePlaces] = useState([]);

  // Mock fares for each provider with prices in rupees
  // const mockFares = {
  //   uber: [
  //     { 
  //       id: "uber-1", 
  //       service: "UberGo", 
  //       rideType: "Affordable rides", 
  //       fare: "₹149 - ₹175", 
  //       eta: "5 min",
  //       icon: "car",
  //       capacity: "4",
  //       color: Colors.UBER_COLOR
  //     },
  //     { 
  //       id: "uber-2", 
  //       service: "Premier", 
  //       rideType: "Comfortable rides", 
  //       fare: "₹225 - ₹250", 
  //       eta: "7 min",
  //       icon: "car-side",
  //       capacity: "4",
  //       color: Colors.UBER_COLOR
  //     },
  //     { 
  //       id: "uber-3", 
  //       service: "UberXL", 
  //       rideType: "Premium rides", 
  //       fare: "₹325 - ₹375", 
  //       eta: "8 min",
  //       icon: "caravan",
  //       capacity: "6",
  //       color: Colors.UBER_COLOR
  //     },
  //   ],
  //   ola: [
  //     { 
  //       id: "ola-1", 
  //       service: "Mini", 
  //       rideType: "Economic rides", 
  //       fare: "₹145 - ₹170", 
  //       eta: "4 min",
  //       icon: "car",
  //       capacity: "4",
  //       color: Colors.OLA_COLOR
  //     },
  //     { 
  //       id: "ola-2", 
  //       service: "Sedan", 
  //       rideType: "Comfort rides", 
  //       fare: "₹210 - ₹240", 
  //       eta: "6 min",
  //       icon: "car-sport",
  //       capacity: "4",
  //       color: Colors.OLA_COLOR
  //     },
  //     { 
  //       id: "ola-3", 
  //       service: "Prime SUV", 
  //       rideType: "Premium rides", 
  //       fare: "₹320 - ₹360", 
  //       eta: "7 min",
  //       icon: "car-estate",
  //       capacity: "6",
  //       color: Colors.OLA_COLOR
  //     },
  //   ],
  //   rapido: [
  //     { 
  //       id: "rapido-1", 
  //       service: "Bike", 
  //       rideType: "Quick rides", 
  //       fare: "₹65 - ₹85", 
  //       eta: "3 min",
  //       icon: "motorcycle",
  //       capacity: "1",
  //       color: Colors.RAPIDO_COLOR
  //     },
  //     { 
  //       id: "rapido-2", 
  //       service: "Auto", 
  //       rideType: "3-wheeler", 
  //       fare: "₹120 - ₹145", 
  //       eta: "5 min",
  //       icon: "car-sport",
  //       capacity: "3",
  //       color: Colors.RAPIDO_COLOR
  //     },
  //     { 
  //       id: "rapido-3", 
  //       service: "Cab", 
  //       rideType: "Comfortable rides", 
  //       fare: "₹185 - ₹230", 
  //       eta: "7 min",
  //       icon: "car",
  //       capacity: "4",
  //       color: Colors.RAPIDO_COLOR
  //     },
  //   ]
  // };

  // Get user's current location
  // useEffect(() => {
  //   (async () => {
  //     let { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== "granted") {
  //       console.log("Permission denied");
  //       return;
  //     }

  //     let userLocation = await Location.getCurrentPositionAsync({});
  //     setLocation(userLocation.coords);
  //     setSource("Your Location"); // Default source is user's location
  //     setRegion({
  //       latitude: userLocation.coords.latitude,
  //       longitude: userLocation.coords.longitude,
  //       latitudeDelta: 0.05,
  //       longitudeDelta: 0.05,
  //     });
  //   })();
  // }, []);

  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);

  const fetchPlaceDetails = async (placeId) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: placeId,
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
            fields: "geometry", // Specify that you need geometry data
          },
        }
      );
      return response.data.result;
    } catch (error) {
      console.log("Error fetching place details:", error);
      return null;
    }
  };
  
  
  // Example: If you want to use current location as pickup
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission denied");
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
      setSource("Your Location"); // Default source is user's location
      setRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      
      // Optionally set the current location as the pickup location
      setPickupLocation({
        lat: userLocation.coords.latitude,
        lng: userLocation.coords.longitude,
      });
    })();
  }, []);


  // Fetch autocomplete places using Google API
  const fetchPlaces = async (input, isSourceField = false) => {
    if (!input) return;
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
        {
          params: {
            input,
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
            language: "en",
          },
        }
      );
      if (isSourceField) {
        setSourcePlaces(response.data.predictions);
      } else {
        setPlaces(response.data.predictions);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Animation for cards
  const [fares, setFares] = useState(null);
  const handleFindFares = () => {
    if (!pickupLocation || !dropLocation) {
      console.log("Please select both a pickup and drop location");
      return;
    }
    const calculatedFares = calculateFareEstimates(pickupLocation, dropLocation);
    setFares(calculatedFares);
    setSelectedFare(calculatedFares[selectedProvider][0]);
    setShowFares(true);
  };
  
  useEffect(() => {
    if (showFares) {
      // Set the first fare as selected by default
      if (fares) {
        setSelectedFare(fares[selectedProvider][0]);
      }      
    }
  }, [showFares, selectedProvider]);

  const handleFareSelection = (fare) => {
    setSelectedFare(fare);
  };

  const toggleMapStyle = () => {
    setIsBlackAndWhiteMap(!isBlackAndWhiteMap);
  };

  const switchProvider = (providerId) => {
    setSelectedProvider(providerId);
    // Use the fares state variable instead of calculatedFares
    if (fares && fares[providerId]) {
      setSelectedFare(fares[providerId][0]);
    }
  };
  
  const handleSourceSelection = (place) => {
    setSource(place.description);
    setSourcePlaces([]);
    setIsSourceSearch(false);
  };

  const handleDestinationSelection = async (place) => {
    setDestination(place.description);
    setPlaces([]);
    
    // Fetch detailed place data using the place_id
    const details = await fetchPlaceDetails(place.place_id);
    if (details && details.geometry && details.geometry.location) {
      setDropLocation({
        lat: details.geometry.location.lat,
        lng: details.geometry.location.lng,
      });
    } else {
      console.log("Could not fetch coordinates for the selected destination.");
    }
  };
  const handleBookRide = () => {
    // Ensure that both pickupLocation and dropLocation are defined
    if (!pickupLocation || !dropLocation) {
      console.log("Missing pickup or drop location for booking ride");
      return;
    }
    
    let bookingUrl = "";
    if (selectedProvider === "uber") {
      // Example deep link for Uber; adjust parameters as needed
      bookingUrl = `uber://?action=setPickup&pickup[latitude]=${pickupLocation.lat}&pickup[longitude]=${pickupLocation.lng}&dropoff[latitude]=${dropLocation.lat}&dropoff[longitude]=${dropLocation.lng}`;
    } else if (selectedProvider === "ola") {
      // Example deep link for Ola; the actual scheme might vary
      bookingUrl = `ola://?pickup_lat=${pickupLocation.lat}&pickup_lng=${pickupLocation.lng}&drop_lat=${dropLocation.lat}&drop_lng=${dropLocation.lng}`;
    } else if (selectedProvider === "rapido") {
      // Example deep link for Rapido; update to the correct URL scheme if available
      bookingUrl = `rapido://?pickup_lat=${pickupLocation.lat}&pickup_lng=${pickupLocation.lng}&drop_lat=${dropLocation.lat}&drop_lng=${dropLocation.lng}`;
    }
    
    // Attempt to open the URL
    if (bookingUrl) {
      Linking.openURL(bookingUrl).catch((err) => {
        console.error("Failed to open app: ", err);
        // Optionally, show an alert or fallback behavior here.
      });
    }
  };
  
  
 
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.SECONDARY} />
      
      {/* Map View */}
      <MapView 
        style={styles.map} 
        region={region} 
        //provider={PROVIDER_GOOGLE}
        customMapStyle={isBlackAndWhiteMap ? blackAndWhiteMapStyle : standardMapStyle}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Your Location"
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerDot} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.PRIMARY} />
        </TouchableOpacity>

        {/* Map Style Toggle Button */}
        <TouchableOpacity style={styles.mapStyleToggle} onPress={toggleMapStyle}>
          <Ionicons 
            name={isBlackAndWhiteMap ? "color-palette" : "contrast"} 
            size={24} 
            color={Colors.PRIMARY} 
          />
          <Text style={styles.mapStyleText}>
            {isBlackAndWhiteMap ? "Color Map" : "B&W Map"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Container - Visible when fares are not shown */}
      {!showFares && (
        <View style={styles.searchContainer}>
          <View style={styles.locationIcons}>
            <View style={styles.dotContainer}>
              <View style={styles.greenDot} />
            </View>
            <View style={styles.dotLine} />
            <View style={styles.dotContainer}>
              <View style={styles.redDot} />
            </View>
          </View>
          
          <View style={styles.inputsContainer}>
            {/* Source Input */}
            <TouchableOpacity 
              style={styles.inputWrapper}
              onPress={() => setIsSourceSearch(true)}
            >
              <TextInput
                style={styles.input}
                value={source}
                onChangeText={(text) => {
                  setSource(text);
                  fetchPlaces(text, true);
                  setIsSourceSearch(true);
                }}
                placeholder="Choose pickup location"
                placeholderTextColor={Colors.GRAY}
              />
            </TouchableOpacity>
            
            {/* Divider Line */}
            <View style={styles.divider} />
            
            {/* Destination Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={destination}
                onChangeText={(text) => {
                  setDestination(text);
                  fetchPlaces(text);
                  setIsSourceSearch(false);
                }}
                placeholder="Where to?"
                placeholderTextColor={Colors.GRAY}
              />
            </View>
          </View>
          
          {/* Place Suggestions for Source */}
          {isSourceSearch && sourcePlaces.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <ScrollView keyboardShouldPersistTaps="always">
                <TouchableOpacity 
                  style={styles.suggestionItem}
                  onPress={() => {
                    setSource("Your Location");
                    setSourcePlaces([]);
                    setIsSourceSearch(false);
                  }}
                >
                  <View style={styles.suggestionIcon}>
                    <Ionicons name="locate-outline" size={20} color="#00B74A" />
                  </View>
                  <View style={styles.suggestionDetails}>
                    <Text style={styles.suggestionText}>Your Location</Text>
                  </View>
                </TouchableOpacity>
                {sourcePlaces.map((place) => (
                  <TouchableOpacity 
                    key={place.place_id} 
                    style={styles.suggestionItem}
                    onPress={() => handleSourceSelection(place)}
                  >
                    <View style={styles.suggestionIcon}>
                      <Ionicons name="location-outline" size={20} color={Colors.ACCENT} />
                    </View>
                    <View style={styles.suggestionDetails}>
                      <Text style={styles.suggestionText} numberOfLines={1}>{place.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          
          {/* Place Suggestions for Destination */}
          {!isSourceSearch && places.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <ScrollView keyboardShouldPersistTaps="always">
                {places.map((place) => (
                  <TouchableOpacity 
                    key={place.place_id} 
                    style={styles.suggestionItem}
                    onPress={() => handleDestinationSelection(place)}
                  >
                    <View style={styles.suggestionIcon}>
                      <Ionicons name="location-outline" size={20} color={Colors.ACCENT} />
                    </View>
                    <View style={styles.suggestionDetails}>
                      <Text style={styles.suggestionText} numberOfLines={1}>{place.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          
          {/* Submit Button */}
          {destination && !places.length && !sourcePlaces.length && (
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleFindFares}
            >
              <Text style={styles.submitText}>Find Rides</Text>
            </TouchableOpacity>
                )}

        </View>
      )}
      
      {/* Fares Bottom Sheet - Visible when showFares is true */}
      {showFares && (
        <View style={styles.faresContainer}>
          {/* Header with drag indicator */}
          <View style={styles.faresHeader}>
            <View style={styles.dragIndicator} />
            <Text style={styles.faresTitle}>Compare rides</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowFares(false)}
            >
              <Ionicons name="close" size={24} color={Colors.PRIMARY} />
            </TouchableOpacity>
          </View>
          
          {/* Trip Info */}
          <View style={styles.tripInfo}>
            <View style={styles.locationSummary}>
              <View style={styles.locationRow}>
                <View style={styles.sourceDot} />
                <Text style={styles.locationText} numberOfLines={1}>{source}</Text>
              </View>
              <View style={styles.locationLine} />
              <View style={styles.locationRow}>
                <View style={styles.destinationDot} />
                <Text style={styles.locationText} numberOfLines={1}>{destination}</Text>
              </View>
            </View>
          </View>
          
          {/* Provider Selector */}
          <View style={styles.providerSelector}>
            {providers.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.providerTab,
                  selectedProvider === provider.id && {
                    borderBottomColor: provider.color,
                    borderBottomWidth: 3,
                  }
                ]}
                onPress={() => switchProvider(provider.id)}
              >
                <FontAwesome5 
                  name={provider.icon} 
                  size={18} 
                  color={selectedProvider === provider.id ? provider.color : Colors.GRAY} 
                  style={{marginRight: 8}}
                />
                <Text
                  style={[
                    styles.providerName,
                    selectedProvider === provider.id && {
                      color: provider.color,
                      fontWeight: '600',
                    }
                  ]}
                >
                  {provider.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Rides Carousel */}
{/* Rides Carousel */}
<View style={styles.faresCarouselContainer}>
  <Animated.FlatList
    data={fares ? fares[selectedProvider] : []}
    keyExtractor={(item, index) => `${item.id}-${index}`}
    horizontal
    pagingEnabled
    showsHorizontalScrollIndicator={false}
    snapToInterval={CARD_WIDTH + 20}
    snapToAlignment="center"
    contentContainerStyle={styles.faresCarouselContent}
    decelerationRate="fast"
    onScroll={Animated.event(
      [{ nativeEvent: { contentOffset: { x: scrollX } } }],
      { useNativeDriver: true }
    )}
    scrollEventThrottle={16}
    renderItem={({ item }) => (
      <TouchableOpacity
        style={[
          styles.fareCard,
          selectedFare && selectedFare.id === item.id && {
            borderColor: item.color,
            borderWidth: 2,
          },
        ]}
        onPress={() => handleFareSelection(item)}
      >
        <View style={styles.fareCardContent}>
          <View style={styles.fareCardLeft}>
            <View
              style={[
                styles.fareIconContainer,
                { backgroundColor: `${item.color}20` },
              ]}
            >
              <FontAwesome5 name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.fareDetails}>
              <Text style={styles.fareService}>{item.service}</Text>
              <Text style={styles.fareDetailsText}>
                {`${item.duration} min • ${item.distance} km`}
              </Text>
            </View>
          </View>
          <View style={styles.farePrice}>
            <Text style={styles.farePriceText}>{item.fareRange}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )}
  />
</View>


          {/* Book Ride Button */}
          {/* Book Ride Button */}
        <TouchableOpacity 
          style={[
            styles.bookButton,
            { backgroundColor: providers.find(p => p.id === selectedProvider).color }
          ]}
          onPress={handleBookRide}  // Added onPress handler here.
        >
          <Text style={styles.bookButtonText}>
            Book {selectedFare ? selectedFare.service : 'Ride'} with {providers.find(p => p.id === selectedProvider).name}
          </Text>
        </TouchableOpacity>

          
          {/* Payment Method Selection */}
          <View style={styles.paymentMethod}>
            <Ionicons name="card-outline" size={20} color={Colors.PRIMARY} />
            <Text style={styles.paymentText}>Personal • HDFC •••• 5678</Text>
            <Ionicons name="chevron-down" size={20} color={Colors.PRIMARY} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  map: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  header: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.SECONDARY,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  mapStyleToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.SECONDARY,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: Colors.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  mapStyleText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.PRIMARY,
  },
  searchContainer: {
    position: "absolute",
    top: 110,
    left: 20,
    right: 20,
    backgroundColor: Colors.SECONDARY,
    borderRadius: 12,
    padding: 15,
    shadowColor: Colors.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 4,
    flexDirection: "row",
  },
  locationIcons: {
    width: 30,
    alignItems: "center",
    marginRight: 10,
  },
  dotContainer: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00B74A",
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F93154",
  },
  dotLine: {
    width: 2,
    height: 30,
    backgroundColor: Colors.DIVIDER,
    alignSelf: "center",
  },
  inputsContainer: {
    flex: 1,
  },
  inputWrapper: {
    height: 40,
    justifyContent: "center",
  },
  input: {
    fontSize: 16,
    color: Colors.PRIMARY,
    paddingVertical: 6,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.DIVIDER,
    marginVertical: 8,
  },
  suggestionsContainer: {
    position: "absolute",
    top: 95,
    left: 0,
    right: 0,
    backgroundColor: Colors.SECONDARY,
    borderRadius: 12,
    padding: 5,
    paddingTop: 15,
    marginTop: 5,
    shadowColor: Colors.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: 300,
    zIndex: 3,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
  },
  suggestionIcon: {
    marginRight: 15,
  },
  suggestionDetails: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 15,
    color: Colors.PRIMARY,
  },
  submitButton: {
    position: "absolute",
    bottom: -70,
    left: 20,
    right: 20,
    backgroundColor: Colors.ACCENT,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: Colors.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  submitText: {
    color: Colors.SECONDARY,
    fontWeight: "600",
    fontSize: 16,
  },
  markerContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.ACCENT,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.SECONDARY,
    shadowColor: Colors.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.SECONDARY,
  },
  faresContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.SECONDARY,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    shadowColor: Colors.PRIMARY,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 5,
  },
  faresHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    position: "relative",
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: Colors.DIVIDER,
    borderRadius: 3,
    marginBottom: 5,
  },
  faresTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.PRIMARY,
  },
  closeButton: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  tripInfo: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
  },
  locationSummary: {
    padding: 10,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  sourceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00B74A",
    marginRight: 10,
  },
  destinationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F93154",
    marginRight: 10,
  },
  locationLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.DIVIDER,
    marginLeft: 5,
  },
  locationText: {
    fontSize: 14,
    color: Colors.PRIMARY,
    width: "90%",
  },
  providerSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
  },
  providerTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 0,
  },
  providerName: {
    fontSize: 16,
    color: Colors.GRAY,
  },
  faresCarouselContainer: {
    paddingVertical: 15,
  },
  faresCarouselContent: {
    paddingHorizontal: 10,
  },
  fareCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: 10,
    borderRadius: 12,
    backgroundColor: Colors.SECONDARY,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    overflow: "hidden",
    padding: 15,
    justifyContent: "center",
  },
  selectedFareCard: {
    borderColor: Colors.ACCENT,
    borderWidth: 2,
  },
  fareCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fareCardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  fareIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.LIGHT_GRAY,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  fareDetails: {
    justifyContent: "center",
  },
  fareService: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.PRIMARY,
    marginBottom: 4,
  },
  fareType: {
    fontSize: 14,
    color: Colors.GRAY,
    marginBottom: 4,
  },
  fareEta: {
    fontSize: 14,
    color: Colors.PRIMARY,
  },
  farePrice: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  farePriceText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.PRIMARY,
  },
  bookButton: {
    backgroundColor: Colors.ACCENT,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: Colors.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  bookButtonText: {
    color: Colors.SECONDARY,
    fontWeight: "600",
    fontSize: 16,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  paymentText: {
    fontSize: 14,
    color: Colors.PRIMARY,
    marginHorizontal: 8,
  },
  fareDetailsText: {
    fontSize: 14,
    color: Colors.GRAY,
  },
  
});