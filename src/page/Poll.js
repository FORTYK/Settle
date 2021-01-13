import React, { Component } from "react";
import axios from "axios";
//import api from "./../config/api";
import Swal from "sweetalert2";

class Poll extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pollid: null,
            question: "",
            options: [],
            totalVotes: 0,

            voted: false,
        };

        this.load = this.load.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        this.load();
    }

    load() {
        const { cookies } = this.props;

        axios.get("http://localhost:3000/api/poll/0", { withCredentials: true }).then((response) => {
            console.log("data", response.data);
            let data = response.data;
            if (data.success) {
                data = data.data;
                let totalVotes = 0;
                data.options.forEach((option) => {
                    totalVotes += option.votes;
                });

                this.setState({
                    pollid: data.id,
                    question: data.question,
                    options: data.options,
                    voted: data.voted,
                    totalVotes,
                });
            }
        });
    }

    onSelect(id) {
        let options = [...this.state.options];

        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            if (option.id === id && option.selected !== true) {
                options[i].selected = true;
            } else {
                options[i].selected = false;
            }
        }

        this.setState({
            options: options,
        });
    }

    onSubmit(e) {
        e.preventDefault();
        let self = this;

        const { options } = this.state;
        let selected = null;

        options.forEach((option) => {
            if (option.selected === true) {
                selected = option.id;
            }
        });

        axios
            .post(
                "http://localhost:3000/api/poll/vote",
                { pollid: this.state.pollid, option: selected },
                { withCredentials: true }
            )
            .then((response) => {
                response = response.data;

                if (response.success) {
                    Swal.fire(":)", "Thank you for your vote!", "success");
                    self.load();
                } else {
                    Swal.fire(":(", response.error.description, "error");
                    self.load();
                }
            });
    }

    render() {
        const { question, options, voted, totalVotes } = this.state;
        const hasVoted = voted && voted.value;
        return (
            <div className="th d-flex align-items-center">
                <div className="container">
                    <div className="row d-flex justify-content-center">
                        <div className="col-12 col-lg-8">
                            <div className="row">
                                <div className="col-12">
                                    <h1>{question}</h1>
                                </div>
                            </div>
                            <div className="poll-options-wrapper">
                                {options.map((option, i) => {
                                    return (
                                        <div key={i} className="row py-2">
                                            <div className="col-12">
                                                <div
                                                    className={
                                                        "ease-transition poll-meter" +
                                                        (voted.option === option.id ? " voted" : "") +
                                                        (option.selected ? " selected" : "") +
                                                        (hasVoted ? "" : " active")
                                                    }
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (!hasVoted) {
                                                            this.onSelect(option.id);
                                                        }
                                                    }}
                                                    disabled={hasVoted}
                                                >
                                                    {option.text}
                                                    {hasVoted
                                                        ? " (" + ((100 / totalVotes) * option.votes).toFixed(2) + "%)"
                                                        : ""}
                                                </div>
                                                {hasVoted && (
                                                    <div
                                                        className={
                                                            "poll-meter-meter" +
                                                            (voted.option === option.id ? " voted" : "")
                                                        }
                                                        style={{
                                                            width:
                                                                "calc(-30px + " +
                                                                (100 / totalVotes) * option.votes +
                                                                "%)",
                                                        }}
                                                    ></div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <span className="text-white small">{hasVoted ? totalVotes + " votes" : ""}</span>
                            </div>
                            {!voted.value && (
                                <div className="row">
                                    <div className="col-12 d-flex justify-content-between pt-3">
                                        <div></div>
                                        <button className="btn btn-default" onClick={this.onSubmit}>
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Poll;
