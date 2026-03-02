import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth/config";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Projects Dashboard
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Welcome back, {session.user?.username || session.user?.name}!
          </p>
          <p className="mt-2 text-sm text-gray-500">
            This is the main projects page where you can manage your Bible Drawing Video projects.
          </p>
        </div>

        <div className="mt-12">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Projects
            </h2>
            <p className="text-gray-600">
              Project management features will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}