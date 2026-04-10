import {
  FiBarChart2,
  FiBox,
  FiCheckSquare,
  FiClock,
  FiMail,
} from 'react-icons/fi';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useDashboard } from '../hooks/useDashboard';

//날짜 데이터 포맷
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));

const DashboardPage = () => {
  const { data, isLoading, isError, refetch } = useDashboard(); //useQuery가 자동으로 줌

  const summaryCards = [
    {
      title: '총 상품 수',
      value: data?.totalProducts ?? 0,
      icon: <FiBox size={20} />,
      cardClassName: 'border-blue-100 bg-blue-50/70',
      iconClassName: 'bg-blue-600 text-white',
    },
    {
      title: '승인 대기',
      value: data?.pendingRequests ?? 0,
      icon: <FiClock size={20} />,
      cardClassName: 'border-amber-100 bg-amber-50/70',
      iconClassName: 'bg-amber-500 text-white',
    },
    {
      title: '승인 완료',
      value: data?.approvedRequests ?? 0,
      icon: <FiCheckSquare size={20} />,
      cardClassName: 'border-emerald-100 bg-emerald-50/70',
      iconClassName: 'bg-emerald-600 text-white',
    },
    {
      title: '요청 수',
      value: data?.totalRequests ?? 0,
      icon: <FiMail size={20} />,
      cardClassName: 'border-rose-100 bg-rose-50/70',
      iconClassName: 'bg-rose-500 text-white',
    },
  ];

  if (isLoading) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
        대시보드 데이터를 불러오는 중입니다...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <p className="font-semibold text-slate-900">대시보드를 불러오지 못했습니다.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col overflow-hidden md:h-50 rounded-[28px] bg-gradient-to-r from-slate-900
       via-slate-800 to-blue-700 px-6 py-7 text-white shadow-xl sm:px-8  justify-center">
        <p className="text-sm font-medium text-blue-100">Dashboard</p>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">재고와 요청 현황을 한눈에 파악하세요</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-100/85 sm:text-base">
          상품 수, 승인 진행 상태, 최근 일주일 입출고 흐름, 최신 기록까지 하나의 화면에서 빠르게 확인할 수 있습니다.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article
            key={card.title}
            className={`rounded-3xl border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${card.cardClassName}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">{card.title}</p>
                <p className="mt-4 text-4xl font-black tracking-tight text-slate-900">{card.value}</p>
              </div>
              <div className={`rounded-2xl p-3 shadow-sm ${card.iconClassName}`}>{card.icon}</div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
            <FiBarChart2 size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">근래 입출고</h2>
            <p className="mt-1 text-sm text-slate-500">최근 7일 동안의 입고/출고 기록 통계입니다.</p>
          </div>
        </div>

        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.weeklyStats}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                contentStyle={{
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)',
                }}
              />
              <Legend />
              <Bar dataKey="in" name="입고" fill="#2f6fbb" radius={[8, 8, 0, 0]} />
              <Bar dataKey="out" name="출고" fill="#74a85a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm mb-5">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
          <h2 className="text-xl font-bold text-slate-900">입출고 기록</h2>
          <p className="mt-1 text-sm text-slate-500">가장 최근에 처리된 입출고 기록입니다.</p>
        </div>
        {/* pc 버전 */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">제품 이름</th>
                <th className="px-6 py-4 font-semibold">요청자</th>
                <th className="px-6 py-4 font-semibold">입/출고</th>
                <th className="px-6 py-4 font-semibold">수량</th>
                <th className="px-6 py-4 font-semibold">요청 일자</th>
              </tr>
            </thead>
            <tbody>
              {data.recentLogs.map((log) => (
                <tr key={log.id} className="border-t border-slate-100 text-sm text-slate-700">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">{log.productName}</p>
                      <p className="mt-1 text-xs text-slate-400">{log.productCode}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{log.requester}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        log.type === 'IN'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {log.type === 'IN' ? '입고' : '출고'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{log.quantity}</td>
                  <td className="px-6 py-4">{formatDate(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* 모바일 버전 */}
        <div className="grid gap-4 p-4 sm:p-6 lg:hidden">
          {data.recentLogs.map((log) => (
            <article key={log.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-slate-900">{log.productName}</p>
                  <p className="mt-1 text-xs text-slate-400">{log.productCode}</p>
                </div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    log.type === 'IN' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {log.type === 'IN' ? '입고' : '출고'}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white px-3 py-3">
                  <dt className="text-xs text-slate-400">요청자</dt>
                  <dd className="mt-1 font-semibold text-slate-700">{log.requester}</dd>
                </div>
                <div className="rounded-xl bg-white px-3 py-3">
                  <dt className="text-xs text-slate-400">수량</dt>
                  <dd className="mt-1 font-semibold text-slate-700">{log.quantity}</dd>
                </div>
                <div className="rounded-xl bg-white px-3 py-3 col-span-2">
                  <dt className="text-xs text-slate-400">요청 일자</dt>
                  <dd className="mt-1 font-semibold text-slate-700">{formatDate(log.createdAt)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
