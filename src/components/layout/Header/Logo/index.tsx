"use client";
import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { BiMenu } from "react-icons/bi";
import { RiCloseFill } from "react-icons/ri";
import { usePathname } from "next/navigation";
import { ConnectMultiButton, useWalletAddress } from "bitcoin-wallet-adapter";
import { InnerMenu } from "..";
import { useSelector } from "react-redux";
import { RootState } from "@/stores";
import { LuSearch } from "react-icons/lu";
import { GrFormPrevious } from "react-icons/gr";

const menu = [
  {
    field: "Collections",
    link: "/collections",
  },
  { field: "Create", link: "/create" },
  {
    field: "FAQ",
    link: "/FAQ",
  },
  {
    field: "Support",
    link: "/Support",
  },
];
function Logo() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSearch, setsearch] = useState(false);

  // Function to toggle the menu
  const toggleMenu = () => {
    setMenuOpen(true);
    setsearch(false);
  };

  const toggleSearch = () => {
    setsearch(true);
  };
  console.log(isSearch, "search");
  const walletDetails = useWalletAddress();
  const pathname = usePathname();
  const isActive = (i: any) => i === pathname;
  return (
    <div className="w-full lg:w-auto border-b border-custom_bg  lg:hidden">
      {isSearch ? (
        <div className={`w-full flex justify-center items-center`}>
          <div
            className="text-white px-2 lg:hidden block text-3xl cursor-pointer"
            onClick={() =>  setsearch(false)}
          >
            <GrFormPrevious />
          </div>
        </div>
      ) : (
        <div className="lg:hidden w-full flex items-center justify-between px-2 py-6">
          <div className="flex items-center gap-4">
            <div className="cursor-pointer text-lg lg:text-[32px] font-bold  text-white shadow-lg">
              <Link href={"/"}> RAFFLE</Link>
            </div>
            
          </div>
          <div className="menu-icon text-3xl text-white cursor-pointer" onClick={toggleMenu}>
            <BiMenu />
          </div>
        </div>
      )}
      {/* Mobile Menu */}
      <aside
        className={`fixed py-24 top-0 right-0  w-2/3 h-full bg-primary  z-10 text-white  transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col px-1 gap-6">
          <div className="btn relative inline-flex items-center justify-center overflow-hidden font-medium rounded group">
            {/* <span className="w-56 h-48 rounded bg-gradient-to-b from-accent to-gradient_bg_second border border-accent absolute bottom-0 left-0 ease-out duration-500 transition-all transform -translate-x-full translate-y-full mb-9 -ml-9 group-hover:-ml-0 group-hover:mb-32 group-hover:translate-x-0 text-white"></span> */}
            <ConnectMultiButton
              modalContentClass="bg-primary border rounded-xl border-accent overflow-hidden relative lg:p-16 md:p-12 p-6"
              buttonClassname={`text-white rounded flex items-center px-4 py-[10px] ${
                walletDetails
                  ? "font-bold bg-secondary  border border-accent rounded-md "
                  : "font-light bg-gradient-to-b from-accent to-gradient_bg_second"
              }`}
              headingClass="text-center text-white pt-2 pb-2 text-3xl capitalize font-bold mb-4"
              walletItemClass="w-full bg-accent_dark my-3 hover:border-accent border border-transparent cursor-pointer"
              walletLabelClass="text-lg text-white capitalize tracking-wider"
              walletImageClass="w-[30px]"
              InnerMenu={InnerMenu}
            //   balance={balanceData?.balance}
            />
          </div>

          {/* <ul className="flex flex-col items-center text-sm font-normal text-white gap-6">
            {menu.map((link, index) => (
              <li
                key={index}
                className={
                  isActive(`${link.link}`) ? "text-accent" : "hover:text-accent"
                }
              >
                <Link href={link.link} onClick={() => setMenuOpen(false)}>
                  {link.field}
                </Link>
              </li>
            ))}
          </ul> */}
        </div>

        <div
          onClick={() => setMenuOpen(false)}
          className="absolute top-7 right-7 text-white text-3xl hover:text-brand_secondary cursor-pointer"
        >
          <RiCloseFill />
        </div>
      </aside>
    </div>
  );
}

export default Logo;