import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth/config";
import { redirect } from "next/navigation";
import { BranchSwitcher } from "../../../../components/ui/branch-switcher";
import { TitleGeneratorPanel } from "../../../../components/editor/TitleGeneratorPanel";

interface ProjectEditorPageProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectEditorPage({ params }: ProjectEditorPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with branch switcher */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Video Editor
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Project: {params.projectId}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <BranchSwitcher 
                projectId={params.projectId}
                onBranchChange={(branchId) => {
                  console.log('Branch changed to:', branchId);
                }}
              />
              <div className="text-sm text-gray-600">
                {session.user?.username || session.user?.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Video Editor Interface
            </h2>
            <div className="text-sm text-gray-500">
              Use <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘B</kbd> or <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+B</kbd> to quickly switch branches
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Video Timeline</h3>
              <p className="mt-2 text-sm text-gray-600">
                Video editing timeline will appear here. Changes made here will be tracked per branch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Properties Panel</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Video effects and filters</p>
                  <p>• Audio adjustments</p>
                  <p>• Timing controls</p>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Asset Library</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Video clips</p>
                  <p>• Audio tracks</p>
                  <p>• Graphics and overlays</p>
                </div>
              </div>
            </div>
            
            {/* AI Title Generation Panel */}
            <div className="mt-6">
              <TitleGeneratorPanel
                onTitleSelect={(title) => {
                  console.log('Title selected:', title);
                }}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-1">Branch Features Demo</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Switch between different edit versions using the branch dropdown above</li>
                <li>• Unsaved changes warning will appear when switching with unsaved work</li>
                <li>• Delete non-main branches with the delete button (main branch is protected)</li>
                <li>• Use keyboard shortcut ⌘B (Mac) or Ctrl+B (Windows/Linux) for quick access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}