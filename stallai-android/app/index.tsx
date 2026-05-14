import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to dashboard tab
  return <Redirect href="/(tabs)/dashboard" />;
}
