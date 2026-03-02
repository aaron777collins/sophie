export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-center text-zinc-400 mt-4">
        Don't have an account?{" "}
        <a href="/sign-up" className="text-blue-500 hover:text-blue-400">
          Create an account
        </a>
      </p>
    </div>
  );
}