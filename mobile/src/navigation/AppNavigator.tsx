import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { AppTheme } from '../context/ThemeContext';
import Colors from '../constants/colors';
import type {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  HomeStackParamList,
  SearchStackParamList,
  FavoritesStackParamList,
  TicketsStackParamList,
  ProfileStackParamList,
} from '../types';

// ─── Screen Imports ─────────────────────────────────────────────────
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import FavoritesScreen from '../screens/main/FavoritesScreen';
import TicketsScreen from '../screens/main/TicketsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import EventDetailScreen from '../screens/main/EventDetailScreen';
import EventListScreen from '../screens/main/EventListScreen';
import TicketDetailScreen from '../screens/main/TicketDetailScreen';
import OrderConfirmationScreen from '../screens/main/OrderConfirmationScreen';
import ChatbotScreen from '../screens/main/ChatbotScreen';

// ─── Stack Navigators ─────────────────────────────────────────────
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const FavoritesStack = createNativeStackNavigator<FavoritesStackParamList>();
const TicketsStack = createNativeStackNavigator<TicketsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// ─── Auth Navigator ───────────────────────────────────────────────
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// ─── Tab Icon Component ───────────────────────────────────────────
interface TabIconProps {
  emoji: string;
  focused: boolean;
  label: string;
  theme: AppTheme;
}

const TabIcon = ({ emoji, focused, label, theme }: TabIconProps) => (
  <View style={{ alignItems: 'center', paddingTop: 4 }}>
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
    <Text
      style={{
        fontSize: 10,
        color: focused ? theme.primary : theme.textTertiary,
        fontWeight: focused ? '600' : '400',
        marginTop: 2,
      }}
    >
      {label}
    </Text>
  </View>
);

// ─── Tab Stacks ───────────────────────────────────────────────────
const HomeNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
    <HomeStack.Screen name="EventList" component={EventListScreen} />
    <HomeStack.Screen name="EventDetail" component={EventDetailScreen} />
    <HomeStack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
    <HomeStack.Screen name="TicketDetail" component={TicketDetailScreen} />
    <HomeStack.Screen name="Chatbot" component={ChatbotScreen} />
  </HomeStack.Navigator>
);

const SearchNavigator = () => (
  <SearchStack.Navigator screenOptions={{ headerShown: false }}>
    <SearchStack.Screen name="SearchScreen" component={SearchScreen} />
    <SearchStack.Screen name="EventDetail" component={EventDetailScreen} />
    <SearchStack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
    <SearchStack.Screen name="TicketDetail" component={TicketDetailScreen} />
  </SearchStack.Navigator>
);

const FavoritesNavigator = () => (
  <FavoritesStack.Navigator screenOptions={{ headerShown: false }}>
    <FavoritesStack.Screen name="FavoritesScreen" component={FavoritesScreen} />
    <FavoritesStack.Screen name="EventDetail" component={EventDetailScreen} />
    <FavoritesStack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
    <FavoritesStack.Screen name="TicketDetail" component={TicketDetailScreen} />
  </FavoritesStack.Navigator>
);

const TicketsNavigator = () => (
  <TicketsStack.Navigator screenOptions={{ headerShown: false }}>
    <TicketsStack.Screen name="TicketsScreen" component={TicketsScreen} />
    <TicketsStack.Screen name="TicketDetail" component={TicketDetailScreen} />
  </TicketsStack.Navigator>
);

const ProfileNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
  </ProfileStack.Navigator>
);

// ─── Main Tab Navigator ───────────────────────────────────────────
const MainNavigator = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === 'ios' ? 49 : 56;
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: tabBarHeight + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" focused={focused} label="Keşfet" theme={theme} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔍" focused={focused} label="Ara" theme={theme} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="❤️" focused={focused} label="Favoriler" theme={theme} />
          ),
        }}
      />
      <Tab.Screen
        name="Tickets"
        component={TicketsNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🎫" focused={focused} label="Biletler" theme={theme} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" focused={focused} label="Profil" theme={theme} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// ─── Root Navigator ───────────────────────────────────────────────
const RootNavigator = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <SplashScreen statusMessage="Oturum doğrulanıyor..." />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <RootStack.Screen name="Main" component={MainNavigator} />
      )}
    </RootStack.Navigator>
  );
};

// ─── App Navigator (Root) ─────────────────────────────────────────
const AppNavigator = () => {
  const { isDark, theme } = useTheme();

  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: theme.background,
          card: theme.surface,
          text: theme.text,
          border: theme.border,
          primary: theme.primary,
          notification: theme.primary,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.background,
          card: theme.surface,
          text: theme.text,
          border: theme.border,
          primary: theme.primary,
          notification: theme.primary,
        },
      };

  return (
    <NavigationContainer theme={navTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
