import { RouterProvider } from "react-router-dom";
import { router } from "@/routes";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { RagChatbot } from "../ragBot/components/RagChatbot";

import { Elements } from "@stripe/react-stripe-js";
import stripePromise from "@/lib/stripe";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Elements stripe={stripePromise}>
          <RouterProvider router={router} />
        </Elements>
        <RagChatbot />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
