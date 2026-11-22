import OnboardClient from "./OnboardClient";

export const metadata = {
  title: "Anchor — Hub onboarding",
  robots: { index: false, follow: false },
};

export default async function OnboardPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  return (
    <main style={{ minHeight: "100vh", background: "#eef2f7", margin: 0 }}>
      <OnboardClient token={params.token || ""} />
    </main>
  );
}
