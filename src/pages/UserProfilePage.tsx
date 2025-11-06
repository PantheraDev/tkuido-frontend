import InfoSection from "../components/UserProfilePage/InfoSection";
import SidenavMenu from "../components/UserProfilePage/SidenavMenu";

const UserProfilePage = () => {
  return (
    <>
      <div className="grid grid-cols-6">
        <div className="col-span-1 max-h-screen p-5">
          <SidenavMenu />
        </div>
        <div className="col-span-5">
          <InfoSection />
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;
