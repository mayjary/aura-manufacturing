import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

const AdminDashboard: React.FC = () => {
  const productionOrders = useSelector((state: RootState) => state.productionOrders || []);

  return (
    <div className="admin-dashboard">
      <h1 className="text-2xl font-bold mb-4">Production Orders</h1>
      <ul>
        {productionOrders.map((order) => (
          <li key={order.id} className="mb-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{order.product_name || order.product_id}</span>
              <span className="text-sm">{order.worker_name || order.username || order.worker_id || "Unknown Worker"}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;