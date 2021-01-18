import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

class Extrapolate extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        window.$('[data-toggle="tooltip"]').tooltip();
    }

    render() {
        const { info } = this.props;
        return (
            <span className="extrapolate" data-toggle="tooltip" data-placement="bottom" title={info}>
                <FontAwesomeIcon icon={faQuestionCircle} />
            </span>
        );
    }
}

export default Extrapolate;
