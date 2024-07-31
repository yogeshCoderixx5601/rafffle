import React from "react";

const RaffleMenu = ({ activeLink, setActiveLink }:any) => {
  console.log(setActiveLink, "--------setActiveLink");
  return (
    <div className="flex flex-col gap-4 p-4 bg-purple-800 rounded-lg text-white">
      <div className="">
        <div
          onClick={() => setActiveLink('user-created')}
          className={`${
            activeLink === 'user-created' ? 'active-link bg-purple-700 rounded-lg py-2 px-4 ' : 'hover:bg-purple-700 hover:rounded-lg py-2 px-4 '
          } w-full text-left cursor-pointer`}
        >
          Raffles Created
        </div>
      </div>
      <div className="">
        <div
          onClick={() => setActiveLink('user-purchesed')}
          className={`${
            activeLink === 'user-purchesed' ? 'active-link bg-purple-700 rounded-lg py-2 px-4 ' : 'hover:bg-purple-700 hover:rounded-lg py-2 px-4 '
          } w-full text-left cursor-pointer`}
        >
          Raffles Purchased
        </div>
      </div>
    </div>
  );
};

export default RaffleMenu;

