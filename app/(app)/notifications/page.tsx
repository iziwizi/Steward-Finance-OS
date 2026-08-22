import { createClient } from "@/lib/supabase/server";
import { NotificationsView } from "./notifications-view";

const PAGE_SIZE = 10;

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const page = Math.max(1, parseInt(rawPage || "1", 10) || 1);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const [{ data: notifications, count }, { count: unreadCount }] = await Promise.all([
    supabase
      .from("in_app_notifications")
      .select("*", { count: "exact" })
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase
      .from("in_app_notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user?.id)
      .is("read_at", null),
  ]);

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <NotificationsView
      notifications={notifications ?? []}
      currentPage={page}
      totalPages={totalPages}
      totalCount={totalCount}
      unreadTotal={unreadCount ?? 0}
    />
  );
}
