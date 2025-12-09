import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { RagChatbot } from '../ragBot/components/RagChatbot';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
        <RagChatbot />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
