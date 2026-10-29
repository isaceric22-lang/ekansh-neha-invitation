import {
  CALENDAR_DAY,
  CALENDAR_EVENTS,
  CALENDAR_WEEKDAY,
  type CalendarEvent,
} from "./calendarData";

interface CalendarWidgetProps {
  weekday?: string;
  day?: string | number;
  events?: CalendarEvent[];
  /** Tap an event row → open the app for that specific event. */
  onEventClick?: (index: number) => void;
}

export function CalendarWidget({
  weekday = CALENDAR_WEEKDAY,
  day = CALENDAR_DAY,
  events = CALENDAR_EVENTS,
  onEventClick,
}: CalendarWidgetProps) {
  return (
    <div
      className="flex h-[158px] w-[158px] p-4 flex-col justify-between overflow-hidden bg-white"
      style={{
        borderRadius: 27,
        fontFamily: '"SF Pro Display", -apple-system, system-ui, sans-serif',
      }}
    >
      <div className="flex flex-col gap-1">
        <div
          className="font-semibold uppercase"
          style={{ color: "#FE373C", fontSize: 12, lineHeight: 1 }}
        >
          {weekday}
        </div>
        <div
          className="text-black"
          style={{ fontSize: 32, lineHeight: 1, fontWeight: 400 }}
        >
          {day}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {events.map((event, i) => {
          const inner = (
            <>
              <div
                className="h-7 w-[2px] shrink-0 rounded-full"
                style={{ backgroundColor: event.indicatorColor }}
              />
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-[5px] overflow-hidden px-[5px]">
                <div
                  className="truncate font-semibold capitalize leading-none"
                  style={{ color: event.titleColor, fontSize: 12, letterSpacing: "-0.02em" }}
                >
                  {event.title}
                </div>
                <div
                  className="truncate font-medium leading-none"
                  style={{ color: event.timeColor, fontSize: 11 }}
                >
                  {event.time}
                </div>
              </div>
            </>
          );
          const className = "flex h-9 w-full items-center pl-[2px] pr-2";
          const style = { backgroundColor: event.bgColor, borderRadius: 6 };
          return onEventClick ? (
            <button
              key={i}
              type="button"
              onClick={() => onEventClick(i)}
              className={className + " text-left transition-transform active:scale-[0.97]"}
              style={style}
            >
              {inner}
            </button>
          ) : (
            <div key={i} className={className} style={style}>
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
