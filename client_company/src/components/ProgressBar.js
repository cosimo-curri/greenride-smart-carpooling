import PropTypes from "prop-types";

import "../styles/ProgressBar.css"

function ProgressBar({ percentage, height }) {
  return (
    <div className="progress-bar-container" style={{ height: `${height}px` }}>
      <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
    </div>
  );
}

ProgressBar.propTypes = {
  percentage: PropTypes.number.isRequired,
  height: PropTypes.string.isRequired
};

export default ProgressBar;