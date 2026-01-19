import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/SplashScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { DiagnosisScreen } from '../screens/DiagnosisScreen';
import { TreatmentScreen } from '../screens/TreatmentScreen';
import { HeatmapScreen } from '../screens/HeatmapScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ModelLabel } from '../constants/modelConfig';
import { DetectionBox } from '../services/DetectionService';

export type RootStackParamList = {
  Splash: undefined;
  Camera: undefined;
  Diagnosis: {
    disease: ModelLabel | 'Sano';
    confidence: number;
    imageUri: string;
    boxes: DetectionBox[];
  };
  Treatment: {
    disease: ModelLabel;
  };
  Heatmap: undefined;
  History: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen}
        />
        
        <Stack.Screen 
          name="Camera"
          component={CameraScreen}
        />
        
        <Stack.Screen 
          name="Diagnosis"
          component={DiagnosisScreen}
          options={{
            animation: 'slide_from_bottom',
          }}
        />
        
        <Stack.Screen 
          name="Treatment"
          component={TreatmentScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        
        <Stack.Screen 
          name="Heatmap"
          component={HeatmapScreen}
          options={{
            animation: 'slide_from_bottom',
          }}
        />
        
        <Stack.Screen 
          name="History"
          component={HistoryScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        
        <Stack.Screen 
          name="Profile"
          component={ProfileScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
