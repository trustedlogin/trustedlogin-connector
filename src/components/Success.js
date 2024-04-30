import React from "react";

export default function Success({ text }) {
  return (
    <div className="rounded-md bg-green-50 p-4 mt-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <span class="dashicons dashicons-yes-alt h-5 w-5 text-green-400"></span>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">{text}</h3>
        </div>
      </div>
    </div>
  );
}
