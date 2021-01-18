import React, { Component } from "react";
import { BrowserRouter as Router /*, Switch*/ } from "react-router-dom";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";

import MainNav from "./components/MainNav";
import CookieBanner from "./components/CookieBanner";

import Pomo from "./page/Pomo";

import "bootstrap/dist/css/bootstrap.min.css";
import "./css/main.css";

class App extends Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired,
    };

    constructor(props) {
        super(props);
        const { cookies } = props;

        this.state = {
            cookies,
        };
    }
    render() {
        const { cookies } = this.state;
        return (
            <Router>
                <div id="main">
                    <MainNav></MainNav>
                    <div id="content">
                        {/*
                            <Poll cookies={cookies}></Poll>
                        */}
                        <Pomo cookies={cookies} />
                    </div>
                    <CookieBanner cookies={cookies} />
                </div>
            </Router>
        );
    }
}

export default withCookies(App);
