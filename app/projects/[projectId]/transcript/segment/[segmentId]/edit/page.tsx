import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../../../lib/auth/config";
import { redirect } from "next/navigation";

interface TranscriptSegmentEditPageProps {
  params: {
    projectId: string;
    segmentId: string;
  };
}

export default async function TranscriptSegmentEditPage({ params }: TranscriptSegmentEditPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Transcript Segment Editor
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Project: {params.projectId} | Segment: {params.segmentId}
          </p>
          <p className="mt-4 text-lg text-gray-600">
            Welcome back, {session.user?.username || session.user?.name}!
          </p>
        </div>

        <div className="mt-12">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Transcript Segment Editor
            </h2>
            <p className="text-gray-600">
              Editing segment <strong>{params.segmentId}</strong> in project <strong>{params.projectId}</strong>
            </p>
            <p className="text-gray-600 mt-2">
              Transcript editing features will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}