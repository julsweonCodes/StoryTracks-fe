import MapIcon from "../icons/map";
import MenuIcon from "../icons/menu";

export default function Header() {
  return (
    <header className="bg-black-primary text-key-primary flex h-[48px] items-center justify-between px-[16px]">
      <div className="flex items-center gap-1">
        <MapIcon />
        StoryTrack
      </div>
      <MenuIcon />
    </header>
  );
}
