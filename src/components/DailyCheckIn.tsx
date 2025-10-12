import { Angry, Frown, Meh, Smile, CirclePlus } from "lucide-react";
import { useRef, useEffect } from "react";

const HungerLevel = {
  starving: "Starving",
  hungry: "Hungry",
  satisfied: "Just Right",
  full: "Full",
  veryFull: "Overfed",
};

const HungerLevelIcon = {
  starving: Angry,
  hungry: Frown,
  satisfied: Smile,
  full: Meh,
  veryFull: Frown,
};

const HungerLevelColor = {
  starving: "text-red-600",
  hungry: "text-yellow-600",
  satisfied: "text-green-600",
  full: "text-yellow-600",
  veryFull: "text-red-600",
};

function DailyCheckIn() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft =
        scrollContainerRef.current.scrollWidth;
    }
  }, []);

  const checkIns = [
    {
      date: "2025-01-01",
      hungerLevel: "starving" as const,
    },
    {
      date: "2025-01-02",
      hungerLevel: "hungry" as const,
    },
    {
      date: "2025-01-03",
      hungerLevel: "satisfied" as const,
    },
    {
      date: "2025-01-04",
      hungerLevel: "full" as const,
    },
    {
      date: "2025-01-05",
      hungerLevel: "veryFull" as const,
    },
  ];

  return (
    <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto w-128">
      {checkIns.map((checkIn) => {
        const Icon = HungerLevelIcon[checkIn.hungerLevel];
        return (
          <div
            key={checkIn.date}
            className={`border-1 border-neutral-400 rounded-md p-2 w-32 flex-shrink-0 flex flex-col gap-2 items-center ${
              HungerLevelColor[checkIn.hungerLevel]
            }`}
          >
            <Icon className="size-14" />
            <div className="flex flex-col gap-1 items-center">
              <p>{HungerLevel[checkIn.hungerLevel]}</p>
              <span className="text-xs text-neutral-500">{checkIn.date}</span>
            </div>
          </div>
        );
      })}
      <div
        key={"new-check-in"}
        className={`ml-2 cursor-pointer border-1 text-neutral-700 border-neutral-400 rounded-md p-2 w-32 flex-shrink-0 flex flex-col gap-2 items-center justify-center`}
      >
        <CirclePlus className="size-14" />
        <h6>Check in</h6>
      </div>
    </div>
  );
}

export default DailyCheckIn;
