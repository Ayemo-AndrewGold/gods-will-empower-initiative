
export default function DashboardHome() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow">Total Users: 120</div>
        <div className="bg-white p-6 rounded-lg shadow">Orders: 52</div>
        <div className="bg-white p-6 rounded-lg shadow">Revenue: ₦450,000</div>
      </div>
    </div>
  );
}
