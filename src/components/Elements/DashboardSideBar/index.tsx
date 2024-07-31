import { IVaultDetails } from "@/types";
import React from "react";
import RaffleMenu from "../RaffleMenu";
import UserProfile from "../UserProfile";

interface UserVaultProps {
  vault: IVaultDetails;
  userExist?: boolean;
  activeLink?:any
  setActiveLink?:any
}
const DashboardSideBar = ({ vault, userExist ,activeLink, setActiveLink}: UserVaultProps) => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex">
        <UserProfile vault={vault} userExist={userExist} />
      </div>
      <div className="flex flex-col gap-2">
        <RaffleMenu activeLink={activeLink} setActiveLink={setActiveLink}/>
      </div>
    </div>
  );
};
export default DashboardSideBar;
