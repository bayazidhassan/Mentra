import { Settings } from 'lucide-react';

const AdminSettingsPage = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Platform configuration and admin settings.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-24 text-center bg-white border border-gray-200 rounded-2xl">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
          <Settings size={28} className="text-gray-300" />
        </div>
        <p
          className="text-base font-semibold text-gray-700 mb-2"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Coming soon
        </p>
        <p className="text-sm text-gray-400 max-w-xs">
          Platform settings will be available here. Check back later.
        </p>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
