import React from "react";
import { render } from "@wordpress/element";
import App from './App';
window.addEventListener("load", function () {
    const data = {
        message: 'Hi Roy'

    };

    const saveData = ({data}) => {

    };
    render(
        <App data={data} saveData={saveData} />,
        document.getElementById("trustedlogin-access")
    );
});