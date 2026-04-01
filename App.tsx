/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
//geo location to get a location
import Geolocation from '@react-native-community/geolocation';

type LocationType = {
  latitude: number;
  longitude: number;
};
function App() {
  const [location, setLocation] = useState<LocationType | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  //request permission on android
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted == PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  // Get current location
  const getLocation = async () => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      console.log('Permission denied');
      return;
    }

    Geolocation.getCurrentPosition(
      async position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log(position);
        // passign longs and lats
        setLocation({ latitude: lat, longitude: lng });
        //calling method to get an address
        const add = await getAddress(lat, lng);
        setAddress(add);
      },
      error => {
        console.log(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  };

  useEffect(() => {
    getLocation();
  }, []);
  //get an address
  const getAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'my-react-native-app',
          },
        },
      );

      const data = await res.json();

      // Clean city name
      const ad =
        data.address?.road +
          ', ' +
          data.address?.city +
          ', ' +
          data.address?.country || 'Unknown location';

      return ad;
    } catch (err) {
      console.log(err);
      return null;
    }
  };
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={
          location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : {
                latitude: 22.3039,
                longitude: 70.8022,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
        }
      >
        {/* Show marker if location exists */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={address || 'Still trying to catch you!'}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: { flex: 1 },
});

export default App;
