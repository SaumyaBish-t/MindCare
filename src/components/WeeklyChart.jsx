import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const WeeklyChart = ({ data }) => {
  return (
    <div className="bg-[#2D3A4B] border border-white/10 rounded-2xl p-6 mt-10 shadow-[0_0_20px_rgba(174,200,255,0.15)]">
      <h2 className="text-[#EAF4FF] text-xl font-semibold mb-4 text-center">Sleep Last 7 Days</h2>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="day" stroke="#C6D2E3" />
          <YAxis stroke="#C6D2E3" />
          <Tooltip 
            contentStyle={{ background: "#1B263B", border: "1px solid #AFCBFF", color: "#EAF4FF" }}
          />
          <Bar dataKey="hours" fill="#4ECDC4" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyChart;
