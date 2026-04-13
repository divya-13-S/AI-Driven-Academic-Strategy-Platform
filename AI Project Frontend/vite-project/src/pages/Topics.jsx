import { useNavigate } from "react-router-dom";

function Topics() {
  const navigate = useNavigate();

  const openMaterial = (subject, topic) => {
    navigate("/materials", { state: { subject, topic } });
  };

  return (
    <div>
      <h2>Maths</h2>

      <button onClick={() => openMaterial("Maths", "Trigonometry")}>
        Trigonometry
      </button>

      <h2>Physics</h2>

      <button onClick={() => openMaterial("Physics", "Ampere's Law")}>
        Ampere's Law
      </button>
    </div>
  );
}

export default Topics;
