export default function StatCard({ title, value, valueColor }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className={`text-xl font-semibold mt-2 ${valueColor || "text-gray-800"}`}>
        {value}
      </p>
    </div>
  );
}
