export default function PolicyLayout({ title, children }) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-2xl p-6 mb-6 border">
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white shadow-sm rounded-2xl p-6 border leading-relaxed text-gray-700 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}