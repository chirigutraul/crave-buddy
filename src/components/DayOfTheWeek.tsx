interface DayOfTheWeekProps {
  day: string;
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

function DayOfTheWeek({ day, meals }: DayOfTheWeekProps) {
  return (
    <div className="py-4">
      <h5 className="mb-4">{day}</h5>
      <div className="w-48 flex flex-col gap-4">
        <div>
          <h6 className="mb-1">Breakfast:</h6>
          <p>{meals.breakfast}</p>
        </div>
        <div>
          <h6 className="mb-1">Lunch:</h6>
          <p>{meals.lunch}</p>
        </div>
        <div>
          <h6 className="mb-1">Dinner:</h6>
          <p>{meals.dinner}</p>
        </div>
      </div>
    </div>
  );
}

export default DayOfTheWeek;
