import React, { Fragment } from "react";
import { PageHeader, SettingsPageLayout } from "./Layout";

export const TableItem = ({
  name,
  id,
  item,
  logoOnClick,
  ActionArea,
  subTitle,
  prefix = "team-",
}) => {
  return (
    <li className="py-5 flex flex-col items-center justify-between sm:py-8 sm:flex-row">
      <div className="flex w-full items-center space-x-5 sm:w-auto">
        <button
          onClick={logoOnClick}
          className="flex-shrink-0 flex items-center justify-center h-12 w-12 bg-purple-600 text-white text-sm font-medium rounded-lg">
          {name.length ? name.substring(0, 2) : "TL"}
        </button>
        <div className="flex flex-row space-x-16 items-center w-full justify-between sm:justify-start">
          <div className="flex flex-col max-w-[10rem] sm:max-w-[8rem] md:max-w-none">
            <p
              className="text-lg font-medium text-gray-900 leading-tight min-w-[6rem]"
              id={`${prefix}option-1-label`}>
              {name}
            </p>
            <p
              className="text-sm text-gray-500"
              id={`${prefix}option-1-description`}>
              {subTitle}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-5 w-full mt-4 justify-between sm:w-auto sm:mt-0">
        <div className="flex items-center space-x-6">
          <ActionArea id={id} item={item} />
        </div>
      </div>
    </li>
  );
};
export default function TablePage({
  title,
  subTitle,
  SearchArea,
  items,
  ActionArea,
  prefix = "team-",
}) {
  return (
    <SettingsPageLayout>
      <PageHeader
        title={title}
        subTitle={subTitle}
        Button={() => <SearchArea />}
      />
      <div className="flex flex-col justify-center w-full bg-white rounded-lg shadow">
        <ul
          role="list"
          className={`${prefix}list divide-y divide-gray-200 px-5 sm:px-8`}>
          {items.map((item) => {
            return (
              <Fragment key={item.id}>
                <TableItem
                  ActionArea={ActionArea}
                  item={item}
                  id={item.id}
                  name={item.name}
                  prefix={prefix}
                  subTitle={item.subTitle || item.id}
                />
              </Fragment>
            );
          })}
        </ul>
      </div>
    </SettingsPageLayout>
  );
}

export const ActionItemButton = ({ onClick, isRed, children }) => {
  return (
    <button
      onClick={onClick}
      className={`${
        isRed
          ? "text-red-500 hover:text-red-800"
          : "text-blue-tl hover:text-navy-tl"
      } text-sm p-2`}>
      {children}
    </button>
  );
};
