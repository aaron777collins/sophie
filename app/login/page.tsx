import { LoginForm } from "../../components/auth/LoginForm";

export default function LoginPage() {
  // This would typically handle the actual authentication
  // For now, it's a placeholder that shows the expected structure
  const handleLogin = async (credentials: { username: string; password: string }) => {
    // TODO: Implement actual authentication logic
    // This would typically call NextAuth signIn or similar
    console.log("Login attempt:", { username: credentials.username });
    
    // Placeholder validation - replace with actual auth
    if (credentials.username === "demo" && credentials.password === "demo") {
      // Redirect to dashboard on success
      window.location.href = "/dashboard";
    } else {
      throw new Error("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your credentials to access the Bible Drawing Video Pipeline
          </p>
        </div>
        
        <div className="mt-8">
          <LoginForm onSubmit={handleLogin} />
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact support
          </p>
        </div>
      </div>
    </div>
  );
}