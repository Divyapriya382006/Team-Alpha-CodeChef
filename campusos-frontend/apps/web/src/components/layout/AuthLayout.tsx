import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="relative flex min-h-[calc(100vh-65px)] w-full items-center justify-center bg-paper overflow-hidden px-4 py-12">
      {/* Background diagonal watermark */}
      <div className="absolute pointer-events-none select-none text-[#0A0A0A]/3 font-display font-black tracking-widest text-[clamp(80px,15vw,160px)] uppercase -rotate-12 transform whitespace-nowrap">
        CAMPUSOS
      </div>

      {/* Centered card */}
      <div className="relative z-10 w-full max-w-[420px] bg-white border-2 border-ink shadow-brutal p-8 animate-brute-in">
        <Outlet />
      </div>
    </div>
  );
}
