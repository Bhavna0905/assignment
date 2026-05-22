import type { Metadata } from "next";

type Props = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Meeting ${code} | Zoom Clone`,
    description: "Join a Zoom Clone video meeting",
  };
}

export default function MeetingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
