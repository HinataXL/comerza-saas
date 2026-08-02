import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import './dashboard.css';

interface KpiCardProps {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  subtitle: string;
}

export default function KpiCard({ title, value, trend, isPositive, icon: Icon, iconColor, iconBg, subtitle }: KpiCardProps) {
  return (
    <div className="card kpi-card">
      <div className="kpi-header">
        <div className="kpi-icon-container" style={{ backgroundColor: iconBg, color: iconColor }}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className="kpi-title">{title}</h3>
          <p className="kpi-value">{value}</p>
        </div>
      </div>
      <div className="kpi-footer">
        <span className={`kpi-trend ${isPositive ? 'text-success' : 'text-warning'} flex-row`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trend}
        </span>
        <span className="text-secondary text-xs ml-1">{subtitle}</span>
      </div>
    </div>
  );
}
