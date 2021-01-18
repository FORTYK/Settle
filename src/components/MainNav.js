import React, { Component } from "react";
import SettleLogo from "./../img/settle.png";

class MainNav extends Component {
    constructor(props) {
        super(props);
        this.state = {
            small: window.pageYOffset > 120,
        };

        this.handleScroll = this.handleScroll.bind(this);
    }
    componentDidMount() {
        window.addEventListener("scroll", this.handleScroll, { passive: true });
    }

    handleScroll(event) {
        if (window.scrollY > 155) {
            this.setState({
                small: true,
            });
        }

        if (this.state.small && window.scrollY <= 120) {
            this.setState({
                small: false,
            });
        }
    }

    render() {
        const { small } = this.state;
        return (
            <div className="main-navbar-wrapper">
                <div className="container px-0">
                    <div className="row no-gutters">
                        <div className={"col-12 py-3" + (small ? " small" : "")}>
                            <nav className={"navbar p-0 sticky-top navbar-light"}>
                                <a
                                    id="settle"
                                    className="navbar-brand main-navbar-brand d-flex align-items-center"
                                    href="#settle"
                                >
                                    <img src={SettleLogo} className="tilt ease-transition" alt="" loading="lazy" />
                                    <span className="ease-transition ml-2 settle">Settle</span>
                                </a>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default MainNav;
