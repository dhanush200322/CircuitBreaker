export const Header = () => (
  <header className="bg-indigo-600 text-white p-6 shadow-md">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">CircuitBreaker</h1>
        <p className="text-indigo-200">Cloud-Native Resilience Dashboard</p>
      </div>
      <div className="flex items-center space-x-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span className="text-lg font-semibold">System Status: HEALTHY</span>
      </div>
    </div>
  </header>
);
