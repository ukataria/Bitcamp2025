export default function AlertTimeline({ events }: { events: string[] }) {
    return (
      <div className="w-full max-w-2xl mt-6">
        <h2 className="text-xl font-semibold mb-2">🧠 Alert Timeline</h2>
        <ul className="space-y-2">
          {events.map((event, idx) => (
            <li
              key={idx}
              className="p-3 bg-yellow-100 border border-yellow-300 rounded-md shadow text-sm"
            >
              🔔 {event}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  