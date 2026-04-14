export function Logo({ size = 32 }: { size?: number }) {
  const s = size;
  return (
    <div className="flex items-center gap-2" aria-label="Sketch2App">
      <div className="flex gap-1">
        <div className="rounded-full bg-bauhaus-red border-2 border-bauhaus-black" style={{ width: s / 2, height: s / 2 }} />
        <div className="bg-bauhaus-blue border-2 border-bauhaus-black" style={{ width: s / 2, height: s / 2 }} />
        <div className="border-2 border-bauhaus-black bg-bauhaus-yellow"
             style={{ width: 0, height: 0,
                      borderLeft: `${s/4}px solid transparent`,
                      borderRight: `${s/4}px solid transparent`,
                      borderBottom: `${s/2}px solid #F0C020`,
                      backgroundColor: "transparent" }} />
      </div>
      <span className="font-black uppercase tracking-tighter text-lg">Sketch2App</span>
    </div>
  );
}
