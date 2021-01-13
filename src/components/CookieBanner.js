import React, { Component } from "react";

class CookieBanner extends Component {
    constructor(props) {
        super(props);

        this.onAccept = this.onAccept.bind(this);
    }

    onAccept(e) {
        e.preventDefault();
        const { cookies } = this.props;
        cookies.set("allow-cookies", "true", { path: "/" });
    }

    render() {
        const { cookies } = this.props;
        if (cookies.get("allow-cookies") === "true") {
            return "";
        }
        return (
            <div id="comply" className="py-3 fixed-bottom">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12 d-flex justify-content-between  align-items-center">
                            <div id="">Denna hemsidan använder cookies!</div>
                            <div>
                                <button className="btn btn-white" onClick={this.onAccept}>
                                    Okej
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default CookieBanner;
