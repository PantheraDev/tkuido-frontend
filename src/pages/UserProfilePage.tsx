import InfoSection from "../components/UserProfilePage/InfoSection";
import SidenavMenu from "../components/UserProfilePage/SidenavMenu";

const UserProfilePage = () => {
  return (
    <>
      <div className="w-[60%] mx-auto">
        <div className="h-35  p-6">
          <SidenavMenu />
        </div>
        <div className="">
          <InfoSection />
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;
