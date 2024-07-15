import { useSettings } from "../../hooks/useSettings";
import { useView } from "../../hooks/useView";
import EditTeam from "./EditTeam";
import Spinner from "../Spinner";

const AddTeam = () => {
  const { addTeam, loading } = useSettings();
  const { setCurrentView } = useView();
  const onClickSave = (newTeam) => {
    addTeam(newTeam, true);
    setCurrentView("teams");
  };
  return (
    <>
      {loading && <Spinner size={150} />}
      <EditTeam onClickSave={onClickSave} formTitle={"Add Team"} />
    </>
  );
};

export default AddTeam;
