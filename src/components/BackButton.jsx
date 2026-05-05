/* eslint-disable react/prop-types */

import { useNavigate } from "react-router-dom";

export default function BackButton({ label = "Back", to }) {
  const navigate = useNavigate();

  function handleClick() {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  }

  return (
    <button className="btn back-button" onClick={handleClick}>
      ← {label}
    </button>
  );
}

