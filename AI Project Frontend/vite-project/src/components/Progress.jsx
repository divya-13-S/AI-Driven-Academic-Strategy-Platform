function Progress({ value }) {
  return (
    <div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${value}%` }}></div>
      </div>
      <p>{value}% Completed</p>
    </div>
  );
}

export default Progress;
