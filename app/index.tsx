import { Redirect } from "expo-router";
import { useState } from "react";

const Index = () => {
  const [token] = useState(true);

  return (
    token ?
      <Redirect href="/(tabs)" /> :
      <Redirect href="/(auth)" />
  );
};

export default Index;
