import ExhibitionBadge from "../../components/ExhibitionBadge/ExhibitionBadge";
import "../../components/ExhibitionBadge/ExhibitionBadge.css";

function PlayExhibitionBadge({ children }) {
  return (
    <ExhibitionBadge className="play-exhibition-badge">{children}</ExhibitionBadge>
  );
}

export default PlayExhibitionBadge;
