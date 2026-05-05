export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm">
        <div className="border border-[rgba(214,235,253,0.19)] rounded-[16px] p-8 bg-transparent shadow-[rgba(176,199,217,0.145)_0px_0px_0px_1px]">
          {children}
        </div>
      </div>
    </div>
  );
}
