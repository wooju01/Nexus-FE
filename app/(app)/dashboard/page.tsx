import { Greeting } from "@/features/home/greeting";
import { InboxList } from "@/features/home/inbox-list";
import { KpiCards } from "@/features/home/kpi-cards";
import { MyTasks } from "@/features/home/my-tasks";
import { TeamPresence } from "@/features/home/team-presence";

/**
 * Home 대시보드.
 * - 좌측: 인사말 + KPI + Inbox 리스트
 * - 우측: 내 할 일 + 팀 현황
 */
export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-6">
      <Greeting />
      <KpiCards />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InboxList />
        </div>
        <div className="flex flex-col gap-5">
          <MyTasks />
          <TeamPresence />
        </div>
      </div>
    </div>
  );
}
